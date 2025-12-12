import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
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
        products: w.products,
        totalVolume: w.totalVolume,
      })),
      ...enterprises.map((e: any) => ({
        id: `enterprise-${e.id}`,
        name: e.name,
        type: 'enterprise',
        location: e.location,
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
            (window as any).ymaps.geocode(location.location).then((res: any) => {
              const firstGeoObject = res.geoObjects.get(0);
              if (firstGeoObject) {
                const coords = firstGeoObject.geometry.getCoordinates();

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
                  {
                    balloonContent: balloonContent,
                  },
                  {
                    preset: location.type === 'warehouse' ? 'islands#blueIcon' : 'islands#greenIcon',
                  }
                );
                map.geoObjects.add(placemark);
              }
            });
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
            {locations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Нет объектов для отображения
              </p>
            ) : (
              locations.map((location) => (
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
                    <p className="text-xs text-muted-foreground truncate">{location.location}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {location.type === 'warehouse' ? 'Склад' : 'Завод'}
                  </Badge>
                </div>
              ))
            )}
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
