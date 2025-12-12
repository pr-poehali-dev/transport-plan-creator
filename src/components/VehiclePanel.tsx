import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';

export default function VehiclePanel() {
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      brand: 'КАМАЗ 65115',
      trailerType: 'Цистерна',
      volume: 20,
      productTypes: ['Бензин АИ-95', 'Бензин АИ-92'],
      enterprise: 'Завод "ПромСнаб"',
      schedule: '5/2 (8:00-20:00)',
      status: 'active',
    },
    {
      id: 2,
      brand: 'MAN TGX 18.500',
      trailerType: 'Цистерна',
      volume: 25,
      productTypes: ['Дизель'],
      enterprise: 'Завод "Индустрия"',
      schedule: '24/7',
      status: 'active',
    },
    {
      id: 3,
      brand: 'Volvo FH16',
      trailerType: 'Цистерна',
      volume: 30,
      productTypes: ['Бензин АИ-95', 'Дизель'],
      enterprise: 'Завод "НефтеХим"',
      schedule: '6/1 (7:00-19:00)',
      status: 'active',
    },
    {
      id: 4,
      brand: 'КАМАЗ 43118',
      trailerType: 'Цистерна',
      volume: 18,
      productTypes: ['Бензин АИ-92'],
      enterprise: 'Завод "ПромСнаб"',
      schedule: '5/2 (9:00-18:00)',
      status: 'maintenance',
    },
  ]);

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      setVehicles(vehicles.filter((v) => v.id !== deleteId));
      toast({
        title: 'Автомобиль удален',
        description: 'Транспортное средство успешно удалено из автопарка',
      });
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Всего ТС</p>
              <p className="text-3xl font-bold mt-1">45</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Icon name="Truck" size={24} className="text-orange-500" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">На линии</p>
              <p className="text-3xl font-bold mt-1">38</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Icon name="Activity" size={24} className="text-green-500" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">В обслуживании</p>
              <p className="text-3xl font-bold mt-1">7</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Icon name="Wrench" size={24} className="text-yellow-500" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Общая загрузка</p>
              <p className="text-3xl font-bold mt-1">87%</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Icon name="BarChart3" size={24} className="text-blue-500" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Автопарк</h3>
            <Button variant="outline" size="sm">
              <Icon name="Upload" size={16} className="mr-2" />
              Импорт из Excel
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Марка</TableHead>
                <TableHead>Тип прицепа</TableHead>
                <TableHead>Объем</TableHead>
                <TableHead>Виды продукции</TableHead>
                <TableHead>Предприятие</TableHead>
                <TableHead>График работы</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.brand}</TableCell>
                  <TableCell className="text-muted-foreground">{vehicle.trailerType}</TableCell>
                  <TableCell>
                    <span className="font-semibold">{vehicle.volume} м³</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {vehicle.productTypes.map((product, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {product}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{vehicle.enterprise}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{vehicle.schedule}</TableCell>
                  <TableCell>
                    {vehicle.status === 'active' ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Активен
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Обслуживание
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm">
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Icon name="MapPin" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(vehicle.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить автомобиль?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Транспортное средство будет удалено из автопарка вместе со всей
              информацией о маршрутах и графике работы.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}