import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
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
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([53.35, 83.77], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    locations.forEach((loc) => {
      const icon = L.divIcon({
        className: 'custom-icon',
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

      L.marker([loc.lat, loc.lng], { icon }).addTo(map).bindPopup(popup);
    });

    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
    routes.forEach((r, i) => {
      if (r.fromLat && r.fromLng && r.toLat && r.toLng) {
        const url = `https://router.project-osrm.org/route/v1/driving/${r.fromLng},${r.fromLat};${r.toLng},${r.toLat}?overview=full&geometries=geojson`;
        
        fetch(url)
          .then(res => res.json())
          .then(data => {
            if (data.code === 'Ok' && data.routes?.[0]) {
              const route = data.routes[0];
              const coords = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
              const distance = (route.distance / 1000).toFixed(1);
              const duration = Math.round(route.duration / 60);
              
              L.polyline(coords, {
                color: colors[i % colors.length],
                weight: 4,
                opacity: 0.8
              }).addTo(map).bindPopup(
                `<strong>${r.from} → ${r.to}</strong><br/>` +
                `Продукт: ${r.product}<br/>` +
                `Объём: ${r.volume} м³<br/>` +
                `Расстояние: ${distance} км<br/>` +
                `Время: ~${duration} мин<br/>` +
                `<small>${r.reason || ''}</small>`
              );
            } else {
              throw new Error('OSRM error');
            }
          })
          .catch(() => {
            L.polyline(
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
  }, [locations, routes]);

  return <div ref={mapRef} className="h-full w-full" />;
}
