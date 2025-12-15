import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
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
import * as XLSX from 'xlsx';
import VehicleStatsCards from '@/components/vehicle/VehicleStatsCards';
import VehicleTable, { Vehicle } from '@/components/vehicle/VehicleTable';
import VehicleFormDialog from '@/components/vehicle/VehicleFormDialog';

const initialVehicles: Vehicle[] = [];

export default function VehiclePanel() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('vehicles');
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    brand: '',
    licensePlate: '',
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
      !formData.licensePlate ||
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
      licensePlate: formData.licensePlate,
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
    setFormData({ brand: '', licensePlate: '', trailerType: '', volume: '', productTypes: '', enterprise: '', schedule: '' });
  };

  const handleEdit = () => {
    if (!editVehicle) return;

    if (
      !formData.brand ||
      !formData.licensePlate ||
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
      licensePlate: formData.licensePlate,
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
    setFormData({ brand: '', licensePlate: '', trailerType: '', volume: '', productTypes: '', enterprise: '', schedule: '' });
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setEditVehicle(vehicle);
    setFormData({
      brand: vehicle.brand,
      licensePlate: vehicle.licensePlate,
      trailerType: vehicle.trailerType,
      volume: vehicle.volume.toString(),
      productTypes: vehicle.productTypes.join(', '),
      enterprise: vehicle.enterprise,
      schedule: vehicle.schedule,
    });
  };

  const openAddDialog = () => {
    setFormData({ brand: '', licensePlate: '', trailerType: '', volume: '', productTypes: '', enterprise: '', schedule: '' });
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
            licensePlate: String(row[1] || ''),
            trailerType: String(row[2] || 'Цистерна'),
            volume: Number(row[3]) || 20,
            productTypes: String(row[4] || 'Нефтепродукты').split(',').map(p => p.trim()),
            enterprise: String(row[5] || 'Не указано'),
            schedule: String(row[6] || '5/2'),
            status: String(row[7] || 'active').toLowerCase() === 'активен' || String(row[7] || 'active').toLowerCase() === 'active' ? 'active' : 'maintenance',
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
  const loadPercentage = vehicles.length > 0 ? Math.round((activeVehicles / vehicles.length) * 100) : 0;

  const handleFormDataChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditVehicle(null);
  };

  const handleClearAll = () => {
    setVehicles([]);
    localStorage.removeItem('vehicles');
    toast({
      title: 'Данные очищены',
      description: 'Все машины удалены из справочника',
    });
    setShowClearDialog(false);
  };

  return (
    <div className="space-y-6">
      <VehicleStatsCards
        totalVehicles={vehicles.length}
        activeVehicles={activeVehicles}
        maintenanceVehicles={maintenanceVehicles}
        loadPercentage={loadPercentage}
      />

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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowClearDialog(true)}
                disabled={vehicles.length === 0}
              >
                <Icon name="Trash2" size={16} className="mr-2" />
                Очистить все
              </Button>
              <Button size="sm" onClick={openAddDialog}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить ТС
              </Button>
            </div>
          </div>
          <VehicleTable
            vehicles={vehicles}
            onEdit={openEditDialog}
            onDelete={setDeleteId}
          />
        </div>
      </Card>

      <VehicleFormDialog
        open={isAddDialogOpen || editVehicle !== null}
        onOpenChange={handleDialogClose}
        formData={formData}
        onFormDataChange={handleFormDataChange}
        onSubmit={editVehicle ? handleEdit : handleAdd}
        isEdit={editVehicle !== null}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить автомобиль?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Автомобиль будет удален из базы данных.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Очистить все данные?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Все машины ({vehicles.length} шт.) будут удалены из справочника.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}>Очистить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}