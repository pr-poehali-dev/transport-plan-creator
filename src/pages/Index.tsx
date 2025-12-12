import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import MapView from '@/components/MapView';
import WarehousePanel from '@/components/WarehousePanel';
import EnterprisePanel from '@/components/EnterprisePanel';
import VehiclePanel from '@/components/VehiclePanel';
import RoutesPanel from '@/components/RoutesPanel';
import ProductsPanel from '@/components/ProductsPanel';
import ReportsPanel from '@/components/ReportsPanel';
import StatsOverview from '@/components/StatsOverview';

export default function Index() {
  const [activeTab, setActiveTab] = useState('map');

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Truck" size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">LogiPro</h1>
              <p className="text-xs text-muted-foreground">Логистика и маршруты</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {[
              { id: 'map', icon: 'MapPin', label: 'Карта' },
              { id: 'warehouses', icon: 'Warehouse', label: 'Склады' },
              { id: 'enterprises', icon: 'Factory', label: 'Предприятия' },
              { id: 'vehicles', icon: 'Truck', label: 'Автомобили' },
              { id: 'routes', icon: 'Route', label: 'Маршруты' },
              { id: 'products', icon: 'Package', label: 'Продукция' },
              { id: 'reports', icon: 'BarChart3', label: 'Отчеты' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <Icon name={item.icon} size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <Icon name="User" size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Администратор</p>
              <p className="text-xs text-muted-foreground">admin@logipro.ru</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {activeTab === 'map' && 'Карта маршрутов'}
              {activeTab === 'warehouses' && 'Управление складами'}
              {activeTab === 'enterprises' && 'Предприятия'}
              {activeTab === 'vehicles' && 'Автопарк'}
              {activeTab === 'routes' && 'Маршруты перевозок'}
              {activeTab === 'products' && 'Продукция'}
              {activeTab === 'reports' && 'Отчеты и аналитика'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Icon name="Download" size={16} className="mr-2" />
              Экспорт
            </Button>
            <Button size="sm">
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'map' && (
            <div className="space-y-6">
              <StatsOverview />
              <MapView />
            </div>
          )}
          {activeTab === 'warehouses' && <WarehousePanel />}
          {activeTab === 'enterprises' && <EnterprisePanel />}
          {activeTab === 'vehicles' && <VehiclePanel />}
          {activeTab === 'routes' && <RoutesPanel />}
          {activeTab === 'products' && <ProductsPanel />}
          {activeTab === 'reports' && <ReportsPanel />}
        </div>
      </main>
    </div>
  );
}
