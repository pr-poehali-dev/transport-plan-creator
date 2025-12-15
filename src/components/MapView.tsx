import { useEffect, useRef, useState } from 'react';

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const warehouses = JSON.parse(localStorage.getItem('warehouses') || '[]');
      const enterprises = JSON.parse(localStorage.getItem('enterprises') || '[]');
      const optimizedRoutes = JSON.parse(localStorage.getItem('optimizedRoutes') || '[]');

      const allLocations = [
        ...warehouses.map((w: any) => ({
          id: `warehouse-${w.id}`,
          name: w.name,
          type: 'warehouse',
          location: w.location,
          lat: w.lat,
          lng: w.lng,
          products: w.products,
        })),
        ...enterprises.map((e: any) => ({
          id: `enterprise-${e.id}`,
          name: e.name,
          type: 'enterprise',
          location: e.location,
          lat: e.lat,
          lng: e.lng,
          consumed: e.consumed || [],
        })),
      ];

      setLocations(allLocations.filter(loc => loc.lat && loc.lng));
      setRoutes(optimizedRoutes);
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapReady) return;

    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
    script.async = true;
    script.onload = () => {
      (window as any).ymaps.ready(() => {
        const map = new (window as any).ymaps.Map(mapRef.current, {
          center: [53.35, 83.77],
          zoom: 10,
          controls: ['zoomControl', 'fullscreenControl']
        });

        (mapRef.current as any)._ymapInstance = map;
        setMapReady(true);
      });
    };
    document.head.appendChild(script);

    return () => {
      if ((mapRef.current as any)?._ymapInstance) {
        (mapRef.current as any)._ymapInstance.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !(mapRef.current as any)?._ymapInstance) return;

    const map = (mapRef.current as any)._ymapInstance;
    const ymaps = (window as any).ymaps;

    map.geoObjects.removeAll();

    locations.forEach((loc) => {
      const placemark = new ymaps.Placemark(
        [loc.lat, loc.lng],
        {
          balloonContentHeader: `<strong>${loc.name}</strong>`,
          balloonContentBody: loc.location,
          hintContent: loc.name
        },
        {
          preset: loc.type === 'warehouse' ? 'islands#blueCircleDotIcon' : 'islands#greenCircleDotIcon',
          iconColor: loc.type === 'warehouse' ? '#3B82F6' : '#16A34A'
        }
      );
      map.geoObjects.add(placemark);
    });

    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
    routes.forEach((r, i) => {
      if (r.fromLat && r.fromLng && r.toLat && r.toLng) {
        // Запрос маршрута через Яндекс.Маршрутизатор
        fetch('https://functions.poehali.dev/92bc3ef0-4965-40f2-8e7e-f8edbe8dd6db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromLat: r.fromLat,
            fromLng: r.fromLng,
            toLat: r.toLat,
            toLng: r.toLng
          })
        })
          .then(res => res.json())
          .then(data => {
            const polyline = new ymaps.Polyline(
              data.coordinates || [[r.fromLat, r.fromLng], [r.toLat, r.toLng]],
              {
                balloonContent: `<strong>${r.from} → ${r.to}</strong><br/>Объём: ${r.volume} м³<br/>Расстояние: ${data.distance || r.distance} км`
              },
              {
                strokeColor: colors[i % colors.length],
                strokeWidth: 4,
                strokeOpacity: 0.8
              }
            );
            map.geoObjects.add(polyline);
          })
          .catch(() => {
            // Fallback: прямая линия
            const polyline = new ymaps.Polyline(
              [[r.fromLat, r.fromLng], [r.toLat, r.toLng]],
              {
                balloonContent: `<strong>${r.from} → ${r.to}</strong><br/>Объём: ${r.volume} м³`
              },
              {
                strokeColor: colors[i % colors.length],
                strokeWidth: 3,
                strokeOpacity: 0.6,
                strokeStyle: 'shortdash'
              }
            );
            map.geoObjects.add(polyline);
          });
      }
    });
  }, [mapReady, locations, routes]);

  return <div ref={mapRef} className="h-full w-full" />;
}