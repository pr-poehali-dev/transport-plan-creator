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
import { Button } from '@/components/ui/button';

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    brand: string;
    trailerType: string;
    volume: string;
    productTypes: string;
    enterprise: string;
    schedule: string;
  };
  onFormDataChange: (field: string, value: string) => void;
  onSubmit: () => void;
  isEdit: boolean;
}

export default function VehicleFormDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  isEdit,
}: VehicleFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактировать автомобиль' : 'Добавить автомобиль'}</DialogTitle>
          <DialogDescription>Заполните информацию о транспортном средстве</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brand">Марка</Label>
            <Input
              id="brand"
              placeholder="КАМАЗ 65115"
              value={formData.brand}
              onChange={(e) => onFormDataChange('brand', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="trailerType">Тип прицепа</Label>
            <Input
              id="trailerType"
              placeholder="Цистерна"
              value={formData.trailerType}
              onChange={(e) => onFormDataChange('trailerType', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="volume">Объем (м³)</Label>
            <Input
              id="volume"
              type="number"
              placeholder="20"
              value={formData.volume}
              onChange={(e) => onFormDataChange('volume', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="productTypes">Виды продукции (через запятую)</Label>
            <Input
              id="productTypes"
              placeholder="Бензин АИ-95, Дизель"
              value={formData.productTypes}
              onChange={(e) => onFormDataChange('productTypes', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="enterprise">Предприятие</Label>
            <Input
              id="enterprise"
              placeholder='Завод "ПромСнаб"'
              value={formData.enterprise}
              onChange={(e) => onFormDataChange('enterprise', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="schedule">График работы</Label>
            <Input
              id="schedule"
              placeholder="5/2 (8:00-20:00)"
              value={formData.schedule}
              onChange={(e) => onFormDataChange('schedule', e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSubmit}>{isEdit ? 'Сохранить' : 'Добавить'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
