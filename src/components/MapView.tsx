import { useEffect, useRef, useState } from 'react';

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

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
          storage: e.storage || [],
        })),
      ];

      setLocations(allLocations);
      setRoutes(optimizedRoutes);
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  useEffect(() => {
    if (!mapRef.current || locations.length === 0) return;

    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU&load=package.full';
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
                
                if (location.storage && location.storage.length > 0) {
                  balloonContent += '<br/><strong>Склады при предприятии:</strong><br/>';
                  const rawStorage = location.storage.filter((s: any) => s.type === 'raw');
                  const finishedStorage = location.storage.filter((s: any) => s.type === 'finished');
                  
                  if (rawStorage.length > 0) {
                    balloonContent += '<span style="font-size: 11px; color: #888;">Сырье:</span><br/>';
                    rawStorage.forEach((s: any) => {
                      balloonContent += `<span style="font-size: 12px;">• ${s.product}: ${s.volume} м³</span><br/>`;
                    });
                  }
                  
                  if (finishedStorage.length > 0) {
                    balloonContent += '<span style="font-size: 11px; color: #888;">Готовая продукция:</span><br/>';
                    finishedStorage.forEach((s: any) => {
                      balloonContent += `<span style="font-size: 12px;">• ${s.product}: ${s.volume} м³</span><br/>`;
                    });
                  }
                }
              }

              balloonContent += '</div>';

              const placemarkOptions: any = {
                iconLayout: 'default#image',
                iconImageSize: [40, 40],
                iconImageOffset: [-20, -40],
                iconCaptionMaxWidth: '200'
              };

              if (location.type === 'warehouse') {
                placemarkOptions.iconImageHref = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIGZpbGw9IiMzQjgyRjYiLz4KPHBhdGggZD0iTTEyIDI4VjE2TDIwIDEyTDI4IDE2VjI4SDI0VjIySDIwVjI4SDEyWiIgZmlsbD0id2hpdGUiLz4KPHJlY3QgeD0iMTQiIHk9IjE4IiB3aWR0aD0iMyIgaGVpZ2h0PSIzIiBmaWxsPSIjM0I4MkY2Ii8+CjxyZWN0IHg9IjIzIiB5PSIxOCIgd2lkdGg9IjMiIGhlaWdodD0iMyIgZmlsbD0iIzNCODJGNiIvPgo8L3N2Zz4=';
              } else {
                placemarkOptions.iconImageHref = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIGZpbGw9IiMxNkEzNEEiLz4KPHBhdGggZD0iTTEyIDI2VjE4SDEzVjE0SDEyVjEySDI4VjE0SDI3VjE4SDI4VjI2SDI3VjI4SDEzVjI2SDEyWiIgZmlsbD0id2hpdGUiLz4KPHJlY3QgeD0iMTUiIHk9IjE0IiB3aWR0aD0iMiIgaGVpZ2h0PSI0IiBmaWxsPSIjMTZBMzRBIi8+CjxyZWN0IHg9IjE5IiB5PSIxNCIgd2lkdGg9IjIiIGhlaWdodD0iNCIgZmlsbD0iIzE2QTM0QSIvPgo8cmVjdCB4PSIyMyIgeT0iMTQiIHdpZHRoPSIyIiBoZWlnaHQ9IjQiIGZpbGw9IiMxNkEzNEEiLz4KPHJlY3QgeD0iMTUiIHk9IjIwIiB3aWR0aD0iMiIgaGVpZ2h0PSI0IiBmaWxsPSIjMTZBMzRBIi8+CjxyZWN0IHg9IjE5IiB5PSIyMCIgd2lkdGg9IjIiIGhlaWdodD0iNCIgZmlsbD0iIzE2QTM0QSIvPgo8cmVjdCB4PSIyMyIgeT0iMjAiIHdpZHRoPSIyIiBoZWlnaHQ9IjQiIGZpbGw9IiMxNkEzNEEiLz4KPHBhdGggZD0iTTE0IDEyTDE3IDEwTDIzIDEwTDI2IDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8L3N2Zz4=';
              }

              const placemark = new (window as any).ymaps.Placemark(
                coords,
                { 
                  balloonContent: balloonContent,
                  iconCaption: location.name
                },
                placemarkOptions
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

          routes.forEach((route, index) => {
            if (route.fromLat && route.fromLng && route.toLat && route.toLng) {
              const multiRoute = new (window as any).ymaps.multiRouter.MultiRoute(
                {
                  referencePoints: [
                    [route.fromLat, route.fromLng],
                    [route.toLat, route.toLng]
                  ],
                  params: {
                    routingMode: 'auto'
                  }
                },
                {
                  boundsAutoApply: false,
                  wayPointVisible: false,
                  routeActiveStrokeWidth: 5,
                  routeActiveStrokeStyle: 'solid',
                  routeActiveStrokeColor: `hsl(${(index * 40) % 360}, 70%, 50%)`,
                  routeStrokeWidth: 4,
                  routeStrokeStyle: 'solid',
                  routeStrokeColor: `hsl(${(index * 40) % 360}, 70%, 50%)`,
                }
              );

              multiRoute.model.events.add('requestsuccess', () => {
                const activeRoute = multiRoute.getActiveRoute();
                if (activeRoute) {
                  const balloonContent = `
                    <div style="padding: 8px; max-width: 250px;">
                      <strong style="color: hsl(${(index * 40) % 360}, 70%, 40%);">${route.product}</strong><br/>
                      <span style="font-size: 12px;">От: ${route.from}</span><br/>
                      <span style="font-size: 12px;">До: ${route.to}</span><br/>
                      <span style="font-size: 12px;">Объём: ${route.volume} м³</span><br/>
                      <span style="font-size: 12px;">Расстояние: ${route.distance} км</span>
                      ${route.vehicle ? `<br/><br/><strong>Автомобиль:</strong><br/><span style="font-size: 11px;">${route.vehicle.brand} (${route.vehicle.licensePlate})</span>` : ''}
                    </div>
                  `;
                  
                  activeRoute.properties.set('balloonContent', balloonContent);
                }
              });

              map.geoObjects.add(multiRoute);
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
  }, [locations, routes]);

  return <div ref={mapRef} className="w-full h-full bg-muted"></div>;
}