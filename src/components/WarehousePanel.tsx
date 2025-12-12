import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface Product {
  month: string;
  product: string;
  volume: number;
}

interface Warehouse {
  id: number;
  name: string;
  location: string;
  lat?: number;
  lng?: number;
  products: Product[];
  totalVolume: number;
  status: string;
}

const initialWarehouses: Warehouse[] = [
  {
    id: 1,
    name: 'Склад "Центральный"',
    location: 'Барнаул, ул. Промышленная 15',
    lat: 53.356,
    lng: 83.769,
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
    lat: 53.389,
    lng: 83.736,
    products: [
      { month: 'Декабрь 2025', product: 'Бензин АИ-92', volume: 280 },
      { month: 'Декабрь 2025', product: 'Бензин АИ-95', volume: 190 },
    ],
    totalVolume: 470,
    status: 'active',
  },
];

export default function WarehousePanel() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem('warehouses');
    return saved ? JSON.parse(saved) : initialWarehouses;
  });

  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editWarehouse, setEditWarehouse] = useState<Warehouse | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    lat: '',
    lng: '',
  });
  const [products, setProducts] = useState<{ product: string; volume: string }[]>([
    { product: '', volume: '' },
  ]);

  useEffect(() => {
    const loadProducts = () => {
      const saved = localStorage.getItem('products');
      setAvailableProducts(saved ? JSON.parse(saved) : []);
    };
    loadProducts();
    window.addEventListener('storage', loadProducts);
    return () => window.removeEventListener('storage', loadProducts);
  }, []);

  useEffect(() => {
    localStorage.setItem('warehouses', JSON.stringify(warehouses));
    window.dispatchEvent(new Event('storage'));
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
    if (!formData.name || !formData.location) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название и адрес',
        variant: 'destructive',
      });
      return;
    }

    const validProducts = products.filter((p) => p.product && p.volume);
    if (validProducts.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте хотя бы одну продукцию',
        variant: 'destructive',
      });
      return;
    }

    const newWarehouse: Warehouse = {
      id: Math.max(0, ...warehouses.map((w) => w.id)) + 1,
      name: formData.name,
      location: formData.location,
      lat: formData.lat ? parseFloat(formData.lat) : undefined,
      lng: formData.lng ? parseFloat(formData.lng) : undefined,
      products: validProducts.map((p) => ({
        month: 'Декабрь 2025',
        product: p.product,
        volume: parseInt(p.volume),
      })),
      totalVolume: validProducts.reduce((sum, p) => sum + parseInt(p.volume), 0),
      status: 'active',
    };

    setWarehouses([...warehouses, newWarehouse]);
    toast({
      title: 'Склад добавлен',
      description: 'Новый склад успешно добавлен в систему',
    });
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editWarehouse) return;

    if (!formData.name || !formData.location) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название и адрес',
        variant: 'destructive',
      });
      return;
    }

    const validProducts = products.filter((p) => p.product && p.volume);
    if (validProducts.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте хотя бы одну продукцию',
        variant: 'destructive',
      });
      return;
    }

    const updatedWarehouse: Warehouse = {
      ...editWarehouse,
      name: formData.name,
      location: formData.location,
      lat: formData.lat ? parseFloat(formData.lat) : undefined,
      lng: formData.lng ? parseFloat(formData.lng) : undefined,
      products: validProducts.map((p) => ({
        month: 'Декабрь 2025',
        product: p.product,
        volume: parseInt(p.volume),
      })),
      totalVolume: validProducts.reduce((sum, p) => sum + parseInt(p.volume), 0),
    };

    setWarehouses(warehouses.map((w) => (w.id === editWarehouse.id ? updatedWarehouse : w)));
    toast({
      title: 'Склад обновлен',
      description: 'Информация о складе успешно обновлена',
    });
    setEditWarehouse(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', location: '', lat: '', lng: '' });
    setProducts([{ product: '', volume: '' }]);
  };

  const openEditDialog = (warehouse: Warehouse) => {
    setEditWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      location: warehouse.location,
      lat: warehouse.lat?.toString() || '',
      lng: warehouse.lng?.toString() || '',
    });
    setProducts(
      warehouse.products.map((p) => ({
        product: p.product,
        volume: p.volume.toString(),
      }))
    );
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const addProductField = () => {
    setProducts([...products, { product: '', volume: '' }]);
  };

  const removeProductField = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: 'product' | 'volume', value: string) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
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
                <TableHead>Координаты</TableHead>
                <TableHead>Продукция</TableHead>
                <TableHead>Общий объем</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map((warehouse) => (
                <TableRow key={warehouse.id}>
                  <TableCell className="font-medium">{warehouse.name}</TableCell>
                  <TableCell className="text-muted-foreground">{warehouse.location}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {warehouse.lat && warehouse.lng
                      ? `${warehouse.lat.toFixed(4)}, ${warehouse.lng.toFixed(4)}`
                      : 'Не указаны'}
                  </TableCell>
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
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(warehouse)}>
                        <Icon name="Edit" size={16} />
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

      <Dialog
        open={isAddDialogOpen || editWarehouse !== null}
        onOpenChange={() => {
          setIsAddDialogOpen(false);
          setEditWarehouse(null);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editWarehouse ? 'Редактировать склад' : 'Добавить склад'}</DialogTitle>
            <DialogDescription>Заполните информацию о складе</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Название склада</Label>
                <Input
                  id="name"
                  placeholder='Склад "Центральный"'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="location">Адрес</Label>
                <Input
                  id="location"
                  placeholder="Барнаул, ул. Промышленная 15"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lat">Широта (lat)</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.000001"
                  placeholder="53.356"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lng">Долгота (lng)</Label>
                <Input
                  id="lng"
                  type="number"
                  step="0.000001"
                  placeholder="83.769"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Продукция и остатки</Label>
                <Button type="button" variant="outline" size="sm" onClick={addProductField}>
                  <Icon name="Plus" size={14} className="mr-1" />
                  Добавить
                </Button>
              </div>
              {products.map((product, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Select
                    value={product.product}
                    onValueChange={(value) => updateProduct(index, 'product', value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Выберите продукцию" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((p) => (
                        <SelectItem key={p.id} value={p.name}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Объем (м³)"
                    value={product.volume}
                    onChange={(e) => updateProduct(index, 'volume', e.target.value)}
                    className="w-32"
                  />
                  {products.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProductField(index)}
                      className="text-destructive"
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setEditWarehouse(null);
              }}
            >
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
