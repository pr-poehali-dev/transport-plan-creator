import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function StatsOverview() {
  const stats = [
    {
      label: 'Всего складов',
      value: '12',
      change: '+2',
      icon: 'Warehouse',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Предприятия',
      value: '8',
      change: '0',
      icon: 'Factory',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Автомобилей',
      value: '45',
      change: '+5',
      icon: 'Truck',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Активные маршруты',
      value: '28',
      change: '+12',
      icon: 'Route',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-600 font-medium">{stat.change}</span> за месяц
              </p>
            </div>
            <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <Icon name={stat.icon} size={24} className={stat.color} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
