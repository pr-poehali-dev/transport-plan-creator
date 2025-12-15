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
import { Card } from '@/components/ui/card';

interface MonthlyStock {
  month: string;
  volume: number;
}

interface MonthlyStockManagerProps {
  productName: string;
  monthlyData: MonthlyStock[];
  onDataChange: (data: MonthlyStock[]) => void;
  onRemove: () => void;
  availableProducts: any[];
  onProductChange: (newProduct: string) => void;
}

const MONTHS = [
  'Январь 2025', 'Февраль 2025', 'Март 2025', 'Апрель 2025',
  'Май 2025', 'Июнь 2025', 'Июль 2025', 'Август 2025',
  'Сентябрь 2025', 'Октябрь 2025', 'Ноябрь 2025', 'Декабрь 2025'
];

export default function MonthlyStockManager({
  productName,
  monthlyData,
  onDataChange,
  onRemove,
  availableProducts,
  onProductChange,
}: MonthlyStockManagerProps) {
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
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Label>Продукция</Label>
          <Select value={productName} onValueChange={onProductChange}>
            <SelectTrigger>
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
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-destructive ml-2 mt-6"
        >
          <Icon name="Trash2" size={16} />
        </Button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Остатки по месяцам</Label>
          <Button type="button" variant="outline" size="sm" onClick={addMonth}>
            <Icon name="Plus" size={14} className="mr-1" />
            Месяц
          </Button>
        </div>
        
        {monthlyData.length === 0 ? (
          <div className="text-sm text-muted-foreground py-2">
            Добавьте данные по месяцам
          </div>
        ) : (
          <div className="space-y-2">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex gap-2">
                <Select
                  value={data.month}
                  onValueChange={(value) => updateMonth(index, 'month', value)}
                >
                  <SelectTrigger className="flex-1">
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
                  placeholder="Объем (м³)"
                  value={data.volume}
                  onChange={(e) => updateMonth(index, 'volume', e.target.value)}
                  className="w-32"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMonth(index)}
                  className="text-destructive"
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
