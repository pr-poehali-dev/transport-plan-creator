import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const warehouseIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIGZpbGw9IiMzQjgyRjYiLz4KPHBhdGggZD0iTTEyIDI4VjE2TDIwIDEyTDI4IDE2VjI4SDI0VjIySDIwVjI4SDEyWiIgZmlsbD0id2hpdGUiLz4KPHJlY3QgeD0iMTQiIHk9IjE4IiB3aWR0aD0iMyIgaGVpZ2h0PSIzIiBmaWxsPSIjM0I4MkY2Ii8+CjxyZWN0IHg9IjIzIiB5PSIxOCIgd2lkdGg9IjMiIGhlaWdodD0iMyIgZmlsbD0iIzNCODJGNiIvPgo8L3N2Zz4=',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const enterpriseIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIGZpbGw9IiMxNkEzNEEiLz4KPHBhdGggZD0iTTEyIDI2VjE4SDEzVjE0SDEyVjEySDI4VjE0SDI3VjE4SDI4VjI2SDI3VjI4SDEzVjI2SDEyWiIgZmlsbD0id2hpdGUiLz4KPHJlY3QgeD0iMTUiIHk9IjE0IiB3aWR0aD0iMiIgaGVpZ2h0PSI0IiBmaWxsPSIjMTZBMzRBIi8+CjxyZWN0IHg9IjE5IiB5PSIxNCIgd2lkdGg9IjIiIGhlaWdodD0iNCIgZmlsbD0iIzE2QTM0QSIvPgo8cmVjdCB4PSIyMyIgeT0iMTQiIHdpZHRoPSIyIiBoZWlnaHQ9IjQiIGZpbGw9IiMxNkEzNEEiLz4KPHJlY3QgeD0iMTUiIHk9IjIwIiB3aWR0aD0iMiIgaGVpZ2h0PSI0IiBmaWxsPSIjMTZBMzRBIi8+CjxyZWN0IHg9IjE5IiB5PSIyMCIgd2lkdGg9IjIiIGhlaWdodD0iNCIgZmlsbD0iIzE2QTM0QSIvPgo8cmVjdCB4PSIyMyIgeT0iMjAiIHdpZHRoPSIyIiBoZWlnaHQ9IjQiIGZpbGw9IiMxNkEzNEEiLz4KPHBhdGggZD0iTTE0IDEyTDE3IDEwTDIzIDEwTDI2IDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8L3N2Zz4=',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

export default function MapView() {
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
          consumed: e.consumed || [],
          produced: e.produced || [],
          storage: e.storage || [],
        })),
      ];

      setLocations(allLocations.filter(loc => loc.lat && loc.lng));
      setRoutes(optimizedRoutes);
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const routeColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[53.35, 83.77]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={location.type === 'warehouse' ? warehouseIcon : enterpriseIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong className="text-base">{location.name}</strong>
                <br />
                <span className="text-gray-600">{location.location}</span>
                <br /><br />

                {location.type === 'warehouse' && location.products && (
                  <>
                    <strong>Остатки:</strong>
                    <br />
                    {location.products.map((p: any, idx: number) => {
                      const latestData = p.monthlyData?.[p.monthlyData.length - 1];
                      return (
                        <div key={idx} className="text-xs">
                          • {p.product}: {latestData?.volume || 0} м³
                        </div>
                      );
                    })}
                    <br />
                    <strong>Общий объем:</strong> {location.totalVolume} м³
                  </>
                )}

                {location.type === 'enterprise' && (
                  <>
                    <strong>Потребление:</strong>
                    <br />
                    {location.consumed.map((c: any, idx: number) => {
                      const latestData = c.monthlyData?.[c.monthlyData.length - 1];
                      return (
                        <div key={idx} className="text-xs">
                          • {c.product}: {latestData?.volume || 0} м³/мес
                        </div>
                      );
                    })}
                    <br />
                    <strong>Производство:</strong>
                    <br />
                    {location.produced.map((p: any, idx: number) => {
                      const latestData = p.monthlyData?.[p.monthlyData.length - 1];
                      return (
                        <div key={idx} className="text-xs">
                          • {p.product}: {latestData?.volume || 0} м³/мес
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {routes.map((route, index) => {
          if (route.fromLat && route.fromLng && route.toLat && route.toLng) {
            return (
              <Polyline
                key={index}
                positions={[
                  [route.fromLat, route.fromLng],
                  [route.toLat, route.toLng],
                ]}
                color={routeColors[index % routeColors.length]}
                weight={4}
                opacity={0.7}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>Маршрут #{index + 1}</strong>
                    <br />
                    <strong>Продукт:</strong> {route.product}
                    <br />
                    <strong>Откуда:</strong> {route.from}
                    <br />
                    <strong>Куда:</strong> {route.to}
                    <br />
                    <strong>Объём:</strong> {route.volume} м³
                    <br />
                    <strong>Расстояние:</strong> {route.distance} км
                    {route.vehicle && (
                      <>
                        <br /><br />
                        <strong>Автомобиль:</strong>
                        <br />
                        {route.vehicle.brand} ({route.vehicle.licensePlate})
                        <br />
                        Вместимость: {route.vehicle.volume} м³
                      </>
                    )}
                  </div>
                </Popup>
              </Polyline>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}
