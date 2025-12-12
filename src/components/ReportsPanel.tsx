import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ReportsPanel() {
  const monthlyData = [
    { month: 'Янв', routes: 420, volume: 8400 },
    { month: 'Фев', routes: 385, volume: 7700 },
    { month: 'Мар', routes: 445, volume: 8900 },
    { month: 'Апр', routes: 460, volume: 9200 },
    { month: 'Май', routes: 490, volume: 9800 },
    { month: 'Июн', routes: 510, volume: 10200 },
    { month: 'Июл', routes: 535, volume: 10700 },
    { month: 'Авг', routes: 520, volume: 10400 },
    { month: 'Сен', routes: 495, volume: 9900 },
    { month: 'Окт', routes: 480, volume: 9600 },
    { month: 'Ноя', routes: 465, volume: 9300 },
    { month: 'Дек', routes: 542, volume: 10840 },
  ];

  const maxVolume = Math.max(...monthlyData.map((d) => d.volume));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Рейсов за год</p>
              <p className="text-3xl font-bold mt-1">5,747</p>
              <p className="text-xs text-green-600 mt-1">+12% к прошлому году</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={24} className="text-green-500" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Перевезено за год</p>
              <p className="text-3xl font-bold mt-1">114,940</p>
              <p className="text-xs text-muted-foreground">м³</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Icon name="Package" size={24} className="text-blue-500" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Пробег за год</p>
              <p className="text-3xl font-bold mt-1">287,350</p>
              <p className="text-xs text-muted-foreground">км</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Icon name="Gauge" size={24} className="text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Аналитика перевозок за 2025 год</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Icon name="Download" size={16} className="mr-2" />
              Excel
            </Button>
            <Button variant="outline" size="sm">
              <Icon name="FileText" size={16} className="mr-2" />
              PDF
            </Button>
          </div>
        </div>

        <Tabs defaultValue="volume" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="volume">Объем перевозок</TabsTrigger>
            <TabsTrigger value="routes">Количество рейсов</TabsTrigger>
          </TabsList>

          <TabsContent value="volume" className="space-y-4">
            <div className="h-80 flex items-end gap-4">
              {monthlyData.map((data, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col justify-end h-64">
                    <div
                      className="w-full bg-primary rounded-t-lg relative group cursor-pointer hover:bg-primary/80 transition-colors"
                      style={{ height: `${(data.volume / maxVolume) * 100}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                          {data.volume.toLocaleString()} м³
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{data.month}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="routes" className="space-y-4">
            <div className="h-80 flex items-end gap-4">
              {monthlyData.map((data, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col justify-end h-64">
                    <div
                      className="w-full bg-green-500 rounded-t-lg relative group cursor-pointer hover:bg-green-600 transition-colors"
                      style={{ height: `${(data.routes / 600) * 100}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                          {data.routes} рейсов
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{data.month}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Icon name="Award" size={18} />
            Эффективность по предприятиям
          </h3>
          <div className="space-y-4">
            {[
              { name: 'Завод "НефтеХим"', routes: 145, efficiency: 98 },
              { name: 'Завод "Индустрия"', routes: 132, efficiency: 95 },
              { name: 'Завод "ПромСнаб"', routes: 128, efficiency: 92 },
            ].map((enterprise, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{enterprise.name}</span>
                  <span className="text-sm font-bold text-primary">{enterprise.efficiency}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${enterprise.efficiency}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{enterprise.routes} рейсов за месяц</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Icon name="Truck" size={18} />
            Загрузка автопарка
          </h3>
          <div className="space-y-4">
            {[
              { type: 'КАМАЗ', count: 18, loaded: 16 },
              { type: 'MAN', count: 12, loaded: 11 },
              { type: 'Volvo', count: 15, loaded: 11 },
            ].map((vehicle, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{vehicle.type}</span>
                  <span className="text-sm">
                    {vehicle.loaded}/{vehicle.count}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(vehicle.loaded / vehicle.count) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((vehicle.loaded / vehicle.count) * 100)}% загруженность
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
