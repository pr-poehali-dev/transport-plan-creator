import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import MapView from '@/components/MapView';
import WarehousePanel from '@/components/WarehousePanel';
import EnterprisePanel from '@/components/EnterprisePanel';
import VehiclePanel from '@/components/VehiclePanel';
import RoutesPanel from '@/components/RoutesPanel';
import ProductsPanel from '@/components/ProductsPanel';
import ReportsPanel from '@/components/ReportsPanel';
import RouteOptimization from '@/components/RouteOptimization';

export default function Index() {
  const [activeTab, setActiveTab] = useState('map');

  const menuItems = [
    { id: 'map', icon: 'MapPin', label: 'Карта' },
    { id: 'warehouses', icon: 'Warehouse', label: 'Склады' },
    { id: 'enterprises', icon: 'Factory', label: 'Предприятия' },
    { id: 'vehicles', icon: 'Truck', label: 'Автомобили' },
    { id: 'routes', icon: 'Route', label: 'Маршруты' },
    { id: 'optimization', icon: 'Sparkles', label: 'Оптимизация ИИ' },
    { id: 'products', icon: 'Package', label: 'Продукция' },
    { id: 'reports', icon: 'BarChart3', label: 'Отчеты' },
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-card border-b">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Truck" size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">LogiPro</h1>
              <p className="text-xs text-muted-foreground">Логистика и маршруты</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Icon name="Download" size={16} className="mr-2" />
            Экспорт
          </Button>
        </div>
        <nav className="flex items-center gap-1 px-6 pb-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon name={item.icon} size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 overflow-hidden">
        {activeTab === 'map' && (
          <div className="h-full">
            <MapView />
          </div>
        )}
        {activeTab === 'warehouses' && (
          <div className="h-full overflow-auto p-6">
            <WarehousePanel />
          </div>
        )}
        {activeTab === 'enterprises' && (
          <div className="h-full overflow-auto p-6">
            <EnterprisePanel />
          </div>
        )}
        {activeTab === 'vehicles' && (
          <div className="h-full overflow-auto p-6">
            <VehiclePanel />
          </div>
        )}
        {activeTab === 'routes' && (
          <div className="h-full overflow-auto p-6">
            <RoutesPanel />
          </div>
        )}
        {activeTab === 'optimization' && (
          <div className="h-full overflow-auto p-6">
            <RouteOptimization />
          </div>
        )}
        {activeTab === 'products' && (
          <div className="h-full overflow-auto p-6">
            <ProductsPanel />
          </div>
        )}
        {activeTab === 'reports' && (
          <div className="h-full overflow-auto p-6">
            <ReportsPanel />
          </div>
        )}
      </main>
    </div>
  );
}