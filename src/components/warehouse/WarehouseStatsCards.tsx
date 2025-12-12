import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

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

interface WarehouseStatsCardsProps {
  warehouses: Warehouse[];
}

export default function WarehouseStatsCards({ warehouses }: WarehouseStatsCardsProps) {
  return (
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
  );
}
