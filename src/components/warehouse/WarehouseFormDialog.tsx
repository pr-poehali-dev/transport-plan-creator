import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
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
import MonthlyStockManager from './MonthlyStockManager';

interface MonthlyStock {
  month: string;
  volume: number;
}

interface Product {
  product: string;
  monthlyData: MonthlyStock[];
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
  products: Product[];
  availableProducts: any[];
  onClose: () => void;
  onSubmit: () => void;
  onFormDataChange: (data: { name: string; location: string; lat: string; lng: string }) => void;
  onProductsChange: (products: Product[]) => void;
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
  onProductsChange,
}: WarehouseFormDialogProps) {
  const addProduct = () => {
    onProductsChange([
      ...products,
      { product: '', monthlyData: [] }
    ]);
  };

  const removeProduct = (index: number) => {
    onProductsChange(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: 'product' | 'monthlyData', value: any) => {
    const updated = [...products];
    if (field === 'product') {
      updated[index].product = value;
    } else {
      updated[index].monthlyData = value;
    }
    onProductsChange(updated);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editWarehouse ? 'Редактировать склад' : 'Добавить склад'}</DialogTitle>
          <DialogDescription>Заполните информацию о складе и остатках по месяцам</DialogDescription>
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
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Продукция на складе</Label>
              <Button type="button" variant="outline" size="sm" onClick={addProduct}>
                <Icon name="Plus" size={14} className="mr-1" />
                Добавить продукцию
              </Button>
            </div>
            
            {products.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center border-2 border-dashed rounded-lg">
                Добавьте продукцию для хранения на складе
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product, index) => (
                  <MonthlyStockManager
                    key={index}
                    productName={product.product}
                    monthlyData={product.monthlyData}
                    onDataChange={(data) => updateProduct(index, 'monthlyData', data)}
                    onRemove={() => removeProduct(index)}
                    availableProducts={availableProducts}
                    onProductChange={(newProduct) => updateProduct(index, 'product', newProduct)}
                  />
                ))}
              </div>
            )}
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
