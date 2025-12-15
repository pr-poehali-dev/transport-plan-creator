import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    DG: any;
  }
}

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

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://maps.api.2gis.ru/2.0/css/DGCustomization.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full';
    script.async = true;
    script.onload = () => {
      window.DG.then(() => {
        const map = window.DG.map(mapRef.current, {
          center: [53.35, 83.77],
          zoom: 10
        });

        (mapRef.current as any)._dgMapInstance = map;
        setMapReady(true);
      });
    };
    document.head.appendChild(script);

    return () => {
      if ((mapRef.current as any)?._dgMapInstance) {
        (mapRef.current as any)._dgMapInstance.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !(mapRef.current as any)?._dgMapInstance) return;

    const map = (mapRef.current as any)._dgMapInstance;
    const DG = window.DG;

    // Удаляем старые слои
    map.eachLayer((layer: any) => {
      if (layer instanceof DG.Marker || layer instanceof DG.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Добавляем маркеры
    locations.forEach((loc) => {
      const icon = DG.divIcon({
        html: `<div style="width:40px;height:40px;background:${loc.type === 'warehouse' ? '#3B82F6' : '#16A34A'};border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:20px;">${loc.type === 'warehouse' ? '📦' : '🏭'}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      });

      let popup = `<strong>${loc.name}</strong><br/>${loc.location}<br/><br/>`;
      if (loc.type === 'warehouse' && loc.products) {
        popup += '<strong>Остатки:</strong><br/>';
        loc.products.forEach((p: any) => {
          const vol = p.monthlyData?.[p.monthlyData.length - 1]?.volume || 0;
          popup += `• ${p.product}: ${vol} м³<br/>`;
        });
      } else if (loc.type === 'enterprise') {
        popup += '<strong>Потребление:</strong><br/>';
        loc.consumed.forEach((c: any) => {
          const vol = c.monthlyData?.[c.monthlyData.length - 1]?.volume || 0;
          popup += `• ${c.product}: ${vol} м³/мес<br/>`;
        });
      }

      DG.marker([loc.lat, loc.lng], { icon }).addTo(map).bindPopup(popup);
    });

    // Строим маршруты через 2GIS API
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
    routes.forEach((r, i) => {
      if (r.fromLat && r.fromLng && r.toLat && r.toLng) {
        fetch('https://functions.poehali.dev/4f2932d6-0c4c-4de7-aa20-8cc79feb8d6f', {
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
            const coords = data.coordinates || [[r.fromLat, r.fromLng], [r.toLat, r.toLng]];
            const polyline = DG.polyline(coords, {
              color: colors[i % colors.length],
              weight: 4,
              opacity: 0.8
            }).addTo(map);

            polyline.bindPopup(
              `<strong>${r.from} → ${r.to}</strong><br/>` +
              `Продукт: ${r.product}<br/>` +
              `Объём: ${r.volume} м³<br/>` +
              `Расстояние: ${data.distance || r.distance} км<br/>` +
              `<small>${r.reason || ''}</small>`
            );
          })
          .catch(() => {
            // Fallback: прямая линия
            DG.polyline(
              [[r.fromLat, r.fromLng], [r.toLat, r.toLng]],
              {
                color: colors[i % colors.length],
                weight: 3,
                opacity: 0.6,
                dashArray: '10, 10'
              }
            ).addTo(map).bindPopup(
              `<strong>${r.from} → ${r.to}</strong><br/>` +
              `Объём: ${r.volume} м³`
            );
          });
      }
    });
  }, [mapReady, locations, routes]);

  return <div ref={mapRef} className="h-full w-full" />;
}
