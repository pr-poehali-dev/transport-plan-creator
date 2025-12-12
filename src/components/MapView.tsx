import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useEffect, useRef } from 'react';

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);

  const locations = [
    { id: 1, name: 'Склад "Центральный"', type: 'warehouse', lat: 55.751244, lng: 37.618423, stock: 450 },
    { id: 2, name: 'Склад "Северный"', type: 'warehouse', lat: 55.851244, lng: 37.518423, stock: 320 },
    { id: 3, name: 'Завод "ПромСнаб"', type: 'enterprise', lat: 55.651244, lng: 37.718423, production: 280 },
    { id: 4, name: 'Завод "Индустрия"', type: 'enterprise', lat: 55.791244, lng: 37.818423, production: 350 },
  ];

  useEffect(() => {
    if (!mapRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU';
    script.async = true;
    script.onload = () => {
      if (typeof window !== 'undefined' && (window as any).ymaps) {
        (window as any).ymaps.ready(() => {
          const map = new (window as any).ymaps.Map(mapRef.current, {
            center: [55.751244, 37.618423],
            zoom: 10,
            controls: ['zoomControl', 'fullscreenControl'],
          });

          locations.forEach((location) => {
            const placemark = new (window as any).ymaps.Placemark(
              [location.lat, location.lng],
              {
                balloonContent: `
                  <div style="padding: 8px;">
                    <strong>${location.name}</strong><br/>
                    <span style="color: #666;">
                      ${location.type === 'warehouse' ? `Остаток: ${location.stock} м³` : `Производство: ${location.production} м³/мес`}
                    </span>
                  </div>
                `,
              },
              {
                preset: location.type === 'warehouse' ? 'islands#blueIcon' : 'islands#greenIcon',
              }
            );
            map.geoObjects.add(placemark);
          });
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 overflow-hidden">
        <div ref={mapRef} className="w-full h-[600px] bg-muted"></div>
      </Card>

      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Icon name="MapPin" size={18} />
            Объекты на карте
          </h3>
          <div className="space-y-3">
            {locations.map((location) => (
              <div key={location.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    location.type === 'warehouse' ? 'bg-blue-100' : 'bg-green-100'
                  }`}
                >
                  <Icon
                    name={location.type === 'warehouse' ? 'Warehouse' : 'Factory'}
                    size={18}
                    className={location.type === 'warehouse' ? 'text-blue-600' : 'text-green-600'}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{location.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {location.type === 'warehouse'
                      ? `Остаток: ${location.stock} м³`
                      : `${location.production} м³/мес`}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {location.type === 'warehouse' ? 'Склад' : 'Завод'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Icon name="TrendingUp" size={18} />
            Статистика перевозок
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Сегодня</span>
              <span className="font-semibold">18 рейсов</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">На этой неделе</span>
              <span className="font-semibold">127 рейсов</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">За месяц</span>
              <span className="font-semibold">542 рейса</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
