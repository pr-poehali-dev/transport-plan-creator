import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface ProductItem {
  product: string;
  volume: number;
}

interface Enterprise {
  id: number;
  name: string;
  location: string;
  lat?: number;
  lng?: number;
  consumed: ProductItem[];
  produced: ProductItem[];
  monthlyConsumption: number;
  monthlyProduction: number;
}

const initialEnterprises: Enterprise[] = [
  {
    id: 1,
    name: 'Завод "ПромСнаб"',
    location: 'Барнаул, Павловский тракт 45',
    lat: 53.348,
    lng: 83.776,
    consumed: [{ product: 'Нефть', volume: 280 }],
    produced: [{ product: 'Бензин АИ-95', volume: 180 }],
    monthlyConsumption: 280,
    monthlyProduction: 180,
  },
];

export default function EnterprisePanel() {
  const [enterprises, setEnterprises] = useState<Enterprise[]>(() => {
    const saved = localStorage.getItem('enterprises');
    if (!saved) return initialEnterprises;
    const parsed = JSON.parse(saved);
    return parsed.map((e: any) => {
      if (!e.consumed && e.consumedProduct) {
        e.consumed = [{ product: e.consumedProduct, volume: e.consumedVolume || 0 }];
      }
      if (!e.produced && e.producedProduct) {
        e.produced = [{ product: e.producedProduct, volume: e.producedVolume || 0 }];
      }
      return e;
    });
  });

  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editEnterprise, setEditEnterprise] = useState<Enterprise | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', lat: '', lng: '' });
  const [consumedProducts, setConsumedProducts] = useState<{ product: string; volume: string }[]>([
    { product: '', volume: '' },
  ]);
  const [producedProducts, setProducedProducts] = useState<{ product: string; volume: string }[]>([
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
    localStorage.setItem('enterprises', JSON.stringify(enterprises));
    window.dispatchEvent(new Event('storage'));
  }, [enterprises]);

  const handleDelete = () => {
    if (deleteId) {
      setEnterprises(enterprises.filter((e) => e.id !== deleteId));
      toast({ title: 'Предприятие удалено', description: 'Предприятие успешно удалено из системы' });
      setDeleteId(null);
    }
  };

  const handleAdd = () => {
    if (!formData.name || !formData.location) {
      toast({ title: 'Ошибка', description: 'Заполните название и адрес', variant: 'destructive' });
      return;
    }

    const validConsumed = consumedProducts.filter((p) => p.product && p.volume);
    const validProduced = producedProducts.filter((p) => p.product && p.volume);

    if (validConsumed.length === 0 || validProduced.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте хотя бы по одной потребляемой и производимой продукции',
        variant: 'destructive',
      });
      return;
    }

    const consumed = validConsumed.map((p) => ({ product: p.product, volume: parseInt(p.volume) }));
    const produced = validProduced.map((p) => ({ product: p.product, volume: parseInt(p.volume) }));

    const newEnterprise: Enterprise = {
      id: Math.max(0, ...enterprises.map((e) => e.id)) + 1,
      name: formData.name,
      location: formData.location,
      lat: formData.lat ? parseFloat(formData.lat) : undefined,
      lng: formData.lng ? parseFloat(formData.lng) : undefined,
      consumed,
      produced,
      monthlyConsumption: consumed.reduce((sum, p) => sum + p.volume, 0),
      monthlyProduction: produced.reduce((sum, p) => sum + p.volume, 0),
    };

    setEnterprises([...enterprises, newEnterprise]);
    toast({ title: 'Предприятие добавлено', description: 'Новое предприятие успешно добавлено в систему' });
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editEnterprise) return;

    if (!formData.name || !formData.location) {
      toast({ title: 'Ошибка', description: 'Заполните название и адрес', variant: 'destructive' });
      return;
    }

    const validConsumed = consumedProducts.filter((p) => p.product && p.volume);
    const validProduced = producedProducts.filter((p) => p.product && p.volume);

    if (validConsumed.length === 0 || validProduced.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте хотя бы по одной потребляемой и производимой продукции',
        variant: 'destructive',
      });
      return;
    }

    const consumed = validConsumed.map((p) => ({ product: p.product, volume: parseInt(p.volume) }));
    const produced = validProduced.map((p) => ({ product: p.product, volume: parseInt(p.volume) }));

    const updatedEnterprise: Enterprise = {
      ...editEnterprise,
      name: formData.name,
      location: formData.location,
      lat: formData.lat ? parseFloat(formData.lat) : undefined,
      lng: formData.lng ? parseFloat(formData.lng) : undefined,
      consumed,
      produced,
      monthlyConsumption: consumed.reduce((sum, p) => sum + p.volume, 0),
      monthlyProduction: produced.reduce((sum, p) => sum + p.volume, 0),
    };

    setEnterprises(enterprises.map((e) => (e.id === editEnterprise.id ? updatedEnterprise : e)));
    toast({ title: 'Предприятие обновлено', description: 'Информация о предприятии успешно обновлена' });
    setEditEnterprise(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', location: '', lat: '', lng: '' });
    setConsumedProducts([{ product: '', volume: '' }]);
    setProducedProducts([{ product: '', volume: '' }]);
  };

  const openEditDialog = (enterprise: Enterprise) => {
    setEditEnterprise(enterprise);
    setFormData({
      name: enterprise.name,
      location: enterprise.location,
      lat: enterprise.lat?.toString() || '',
      lng: enterprise.lng?.toString() || '',
    });
    setConsumedProducts(enterprise.consumed.map((p) => ({ product: p.product, volume: p.volume.toString() })));
    setProducedProducts(enterprise.produced.map((p) => ({ product: p.product, volume: p.volume.toString() })));
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Всего предприятий</p>
              <p className="text-3xl font-bold mt-1">{enterprises.length}</p>
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
              <p className="text-3xl font-bold mt-1">
                {enterprises.reduce((sum, e) => sum + e.monthlyConsumption, 0).toLocaleString()}
              </p>
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
              <p className="text-3xl font-bold mt-1">
                {enterprises.reduce((sum, e) => sum + e.monthlyProduction, 0).toLocaleString()}
              </p>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Список предприятий</h3>
            <Button onClick={openAddDialog}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить предприятие
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Адрес</TableHead>
                <TableHead>Координаты</TableHead>
                <TableHead>Потребление</TableHead>
                <TableHead>Производство</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enterprises.map((enterprise) => (
                <TableRow key={enterprise.id}>
                  <TableCell className="font-medium">{enterprise.name}</TableCell>
                  <TableCell className="text-muted-foreground">{enterprise.location}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {enterprise.lat && enterprise.lng
                      ? `${enterprise.lat.toFixed(4)}, ${enterprise.lng.toFixed(4)}`
                      : 'Не указаны'}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      {enterprise.consumed.map((c, idx) => (
                        <div key={idx}>
                          <span className="font-medium">{c.product}:</span> {c.volume} м³
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      {enterprise.produced.map((p, idx) => (
                        <div key={idx}>
                          <span className="font-medium">{p.product}:</span> {p.volume} м³
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(enterprise)}>
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(enterprise.id)}
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

      <Dialog open={isAddDialogOpen || editEnterprise !== null} onOpenChange={() => { setIsAddDialogOpen(false); setEditEnterprise(null); }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editEnterprise ? 'Редактировать предприятие' : 'Добавить предприятие'}</DialogTitle>
            <DialogDescription>Заполните информацию о предприятии</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label>Название</Label><Input placeholder='Завод "ПромСнаб"' value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="col-span-2"><Label>Адрес</Label><Input placeholder="Барнаул, Павловский тракт 45" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} /></div>
              <div><Label>Широта (lat)</Label><Input type="number" step="0.000001" placeholder="53.348" value={formData.lat} onChange={(e) => setFormData({ ...formData, lat: e.target.value })} /></div>
              <div><Label>Долгота (lng)</Label><Input type="number" step="0.000001" placeholder="83.776" value={formData.lng} onChange={(e) => setFormData({ ...formData, lng: e.target.value })} /></div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Потребляемая продукция</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setConsumedProducts([...consumedProducts, { product: '', volume: '' }])}>
                  <Icon name="Plus" size={14} className="mr-1" />Добавить
                </Button>
              </div>
              {consumedProducts.map((product, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Select value={product.product} onValueChange={(value) => { const updated = [...consumedProducts]; updated[index].product = value; setConsumedProducts(updated); }}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Выберите продукцию" /></SelectTrigger>
                    <SelectContent>{availableProducts.map((p) => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}</SelectContent>
                  </Select>
                  <Input type="number" placeholder="Объем (м³/мес)" value={product.volume} onChange={(e) => { const updated = [...consumedProducts]; updated[index].volume = e.target.value; setConsumedProducts(updated); }} className="w-40" />
                  {consumedProducts.length > 1 && (<Button type="button" variant="ghost" size="sm" onClick={() => setConsumedProducts(consumedProducts.filter((_, i) => i !== index))} className="text-destructive"><Icon name="X" size={16} /></Button>)}
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Производимая продукция</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setProducedProducts([...producedProducts, { product: '', volume: '' }])}>
                  <Icon name="Plus" size={14} className="mr-1" />Добавить
                </Button>
              </div>
              {producedProducts.map((product, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Select value={product.product} onValueChange={(value) => { const updated = [...producedProducts]; updated[index].product = value; setProducedProducts(updated); }}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Выберите продукцию" /></SelectTrigger>
                    <SelectContent>{availableProducts.map((p) => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}</SelectContent>
                  </Select>
                  <Input type="number" placeholder="Объем (м³/мес)" value={product.volume} onChange={(e) => { const updated = [...producedProducts]; updated[index].volume = e.target.value; setProducedProducts(updated); }} className="w-40" />
                  {producedProducts.length > 1 && (<Button type="button" variant="ghost" size="sm" onClick={() => setProducedProducts(producedProducts.filter((_, i) => i !== index))} className="text-destructive"><Icon name="X" size={16} /></Button>)}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setEditEnterprise(null); }}>Отмена</Button>
            <Button onClick={editEnterprise ? handleEdit : handleAdd}>{editEnterprise ? 'Сохранить' : 'Добавить'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить предприятие?</AlertDialogTitle>
            <AlertDialogDescription>Это действие нельзя отменить. Предприятие будет удалено из системы вместе со всей информацией.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
