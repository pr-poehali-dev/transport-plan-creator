import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface VehicleStatsCardsProps {
  totalVehicles: number;
  activeVehicles: number;
  maintenanceVehicles: number;
  loadPercentage: number;
}

export default function VehicleStatsCards({
  totalVehicles,
  activeVehicles,
  maintenanceVehicles,
  loadPercentage,
}: VehicleStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Всего ТС</p>
            <p className="text-3xl font-bold mt-1">{totalVehicles}</p>
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
            <p className="text-3xl font-bold mt-1">{loadPercentage}%</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <Icon name="BarChart3" size={24} className="text-blue-500" />
          </div>
        </div>
      </Card>
    </div>
  );
}
