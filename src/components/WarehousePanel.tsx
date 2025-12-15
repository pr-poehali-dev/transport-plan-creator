import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import WarehouseStatsCards from './warehouse/WarehouseStatsCards';
import WarehouseTable from './warehouse/WarehouseTable';
import WarehouseFormDialog from './warehouse/WarehouseFormDialog';
import WarehouseDeleteDialog from './warehouse/WarehouseDeleteDialog';

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

const initialWarehouses: Warehouse[] = [
  {
    id: 1,
    name: 'Склад "Центральный"',
    location: 'Барнаул, ул. Промышленная 15',
    lat: 53.356,
    lng: 83.769,
    products: [
      { 
        product: 'Бензин АИ-95',
        monthlyData: [
          { month: 'Январь 2025', volume: 520 },
          { month: 'Февраль 2025', volume: 480 },
          { month: 'Март 2025', volume: 450 },
        ]
      },
      { 
        product: 'Дизель',
        monthlyData: [
          { month: 'Январь 2025', volume: 350 },
          { month: 'Февраль 2025', volume: 320 },
          { month: 'Март 2025', volume: 300 },
        ]
      },
    ],
    totalVolume: 770,
    status: 'active',
  },
  {
    id: 2,
    name: 'Склад "Северный"',
    location: 'Барнаул, Павловский тракт 82',
    lat: 53.389,
    lng: 83.736,
    products: [
      { 
        product: 'Бензин АИ-92',
        monthlyData: [
          { month: 'Январь 2025', volume: 300 },
          { month: 'Февраль 2025', volume: 280 },
          { month: 'Март 2025', volume: 260 },
        ]
      },
    ],
    totalVolume: 470,
    status: 'active',
  },
];

export default function WarehousePanel() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem('warehouses');
    return saved ? JSON.parse(saved) : initialWarehouses;
  });

  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editWarehouse, setEditWarehouse] = useState<Warehouse | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    lat: '',
    lng: '',
  });
  const [products, setProducts] = useState<Product[]>([
    { product: '', monthlyData: [] },
  ]);

  useEffect(() => {
    const loadProducts = () => {
      const saved = localStorage.getItem('products');
      setAvailableProducts(saved ? JSON.parse(saved) : []);
    };
    loadProducts();
    window.addEventListener('storage', loadProducts);
    return () => window.removeEventListener('storage', loadProducts);
  }, []);

  useEffect(() => {
    localStorage.setItem('warehouses', JSON.stringify(warehouses));
    window.dispatchEvent(new Event('storage'));
  }, [warehouses]);

  const handleDelete = () => {
    if (deleteId) {
      setWarehouses(warehouses.filter((w) => w.id !== deleteId));
      toast({
        title: 'Склад удален',
        description: 'Склад успешно удален из системы',
      });
      setDeleteId(null);
    }
  };

  const handleAdd = () => {
    if (!formData.name || !formData.location) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название и адрес',
        variant: 'destructive',
      });
      return;
    }

    const validProducts = products.filter((p) => p.product && p.monthlyData.length > 0);
    if (validProducts.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте хотя бы одну продукцию с данными по месяцам',
        variant: 'destructive',
      });
      return;
    }

    const latestVolume = validProducts.reduce((sum, p) => {
      const lastMonth = p.monthlyData[p.monthlyData.length - 1];
      return sum + (lastMonth?.volume || 0);
    }, 0);

    const newWarehouse: Warehouse = {
      id: Math.max(0, ...warehouses.map((w) => w.id)) + 1,
      name: formData.name,
      location: formData.location,
      lat: formData.lat ? parseFloat(formData.lat) : undefined,
      lng: formData.lng ? parseFloat(formData.lng) : undefined,
      products: validProducts,
      totalVolume: latestVolume,
      status: 'active',
    };

    setWarehouses([...warehouses, newWarehouse]);
    toast({
      title: 'Склад добавлен',
      description: 'Новый склад успешно добавлен в систему',
    });
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editWarehouse) return;

    if (!formData.name || !formData.location) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название и адрес',
        variant: 'destructive',
      });
      return;
    }

    const validProducts = products.filter((p) => p.product && p.monthlyData.length > 0);
    if (validProducts.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте хотя бы одну продукцию с данными по месяцам',
        variant: 'destructive',
      });
      return;
    }

    const latestVolume = validProducts.reduce((sum, p) => {
      const lastMonth = p.monthlyData[p.monthlyData.length - 1];
      return sum + (lastMonth?.volume || 0);
    }, 0);

    const updatedWarehouse: Warehouse = {
      ...editWarehouse,
      name: formData.name,
      location: formData.location,
      lat: formData.lat ? parseFloat(formData.lat) : undefined,
      lng: formData.lng ? parseFloat(formData.lng) : undefined,
      products: validProducts,
      totalVolume: latestVolume,
    };

    setWarehouses(warehouses.map((w) => (w.id === editWarehouse.id ? updatedWarehouse : w)));
    toast({
      title: 'Склад обновлен',
      description: 'Информация о складе успешно обновлена',
    });
    setEditWarehouse(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', location: '', lat: '', lng: '' });
    setProducts([{ product: '', monthlyData: [] }]);
  };

  const openEditDialog = (warehouse: Warehouse) => {
    setEditWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      location: warehouse.location,
      lat: warehouse.lat?.toString() || '',
      lng: warehouse.lng?.toString() || '',
    });
    setProducts(warehouse.products || [{ product: '', monthlyData: [] }]);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };



  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditWarehouse(null);
  };

  const handleSubmitDialog = () => {
    if (editWarehouse) {
      handleEdit();
    } else {
      handleAdd();
    }
  };

  return (
    <div className="space-y-6">
      <WarehouseStatsCards warehouses={warehouses} />

      <WarehouseTable
        warehouses={warehouses}
        onEdit={openEditDialog}
        onDelete={setDeleteId}
        onAdd={openAddDialog}
      />

      <WarehouseFormDialog
        isOpen={isAddDialogOpen || editWarehouse !== null}
        editWarehouse={editWarehouse}
        formData={formData}
        products={products}
        availableProducts={availableProducts}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitDialog}
        onFormDataChange={setFormData}
        onProductsChange={setProducts}
      />

      <WarehouseDeleteDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}