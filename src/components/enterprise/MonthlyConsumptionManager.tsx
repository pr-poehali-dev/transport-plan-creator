import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MonthlyData {
  month: string;
  volume: number;
}

interface MonthlyConsumptionManagerProps {
  title: string;
  productName: string;
  monthlyData: MonthlyData[];
  onDataChange: (data: MonthlyData[]) => void;
  onRemove: () => void;
  availableProducts: any[];
  onProductChange: (newProduct: string) => void;
}

const MONTHS = [
  'Январь 2025', 'Февраль 2025', 'Март 2025', 'Апрель 2025',
  'Май 2025', 'Июнь 2025', 'Июль 2025', 'Август 2025',
  'Сентябрь 2025', 'Октябрь 2025', 'Ноябрь 2025', 'Декабрь 2025'
];

export default function MonthlyConsumptionManager({
  title,
  productName,
  monthlyData,
  onDataChange,
  onRemove,
  availableProducts,
  onProductChange,
}: MonthlyConsumptionManagerProps) {
  const addMonth = () => {
    onDataChange([...monthlyData, { month: MONTHS[0], volume: 0 }]);
  };

  const removeMonth = (index: number) => {
    onDataChange(monthlyData.filter((_, i) => i !== index));
  };

  const updateMonth = (index: number, field: 'month' | 'volume', value: string | number) => {
    const updated = [...monthlyData];
    if (field === 'month') {
      updated[index].month = value as string;
    } else {
      updated[index].volume = typeof value === 'string' ? parseInt(value) || 0 : value;
    }
    onDataChange(updated);
  };

  return (
    <div className="space-y-2 p-3 border rounded-md">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{title}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-destructive h-7"
        >
          <Icon name="Trash2" size={14} />
        </Button>
      </div>

      <Select value={productName} onValueChange={onProductChange}>
        <SelectTrigger className="h-9">
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

      <div>
        <div className="flex items-center justify-between mb-1">
          <Label className="text-xs text-muted-foreground">Объёмы по месяцам</Label>
          <Button type="button" variant="outline" size="sm" onClick={addMonth} className="h-7 text-xs">
            <Icon name="Plus" size={12} className="mr-1" />
            Месяц
          </Button>
        </div>
        
        {monthlyData.length === 0 ? (
          <div className="text-xs text-muted-foreground py-2">
            Добавьте данные по месяцам
          </div>
        ) : (
          <div className="space-y-1">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex gap-1">
                <Select
                  value={data.month}
                  onValueChange={(value) => updateMonth(index, 'month', value)}
                >
                  <SelectTrigger className="flex-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="м³"
                  value={data.volume}
                  onChange={(e) => updateMonth(index, 'volume', e.target.value)}
                  className="w-20 h-8 text-xs"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMonth(index)}
                  className="text-destructive h-8 w-8 p-0"
                >
                  <Icon name="X" size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
