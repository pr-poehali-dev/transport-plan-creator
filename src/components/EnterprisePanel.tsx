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

interface Enterprise {
  id: number;
  name: string;
  location: string;
  consumedProduct: string;
  consumedVolume: number;
  producedProduct: string;
  producedVolume: number;
  monthlyConsumption: number;
  monthlyProduction: number;
}

const initialEnterprises: Enterprise[] = [
  {
    id: 1,
    name: 'Завод "ПромСнаб"',
    location: 'Барнаул, Павловский тракт 45',
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
    location: 'Бийск, Промышленная зона 12',
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
    location: 'Рубцовск, Заводской проезд 8',
    consumedProduct: 'Нефть',
    consumedVolume: 420,
    producedProduct: 'Бензин АИ-92',
    producedVolume: 280,
    monthlyConsumption: 420,
    monthlyProduction: 280,
  },
];

export default function EnterprisePanel() {
  const [enterprises, setEnterprises] = useState<Enterprise[]>(() => {
    const saved = localStorage.getItem('enterprises');
    return saved ? JSON.parse(saved) : initialEnterprises;
  });

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editEnterprise, setEditEnterprise] = useState<Enterprise | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    consumedProduct: '',
    consumedVolume: '',
    producedProduct: '',
    producedVolume: '',
  });

  useEffect(() => {
    localStorage.setItem('enterprises', JSON.stringify(enterprises));
  }, [enterprises]);

  const handleDelete = () => {
    if (deleteId) {
      setEnterprises(enterprises.filter((e) => e.id !== deleteId));
      toast({
        title: 'Предприятие удалено',
        description: 'Предприятие успешно удалено из системы',
      });
      setDeleteId(null);
    }
  };

  const handleAdd = () => {
    if (
      !formData.name ||
      !formData.location ||
      !formData.consumedProduct ||
      !formData.consumedVolume ||
      !formData.producedProduct ||
      !formData.producedVolume
    ) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    const newEnterprise: Enterprise = {
      id: Math.max(0, ...enterprises.map((e) => e.id)) + 1,
      name: formData.name,
      location: formData.location,
      consumedProduct: formData.consumedProduct,
      consumedVolume: parseInt(formData.consumedVolume),
      producedProduct: formData.producedProduct,
      producedVolume: parseInt(formData.producedVolume),
      monthlyConsumption: parseInt(formData.consumedVolume),
      monthlyProduction: parseInt(formData.producedVolume),
    };

    setEnterprises([...enterprises, newEnterprise]);
    toast({
      title: 'Предприятие добавлено',
      description: 'Новое предприятие успешно добавлено в систему',
    });
    setIsAddDialogOpen(false);
    setFormData({ name: '', location: '', consumedProduct: '', consumedVolume: '', producedProduct: '', producedVolume: '' });
  };

  const handleEdit = () => {
    if (!editEnterprise) return;

    if (
      !formData.name ||
      !formData.location ||
      !formData.consumedProduct ||
      !formData.consumedVolume ||
      !formData.producedProduct ||
      !formData.producedVolume
    ) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    const updatedEnterprise: Enterprise = {
      ...editEnterprise,
      name: formData.name,
      location: formData.location,
      consumedProduct: formData.consumedProduct,
      consumedVolume: parseInt(formData.consumedVolume),
      producedProduct: formData.producedProduct,
      producedVolume: parseInt(formData.producedVolume),
      monthlyConsumption: parseInt(formData.consumedVolume),
      monthlyProduction: parseInt(formData.producedVolume),
    };

    setEnterprises(enterprises.map((e) => (e.id === editEnterprise.id ? updatedEnterprise : e)));
    toast({
      title: 'Предприятие обновлено',
      description: 'Информация о предприятии успешно обновлена',
    });
    setEditEnterprise(null);
    setFormData({ name: '', location: '', consumedProduct: '', consumedVolume: '', producedProduct: '', producedVolume: '' });
  };

  const openEditDialog = (enterprise: Enterprise) => {
    setEditEnterprise(enterprise);
    setFormData({
      name: enterprise.name,
      location: enterprise.location,
      consumedProduct: enterprise.consumedProduct,
      consumedVolume: enterprise.consumedVolume.toString(),
      producedProduct: enterprise.producedProduct,
      producedVolume: enterprise.producedVolume.toString(),
    });
  };

  const openAddDialog = () => {
    setFormData({ name: '', location: '', consumedProduct: '', consumedVolume: '', producedProduct: '', producedVolume: '' });
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
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(enterprise)}>
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Icon name="MapPin" size={16} />
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

      <Dialog open={isAddDialogOpen || editEnterprise !== null} onOpenChange={() => {
        setIsAddDialogOpen(false);
        setEditEnterprise(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editEnterprise ? 'Редактировать предприятие' : 'Добавить предприятие'}</DialogTitle>
            <DialogDescription>Заполните информацию о предприятии</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Название предприятия</Label>
              <Input
                id="name"
                placeholder='Завод "ПромСнаб"'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="location">Адрес</Label>
              <Input
                id="location"
                placeholder="Барнаул, Павловский тракт 45"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="consumedProduct">Потребляемая продукция</Label>
              <Input
                id="consumedProduct"
                placeholder="Нефть"
                value={formData.consumedProduct}
                onChange={(e) => setFormData({ ...formData, consumedProduct: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="consumedVolume">Объем потребления (м³/мес)</Label>
              <Input
                id="consumedVolume"
                type="number"
                placeholder="280"
                value={formData.consumedVolume}
                onChange={(e) => setFormData({ ...formData, consumedVolume: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="producedProduct">Производимая продукция</Label>
              <Input
                id="producedProduct"
                placeholder="Бензин АИ-95"
                value={formData.producedProduct}
                onChange={(e) => setFormData({ ...formData, producedProduct: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="producedVolume">Объем производства (м³/мес)</Label>
              <Input
                id="producedVolume"
                type="number"
                placeholder="180"
                value={formData.producedVolume}
                onChange={(e) => setFormData({ ...formData, producedVolume: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setEditEnterprise(null);
              }}
            >
              Отмена
            </Button>
            <Button onClick={editEnterprise ? handleEdit : handleAdd}>
              {editEnterprise ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить предприятие?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Предприятие будет удалено из системы вместе со всей информацией о
              потреблении и производстве.
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
