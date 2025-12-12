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

export default function WarehousePanel() {
  const [warehouses, setWarehouses] = useState([
    {
      id: 1,
      name: 'Склад "Центральный"',
      location: 'Москва, ул. Промышленная 15',
      products: [
        { month: 'Декабрь 2025', product: 'Бензин АИ-95', volume: 450 },
        { month: 'Декабрь 2025', product: 'Дизель', volume: 320 },
      ],
      totalVolume: 770,
      status: 'active',
    },
    {
      id: 2,
      name: 'Склад "Северный"',
      location: 'Москва, Ленинградское шоссе 82',
      products: [
        { month: 'Декабрь 2025', product: 'Бензин АИ-92', volume: 280 },
        { month: 'Декабрь 2025', product: 'Бензин АИ-95', volume: 190 },
      ],
      totalVolume: 470,
      status: 'active',
    },
    {
      id: 3,
      name: 'Склад "Южный"',
      location: 'Подольск, ул. Заводская 3',
      products: [{ month: 'Декабрь 2025', product: 'Дизель', volume: 560 }],
      totalVolume: 560,
      status: 'active',
    },
  ]);

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      setWarehouses(warehouses.filter((w) => w.id !== deleteId));
      toast({
        title: 'Склад удален',
        description: 'Склад успешно удален из системы',
      });
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Всего складов</p>
              <p className="text-3xl font-bold mt-1">12</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Icon name="Warehouse" size={24} className="text-blue-500" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Общий объем</p>
              <p className="text-3xl font-bold mt-1">1,800</p>
              <p className="text-xs text-muted-foreground">м³</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Icon name="Package" size={24} className="text-green-500" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Активных</p>
              <p className="text-3xl font-bold mt-1">12</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Icon name="Activity" size={24} className="text-purple-500" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Список складов</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Адрес</TableHead>
                <TableHead>Продукция</TableHead>
                <TableHead>Общий объем</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map((warehouse) => (
                <TableRow key={warehouse.id}>
                  <TableCell className="font-medium">{warehouse.name}</TableCell>
                  <TableCell className="text-muted-foreground">{warehouse.location}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {warehouse.products.map((p, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="font-medium">{p.product}:</span> {p.volume} м³
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{warehouse.totalVolume} м³</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Активен
                    </Badge>
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
                        onClick={() => setDeleteId(warehouse.id)}
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
            <AlertDialogTitle>Удалить склад?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Склад будет удален из системы вместе со всей информацией о
              продукции и остатках.
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