import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface Vehicle {
  id: number;
  brand: string;
  trailerType: string;
  volume: number;
  productTypes: string[];
  enterprise: string;
  schedule: string;
  status: string;
}

interface VehicleTableProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: number) => void;
}

export default function VehicleTable({ vehicles, onEdit, onDelete }: VehicleTableProps) {
  return (
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
                <Button variant="ghost" size="sm" onClick={() => onEdit(vehicle)}>
                  <Icon name="Edit" size={16} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Icon name="MapPin" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(vehicle.id)}
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
  );
}
