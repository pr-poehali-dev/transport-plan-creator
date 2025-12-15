import { useState, useEffect, useRef } from 'react';
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
import * as XLSX from 'xlsx';

interface Vehicle {
  id: number;
  brand: string;
  trailerType: string;
  volume: number;
  productTypes: string[];
  enterprise: string;
  schedule: string;
  status: string;
}

const initialVehicles: Vehicle[] = [
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
];

export default function VehiclePanel() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('vehicles');
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    brand: '',
    trailerType: '',
    volume: '',
    productTypes: '',
    enterprise: '',
    schedule: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

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

  const handleAdd = () => {
    if (
      !formData.brand ||
      !formData.trailerType ||
      !formData.volume ||
      !formData.productTypes ||
      !formData.enterprise ||
      !formData.schedule
    ) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    const newVehicle: Vehicle = {
      id: Math.max(0, ...vehicles.map((v) => v.id)) + 1,
      brand: formData.brand,
      trailerType: formData.trailerType,
      volume: parseInt(formData.volume),
      productTypes: formData.productTypes.split(',').map((p) => p.trim()),
      enterprise: formData.enterprise,
      schedule: formData.schedule,
      status: 'active',
    };

    setVehicles([...vehicles, newVehicle]);
    toast({
      title: 'Автомобиль добавлен',
      description: 'Новое ТС успешно добавлено в автопарк',
    });
    setIsAddDialogOpen(false);
    setFormData({ brand: '', trailerType: '', volume: '', productTypes: '', enterprise: '', schedule: '' });
  };

  const handleEdit = () => {
    if (!editVehicle) return;

    if (
      !formData.brand ||
      !formData.trailerType ||
      !formData.volume ||
      !formData.productTypes ||
      !formData.enterprise ||
      !formData.schedule
    ) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    const updatedVehicle: Vehicle = {
      ...editVehicle,
      brand: formData.brand,
      trailerType: formData.trailerType,
      volume: parseInt(formData.volume),
      productTypes: formData.productTypes.split(',').map((p) => p.trim()),
      enterprise: formData.enterprise,
      schedule: formData.schedule,
    };

    setVehicles(vehicles.map((v) => (v.id === editVehicle.id ? updatedVehicle : v)));
    toast({
      title: 'Автомобиль обновлен',
      description: 'Информация о ТС успешно обновлена',
    });
    setEditVehicle(null);
    setFormData({ brand: '', trailerType: '', volume: '', productTypes: '', enterprise: '', schedule: '' });
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setEditVehicle(vehicle);
    setFormData({
      brand: vehicle.brand,
      trailerType: vehicle.trailerType,
      volume: vehicle.volume.toString(),
      productTypes: vehicle.productTypes.join(', '),
      enterprise: vehicle.enterprise,
      schedule: vehicle.schedule,
    });
  };

  const openAddDialog = () => {
    setFormData({ brand: '', trailerType: '', volume: '', productTypes: '', enterprise: '', schedule: '' });
    setIsAddDialogOpen(true);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length < 2) {
          toast({
            title: 'Ошибка',
            description: 'Excel файл пустой или не содержит данных',
            variant: 'destructive',
          });
          return;
        }

        const importedVehicles: Vehicle[] = [];
        const maxId = Math.max(0, ...vehicles.map((v) => v.id));

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row[0] || !row[1]) continue;

          const vehicle: Vehicle = {
            id: maxId + i,
            brand: String(row[0] || ''),
            trailerType: String(row[1] || 'Цистерна'),
            volume: Number(row[2]) || 20,
            productTypes: String(row[3] || 'Нефтепродукты').split(',').map(p => p.trim()),
            enterprise: String(row[4] || 'Не указано'),
            schedule: String(row[5] || '5/2'),
            status: String(row[6] || 'active').toLowerCase() === 'активен' || String(row[6] || 'active').toLowerCase() === 'active' ? 'active' : 'maintenance',
          };

          importedVehicles.push(vehicle);
        }

        if (importedVehicles.length === 0) {
          toast({
            title: 'Ошибка',
            description: 'Не удалось импортировать данные. Проверьте формат файла.',
            variant: 'destructive',
          });
          return;
        }

        setVehicles([...vehicles, ...importedVehicles]);
        toast({
          title: 'Успешно',
          description: `Импортировано ${importedVehicles.length} автомобилей`,
        });
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: 'Ошибка импорта',
          description: 'Не удалось прочитать файл. Убедитесь, что это корректный Excel файл.',
          variant: 'destructive',
        });
      }
    };

    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const activeVehicles = vehicles.filter((v) => v.status === 'active').length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'maintenance').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Всего ТС</p>
              <p className="text-3xl font-bold mt-1">{vehicles.length}</p>
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
              <p className="text-3xl font-bold mt-1">{activeVehicles}</p>
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
              <p className="text-3xl font-bold mt-1">{maintenanceVehicles}</p>
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
              <p className="text-3xl font-bold mt-1">
                {vehicles.length > 0 ? Math.round((activeVehicles / vehicles.length) * 100) : 0}%
              </p>
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
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportExcel}
                className="hidden"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="Upload" size={16} className="mr-2" />
                Импорт из Excel
              </Button>
              <Button size="sm" onClick={openAddDialog}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить ТС
              </Button>
            </div>
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
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(vehicle)}>
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

      <Dialog
        open={isAddDialogOpen || editVehicle !== null}
        onOpenChange={() => {
          setIsAddDialogOpen(false);
          setEditVehicle(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editVehicle ? 'Редактировать автомобиль' : 'Добавить автомобиль'}</DialogTitle>
            <DialogDescription>Заполните информацию о транспортном средстве</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">Марка</Label>
              <Input
                id="brand"
                placeholder="КАМАЗ 65115"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="trailerType">Тип прицепа</Label>
              <Input
                id="trailerType"
                placeholder="Цистерна"
                value={formData.trailerType}
                onChange={(e) => setFormData({ ...formData, trailerType: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="volume">Объем (м³)</Label>
              <Input
                id="volume"
                type="number"
                placeholder="20"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="productTypes">Виды продукции (через запятую)</Label>
              <Input
                id="productTypes"
                placeholder="Бензин АИ-95, Дизель"
                value={formData.productTypes}
                onChange={(e) => setFormData({ ...formData, productTypes: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="enterprise">Предприятие</Label>
              <Input
                id="enterprise"
                placeholder='Завод "ПромСнаб"'
                value={formData.enterprise}
                onChange={(e) => setFormData({ ...formData, enterprise: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="schedule">График работы</Label>
              <Input
                id="schedule"
                placeholder="5/2 (8:00-20:00)"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setEditVehicle(null);
              }}
            >
              Отмена
            </Button>
            <Button onClick={editVehicle ? handleEdit : handleAdd}>
              {editVehicle ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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