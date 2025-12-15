import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

interface WarehouseTableProps {
  warehouses: Warehouse[];
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

export default function WarehouseTable({ warehouses, onEdit, onDelete, onAdd }: WarehouseTableProps) {
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Список складов</h3>
          <Button onClick={onAdd}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить склад
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Адрес</TableHead>
              <TableHead>Координаты</TableHead>
              <TableHead>Продукция</TableHead>
              <TableHead>Общий объем</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.map((warehouse) => (
              <TableRow key={warehouse.id}>
                <TableCell className="font-medium">{warehouse.name}</TableCell>
                <TableCell className="text-muted-foreground">{warehouse.location}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {warehouse.lat && warehouse.lng
                    ? `${warehouse.lat.toFixed(4)}, ${warehouse.lng.toFixed(4)}`
                    : 'Не указаны'}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {warehouse.products.map((p, idx) => {
                      const latestMonth = p.monthlyData[p.monthlyData.length - 1];
                      return (
                        <div key={idx} className="text-xs">
                          <span className="font-medium">{p.product}</span>
                          {latestMonth && (
                            <span className="text-muted-foreground ml-1">
                              ({latestMonth.month}: {latestMonth.volume} м³)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold">{warehouse.totalVolume} м³</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(warehouse)}>
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(warehouse.id)}
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
  );
}