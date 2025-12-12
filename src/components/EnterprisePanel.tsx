import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function EnterprisePanel() {
  const enterprises = [
    {
      id: 1,
      name: 'Завод "ПромСнаб"',
      location: 'Москва, Каширское шоссе 45',
      consumedProduct: 'Нефть',
      consumedVolume: 280,
      producedProduct: 'Бензин АИ-95',
      producedVolume: 180,
      monthlyConsumption: 280,
      monthlyProduction: 180,
    },
    {
      id: 2,
      name: 'Завод "Индустрия"',
      location: 'Подольск, Промышленная зона 12',
      consumedProduct: 'Нефть',
      consumedVolume: 350,
      producedProduct: 'Дизель',
      producedVolume: 220,
      monthlyConsumption: 350,
      monthlyProduction: 220,
    },
    {
      id: 3,
      name: 'Завод "НефтеХим"',
      location: 'Химки, Заводской проезд 8',
      consumedProduct: 'Нефть',
      consumedVolume: 420,
      producedProduct: 'Бензин АИ-92',
      producedVolume: 280,
      monthlyConsumption: 420,
      monthlyProduction: 280,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Всего предприятий</p>
              <p className="text-3xl font-bold mt-1">8</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Icon name="Factory" size={24} className="text-green-500" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Потребление/мес</p>
              <p className="text-3xl font-bold mt-1">1,050</p>
              <p className="text-xs text-muted-foreground">м³</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Icon name="TrendingDown" size={24} className="text-orange-500" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Производство/мес</p>
              <p className="text-3xl font-bold mt-1">680</p>
              <p className="text-xs text-muted-foreground">м³</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={24} className="text-blue-500" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Список предприятий</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Адрес</TableHead>
                <TableHead>Потребление</TableHead>
                <TableHead>Производство</TableHead>
                <TableHead>Объем/месяц</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enterprises.map((enterprise) => (
                <TableRow key={enterprise.id}>
                  <TableCell className="font-medium">{enterprise.name}</TableCell>
                  <TableCell className="text-muted-foreground">{enterprise.location}</TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div className="font-medium">{enterprise.consumedProduct}</div>
                      <div className="text-muted-foreground">{enterprise.consumedVolume} м³</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div className="font-medium">{enterprise.producedProduct}</div>
                      <div className="text-muted-foreground">{enterprise.producedVolume} м³</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      <div className="text-orange-600">↓ {enterprise.monthlyConsumption} м³</div>
                      <div className="text-green-600">↑ {enterprise.monthlyProduction} м³</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm">
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Icon name="MapPin" size={16} />
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
