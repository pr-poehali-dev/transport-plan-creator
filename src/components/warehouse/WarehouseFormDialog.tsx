import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface WarehouseFormDialogProps {
  isOpen: boolean;
  editWarehouse: Warehouse | null;
  formData: {
    name: string;
    location: string;
    lat: string;
    lng: string;
  };
  products: { product: string; volume: string }[];
  availableProducts: any[];
  onClose: () => void;
  onSubmit: () => void;
  onFormDataChange: (data: { name: string; location: string; lat: string; lng: string }) => void;
  onProductUpdate: (index: number, field: 'product' | 'volume', value: string) => void;
  onAddProductField: () => void;
  onRemoveProductField: (index: number) => void;
}

export default function WarehouseFormDialog({
  isOpen,
  editWarehouse,
  formData,
  products,
  availableProducts,
  onClose,
  onSubmit,
  onFormDataChange,
  onProductUpdate,
  onAddProductField,
  onRemoveProductField,
}: WarehouseFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="location">Адрес</Label>
              <Input
                id="location"
                placeholder="Барнаул, ул. Промышленная 15"
                value={formData.location}
                onChange={(e) => onFormDataChange({ ...formData, location: e.target.value })}
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
                onChange={(e) => onFormDataChange({ ...formData, lat: e.target.value })}
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
                onChange={(e) => onFormDataChange({ ...formData, lng: e.target.value })}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Продукция и остатки</Label>
              <Button type="button" variant="outline" size="sm" onClick={onAddProductField}>
                <Icon name="Plus" size={14} className="mr-1" />
                Добавить
              </Button>
            </div>
            {products.map((product, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Select
                  value={product.product}
                  onValueChange={(value) => onProductUpdate(index, 'product', value)}
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
                  onChange={(e) => onProductUpdate(index, 'volume', e.target.value)}
                  className="w-32"
                />
                {products.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveProductField(index)}
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
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={onSubmit}>{editWarehouse ? 'Сохранить' : 'Добавить'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
