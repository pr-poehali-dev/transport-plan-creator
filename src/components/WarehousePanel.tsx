import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import WarehouseStatsCards from './warehouse/WarehouseStatsCards';
import WarehouseTable from './warehouse/WarehouseTable';
import WarehouseFormDialog from './warehouse/WarehouseFormDialog';
import WarehouseDeleteDialog from './warehouse/WarehouseDeleteDialog';

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

const initialWarehouses: Warehouse[] = [
  {
    id: 1,
    name: 'Склад "Центральный"',
    location: 'Барнаул, ул. Промышленная 15',
    lat: 53.356,
    lng: 83.769,
    products: [
      { month: 'Декабрь 2025', product: 'Бензин АИ-95', volume: 450 },
      { month: 'Декабрь 2025', product: 'Дизель', volume: 320 },
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
      { month: 'Декабрь 2025', product: 'Бензин АИ-92', volume: 280 },
      { month: 'Декабрь 2025', product: 'Бензин АИ-95', volume: 190 },
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
  const [products, setProducts] = useState<{ product: string; volume: string }[]>([
    { product: '', volume: '' },
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

    const validProducts = products.filter((p) => p.product && p.volume);
    if (validProducts.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте хотя бы одну продукцию',
        variant: 'destructive',
      });
      return;
    }

    const newWarehouse: Warehouse = {
      id: Math.max(0, ...warehouses.map((w) => w.id)) + 1,
      name: formData.name,
      location: formData.location,
      lat: formData.lat ? parseFloat(formData.lat) : undefined,
      lng: formData.lng ? parseFloat(formData.lng) : undefined,
      products: validProducts.map((p) => ({
        month: 'Декабрь 2025',
        product: p.product,
        volume: parseInt(p.volume),
      })),
      totalVolume: validProducts.reduce((sum, p) => sum + parseInt(p.volume), 0),
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

    const validProducts = products.filter((p) => p.product && p.volume);
    if (validProducts.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте хотя бы одну продукцию',
        variant: 'destructive',
      });
      return;
    }

    const updatedWarehouse: Warehouse = {
      ...editWarehouse,
      name: formData.name,
      location: formData.location,
      lat: formData.lat ? parseFloat(formData.lat) : undefined,
      lng: formData.lng ? parseFloat(formData.lng) : undefined,
      products: validProducts.map((p) => ({
        month: 'Декабрь 2025',
        product: p.product,
        volume: parseInt(p.volume),
      })),
      totalVolume: validProducts.reduce((sum, p) => sum + parseInt(p.volume), 0),
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
    setProducts([{ product: '', volume: '' }]);
  };

  const openEditDialog = (warehouse: Warehouse) => {
    setEditWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      location: warehouse.location,
      lat: warehouse.lat?.toString() || '',
      lng: warehouse.lng?.toString() || '',
    });
    setProducts(
      warehouse.products.map((p) => ({
        product: p.product,
        volume: p.volume.toString(),
      }))
    );
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const addProductField = () => {
    setProducts([...products, { product: '', volume: '' }]);
  };

  const removeProductField = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: 'product' | 'volume', value: string) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
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
        onProductUpdate={updateProduct}
        onAddProductField={addProductField}
        onRemoveProductField={removeProductField}
      />

      <WarehouseDeleteDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
