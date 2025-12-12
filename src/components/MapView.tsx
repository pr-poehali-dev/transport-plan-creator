import { useEffect, useRef, useState } from 'react';

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    const warehouses = JSON.parse(localStorage.getItem('warehouses') || '[]');
    const enterprises = JSON.parse(localStorage.getItem('enterprises') || '[]');

    const allLocations = [
      ...warehouses.map((w: any) => ({
        id: `warehouse-${w.id}`,
        name: w.name,
        type: 'warehouse',
        location: w.location,
        lat: w.lat,
        lng: w.lng,
        products: w.products,
        totalVolume: w.totalVolume,
      })),
      ...enterprises.map((e: any) => ({
        id: `enterprise-${e.id}`,
        name: e.name,
        type: 'enterprise',
        location: e.location,
        lat: e.lat,
        lng: e.lng,
        consumed: e.consumed || [{ product: e.consumedProduct, volume: e.consumedVolume }],
        produced: e.produced || [{ product: e.producedProduct, volume: e.producedVolume }],
      })),
    ];

    setLocations(allLocations);
  }, []);

  useEffect(() => {
    if (!mapRef.current || locations.length === 0) return;

    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU';
    script.async = true;
    script.onload = () => {
      if (typeof window !== 'undefined' && (window as any).ymaps) {
        (window as any).ymaps.ready(() => {
          const map = new (window as any).ymaps.Map(mapRef.current, {
            center: [53.35, 83.77],
            zoom: 10,
            controls: ['zoomControl', 'fullscreenControl'],
          });

          locations.forEach((location) => {
            const createMarker = (coords: number[]) => {
              let balloonContent = `<div style="padding: 8px; max-width: 250px;">
                <strong>${location.name}</strong><br/>
                <span style="color: #666; font-size: 12px;">${location.location}</span><br/><br/>`;

              if (location.type === 'warehouse') {
                balloonContent += '<strong>Остатки:</strong><br/>';
                location.products.forEach((p: any) => {
                  balloonContent += `<span style="font-size: 12px;">• ${p.product}: ${p.volume} м³</span><br/>`;
                });
                balloonContent += `<br/><strong>Общий объем:</strong> ${location.totalVolume} м³`;
              } else {
                balloonContent += '<strong>Потребление:</strong><br/>';
                location.consumed.forEach((c: any) => {
                  balloonContent += `<span style="font-size: 12px;">• ${c.product}: ${c.volume} м³/мес</span><br/>`;
                });
                balloonContent += '<br/><strong>Производство:</strong><br/>';
                location.produced.forEach((p: any) => {
                  balloonContent += `<span style="font-size: 12px;">• ${p.product}: ${p.volume} м³/мес</span><br/>`;
                });
              }

              balloonContent += '</div>';

              const placemark = new (window as any).ymaps.Placemark(
                coords,
                { balloonContent: balloonContent },
                { preset: location.type === 'warehouse' ? 'islands#blueIcon' : 'islands#greenIcon' }
              );
              map.geoObjects.add(placemark);
            };

            if (location.lat && location.lng) {
              createMarker([location.lat, location.lng]);
            } else {
              (window as any).ymaps.geocode(location.location).then((res: any) => {
                const firstGeoObject = res.geoObjects.get(0);
                if (firstGeoObject) {
                  const coords = firstGeoObject.geometry.getCoordinates();
                  createMarker(coords);
                }
              });
            }
          });
        });
      }
    };
    
    const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]');
    if (!existingScript) {
      document.head.appendChild(script);
    } else if ((window as any).ymaps) {
      script.onload(new Event('load'));
    }

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [locations]);

  return <div ref={mapRef} className="w-full h-full bg-muted"></div>;
}