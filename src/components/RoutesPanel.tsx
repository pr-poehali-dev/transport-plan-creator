import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function RoutesPanel() {
  const routes = [
    {
      id: 1,
      vehicle: 'КАМАЗ 65115',
      from: 'Склад "Центральный"',
      to: 'Завод "ПромСнаб"',
      product: 'Бензин АИ-95',
      volume: 20,
      distance: 45,
      date: '12.12.2025',
      status: 'active',
    },
    {
      id: 2,
      vehicle: 'MAN TGX 18.500',
      from: 'Склад "Северный"',
      to: 'Завод "Индустрия"',
      product: 'Дизель',
      volume: 25,
      distance: 68,
      date: '12.12.2025',
      status: 'active',
    },
    {
      id: 3,
      vehicle: 'Volvo FH16',
      from: 'Склад "Южный"',
      to: 'Завод "НефтеХим"',
      product: 'Бензин АИ-92',
      volume: 30,
      distance: 52,
      date: '12.12.2025',
      status: 'completed',
    },
    {
      id: 4,
      vehicle: 'КАМАЗ 43118',
      from: 'Склад "Центральный"',
      to: 'Завод "ПромСнаб"',
      product: 'Бензин АИ-92',
      volume: 18,
      distance: 45,
      date: '13.12.2025',
      status: 'planned',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Активные</p>
              <p className="text-3xl font-bold mt-1">28</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Icon name="Route" size={24} className="text-green-500" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Запланировано</p>
              <p className="text-3xl font-bold mt-1">15</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Icon name="Calendar" size={24} className="text-blue-500" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Завершено сегодня</p>
              <p className="text-3xl font-bold mt-1">18</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={24} className="text-purple-500" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Общий пробег</p>
              <p className="text-3xl font-bold mt-1">2,450</p>
              <p className="text-xs text-muted-foreground">км</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={24} className="text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Маршруты перевозок</h3>
            <Button>
              <Icon name="Plus" size={16} className="mr-2" />
              Создать маршрут
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ТС</TableHead>
                <TableHead>Откуда</TableHead>
                <TableHead>Куда</TableHead>
                <TableHead>Продукция</TableHead>
                <TableHead>Объем</TableHead>
                <TableHead>Расстояние</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">{route.vehicle}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon name="MapPin" size={14} className="text-blue-500" />
                      <span className="text-sm">{route.from}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon name="MapPin" size={14} className="text-green-500" />
                      <span className="text-sm">{route.to}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{route.product}</TableCell>
                  <TableCell>
                    <span className="font-semibold">{route.volume} м³</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{route.distance} км</TableCell>
                  <TableCell className="text-sm">{route.date}</TableCell>
                  <TableCell>
                    {route.status === 'active' && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        В пути
                      </Badge>
                    )}
                    {route.status === 'completed' && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        Завершен
                      </Badge>
                    )}
                    {route.status === 'planned' && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Запланирован
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm">
                        <Icon name="MapPin" size={16} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Icon name="MoreHorizontal" size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
