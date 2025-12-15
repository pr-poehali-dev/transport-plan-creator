import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface RouteOptimizationProps {
  onShowOnMap?: () => void;
}

export default function RouteOptimization({ onShowOnMap }: RouteOptimizationProps) {
  const [selectedMonth, setSelectedMonth] = useState('Январь 2025');
  const [isCalculating, setIsCalculating] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);

  const MONTHS = [
    'Январь 2025', 'Февраль 2025', 'Март 2025', 'Апрель 2025',
    'Май 2025', 'Июнь 2025', 'Июль 2025', 'Август 2025',
    'Сентябрь 2025', 'Октябрь 2025', 'Ноябрь 2025', 'Декабрь 2025'
  ];

  const handleOptimize = async () => {
    setIsCalculating(true);
    
    const warehouses = JSON.parse(localStorage.getItem('warehouses') || '[]');
    const enterprises = JSON.parse(localStorage.getItem('enterprises') || '[]');
    const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');

    console.log('=== НАЧАЛО РАСЧЁТА ===');
    console.log('Склады:', warehouses);
    console.log('Предприятия:', enterprises);
    console.log('Транспорт:', vehicles);

    if (warehouses.length === 0 || enterprises.length === 0) {
      toast({
        title: 'Недостаточно данных',
        description: 'Добавьте склады и предприятия для расчёта маршрутов',
        variant: 'destructive',
      });
      setIsCalculating(false);
      return;
    }

    try {
      const warehouseStocks = warehouses.map((w: any) => {
        const monthlyStocks: any = {};
        if (w.products && Array.isArray(w.products)) {
          w.products.forEach((p: any) => {
            if (p.monthlyData && Array.isArray(p.monthlyData)) {
              const monthData = p.monthlyData.find((m: any) => m.month === selectedMonth);
              if (monthData) {
                monthlyStocks[p.product] = monthData.volume;
              }
            }
          });
        }
        console.log(`Склад ${w.name}: координаты lat=${w.lat}, lng=${w.lng}`);
        return {
          id: w.id,
          name: w.name,
          location: w.location,
          lat: w.lat,
          lng: w.lng,
          stocks: monthlyStocks,
        };
      });

      const enterpriseNeeds = enterprises.map((e: any) => {
        const monthlyNeeds: any = {};
        if (e.consumed && Array.isArray(e.consumed)) {
          e.consumed.forEach((c: any) => {
            if (c.monthlyData && Array.isArray(c.monthlyData)) {
              const monthData = c.monthlyData.find((m: any) => m.month === selectedMonth);
              if (monthData) {
                monthlyNeeds[c.product] = monthData.volume;
              }
            }
          });
        }
        console.log(`Предприятие ${e.name}: координаты lat=${e.lat}, lng=${e.lng}`);
        return {
          id: e.id,
          name: e.name,
          location: e.location,
          lat: e.lat,
          lng: e.lng,
          needs: monthlyNeeds,
        };
      });

      const hasWarehouseData = warehouseStocks.some((w: any) => Object.keys(w.stocks).length > 0);
      const hasEnterpriseData = enterpriseNeeds.some((e: any) => Object.keys(e.needs).length > 0);

      if (!hasWarehouseData || !hasEnterpriseData) {
        toast({
          title: 'Нет данных за выбранный месяц',
          description: `Добавьте остатки на складах и потребности предприятий за ${selectedMonth}`,
          variant: 'destructive',
        });
        setIsCalculating(false);
        return;
      }

      const response = await fetch('https://functions.poehali.dev/731429fc-10d1-48ba-8c78-e761ff3f835f', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: selectedMonth,
          warehouses: warehouseStocks,
          enterprises: enterpriseNeeds,
          vehicles: vehicles,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при расчёте маршрутов');
      }

      const data = await response.json();
      console.log('RouteOptimization: получен ответ от бэкенда:', data);
      console.log('RouteOptimization: маршруты:', data.routes);
      
      setRoutes(data.routes || []);
      
      if (data.routes && data.routes.length > 0) {
        console.log('RouteOptimization: сохраняем маршруты в localStorage');
        localStorage.setItem('optimizedRoutes', JSON.stringify(data.routes));
        window.dispatchEvent(new Event('storage'));
        console.log('RouteOptimization: отправлен storage event');
      }

      if (data.routes && data.routes.length > 0) {
        toast({
          title: 'Маршруты рассчитаны',
          description: `Найдено ${data.routes.length} оптимальных маршрутов`,
        });
      } else {
        const debugInfo = data.debug || {};
        const warehousesWithStocks = debugInfo.warehouses?.filter((w: any) => w.total_products > 0) || [];
        const enterprisesWithNeeds = debugInfo.enterprises?.filter((e: any) => e.total_products > 0) || [];
        
        toast({
          title: 'Маршруты не найдены',
          description: `Проверьте данные: складов с товаром - ${warehousesWithStocks.length}, предприятий с потребностями - ${enterprisesWithNeeds.length}`,
          variant: 'destructive',
        });
        
        console.log('Debug info:', debugInfo);
      }
    } catch (error) {
      console.error('Error optimizing routes:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось рассчитать маршруты. Проверьте настройки.',
        variant: 'destructive',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Route" size={24} className="text-primary" />
          <h2 className="text-2xl font-bold">Оптимизация маршрутов с ИИ</h2>
        </div>

        <p className="text-muted-foreground mb-6">
          Искусственный интеллект рассчитает оптимальные маршруты доставки на основе остатков на
          складах, потребностей предприятий и расстояний между точками.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label>Выберите месяц для расчёта</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleOptimize}
            disabled={isCalculating}
            size="lg"
            className="flex-1 md:flex-none md:w-auto"
          >
            {isCalculating ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Расчёт маршрутов...
              </>
            ) : (
              <>
                <Icon name="Sparkles" size={16} className="mr-2" />
                Рассчитать оптимальные маршруты
              </>
            )}
          </Button>
          
          <Button
            onClick={() => {
              localStorage.removeItem('warehouses');
              localStorage.removeItem('enterprises');
              localStorage.removeItem('vehicles');
              window.location.reload();
            }}
            variant="outline"
            size="lg"
          >
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Сбросить данные
          </Button>
        </div>
      </Card>

      {routes.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Рекомендуемые маршруты</h3>
            {onShowOnMap && (
              <Button variant="outline" size="sm" onClick={onShowOnMap}>
                <Icon name="Map" size={16} className="mr-2" />
                Показать на карте
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {routes.map((route, index) => (
              <Card key={index} className="p-4 border-l-4 border-l-primary">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Маршрут #{index + 1}</Badge>
                    <Badge variant="secondary">{route.product}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Расстояние</div>
                    <div className="font-semibold">{route.distance} км</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Откуда</div>
                    <div className="font-medium">{route.from}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Куда</div>
                    <div className="font-medium">{route.to}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Объём</div>
                    <div className="font-medium">{route.volume} м³</div>
                  </div>
                </div>
                {route.vehicle && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                    <Icon name="Truck" size={12} className="inline mr-1 text-blue-600" />
                    <span className="font-semibold">Автомобиль:</span> {route.vehicle.brand} ({route.vehicle.licensePlate}) - {route.vehicle.volume} м³
                  </div>
                )}
                {route.reason && (
                  <div className="mt-2 p-2 bg-muted rounded text-xs">
                    <Icon name="Info" size={12} className="inline mr-1" />
                    {route.reason}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}