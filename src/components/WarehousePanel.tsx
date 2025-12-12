import { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

interface Warehouse {
  id: number;
  name: string;
  location: string;
  products: { month: string; product: string; volume: number }[];
  totalVolume: number;
  status: string;
}

const initialWarehouses: Warehouse[] = [
  {
    id: 1,
    name: 'Склад "Центральный"',
    location: 'Барнаул, ул. Промышленная 15',
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
    location: 'Барнаул, Павловский тракт 82',
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
    location: 'Бийск, ул. Заводская 3',
    products: [{ month: 'Декабрь 2025', product: 'Дизель', volume: 560 }],
    totalVolume: 560,
    status: 'active',
  },
];

export default function WarehousePanel() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem('warehouses');
    return saved ? JSON.parse(saved) : initialWarehouses;
  });

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editWarehouse, setEditWarehouse] = useState<Warehouse | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    product: '',
    volume: '',
  });

  useEffect(() => {
    localStorage.setItem('warehouses', JSON.stringify(warehouses));
  }, [warehouses]);

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

  const handleAdd = () => {
    if (!formData.name || !formData.location || !formData.product || !formData.volume) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    const newWarehouse: Warehouse = {
      id: Math.max(0, ...warehouses.map((w) => w.id)) + 1,
      name: formData.name,
      location: formData.location,
      products: [
        {
          month: 'Декабрь 2025',
          product: formData.product,
          volume: parseInt(formData.volume),
        },
      ],
      totalVolume: parseInt(formData.volume),
      status: 'active',
    };

    setWarehouses([...warehouses, newWarehouse]);
    toast({
      title: 'Склад добавлен',
      description: 'Новый склад успешно добавлен в систему',
    });
    setIsAddDialogOpen(false);
    setFormData({ name: '', location: '', product: '', volume: '' });
  };

  const handleEdit = () => {
    if (!editWarehouse) return;

    if (!formData.name || !formData.location || !formData.product || !formData.volume) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    const updatedWarehouse: Warehouse = {
      ...editWarehouse,
      name: formData.name,
      location: formData.location,
      products: [
        {
          month: 'Декабрь 2025',
          product: formData.product,
          volume: parseInt(formData.volume),
        },
      ],
      totalVolume: parseInt(formData.volume),
    };

    setWarehouses(warehouses.map((w) => (w.id === editWarehouse.id ? updatedWarehouse : w)));
    toast({
      title: 'Склад обновлен',
      description: 'Информация о складе успешно обновлена',
    });
    setEditWarehouse(null);
    setFormData({ name: '', location: '', product: '', volume: '' });
  };

  const openEditDialog = (warehouse: Warehouse) => {
    setEditWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      location: warehouse.location,
      product: warehouse.products[0]?.product || '',
      volume: warehouse.products[0]?.volume.toString() || '',
    });
  };

  const openAddDialog = () => {
    setFormData({ name: '', location: '', product: '', volume: '' });
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Всего складов</p>
              <p className="text-3xl font-bold mt-1">{warehouses.length}</p>
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
              <p className="text-3xl font-bold mt-1">
                {warehouses.reduce((sum, w) => sum + w.totalVolume, 0).toLocaleString()}
              </p>
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
              <p className="text-3xl font-bold mt-1">{warehouses.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Icon name="Activity" size={24} className="text-purple-500" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Список складов</h3>
            <Button onClick={openAddDialog}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить склад
            </Button>
          </div>
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
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(warehouse)}>
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

      <Dialog open={isAddDialogOpen || editWarehouse !== null} onOpenChange={() => {
        setIsAddDialogOpen(false);
        setEditWarehouse(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editWarehouse ? 'Редактировать склад' : 'Добавить склад'}</DialogTitle>
            <DialogDescription>
              Заполните информацию о складе
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Название склада</Label>
              <Input
                id="name"
                placeholder='Склад "Центральный"'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="location">Адрес</Label>
              <Input
                id="location"
                placeholder="Барнаул, ул. Промышленная 15"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="product">Продукция</Label>
              <Input
                id="product"
                placeholder="Бензин АИ-95"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="volume">Объем (м³)</Label>
              <Input
                id="volume"
                type="number"
                placeholder="450"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setEditWarehouse(null);
            }}>
              Отмена
            </Button>
            <Button onClick={editWarehouse ? handleEdit : handleAdd}>
              {editWarehouse ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
