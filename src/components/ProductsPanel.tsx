import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

interface Product {
  id: number;
  name: string;
  category: string;
}

const initialProducts: Product[] = [
  { id: 1, name: 'Бензин АИ-95', category: 'Нефтепродукты' },
  { id: 2, name: 'Бензин АИ-92', category: 'Нефтепродукты' },
  { id: 3, name: 'Дизель', category: 'Нефтепродукты' },
  { id: 4, name: 'Нефть', category: 'Сырье' },
];

export default function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
    window.dispatchEvent(new Event('storage'));
  }, [products]);

  const handleDelete = () => {
    if (deleteId) {
      setProducts(products.filter((p) => p.id !== deleteId));
      toast({
        title: 'Продукция удалена',
        description: 'Продукция успешно удалена из справочника',
      });
      setDeleteId(null);
    }
  };

  const handleAdd = () => {
    if (!formData.name || !formData.category) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    const newProduct: Product = {
      id: Math.max(0, ...products.map((p) => p.id)) + 1,
      name: formData.name,
      category: formData.category,
    };

    setProducts([...products, newProduct]);
    toast({
      title: 'Продукция добавлена',
      description: 'Новая продукция успешно добавлена в справочник',
    });
    setIsAddDialogOpen(false);
    setFormData({ name: '', category: '' });
  };

  const handleEdit = () => {
    if (!editProduct) return;

    if (!formData.name || !formData.category) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    const updatedProduct: Product = {
      ...editProduct,
      name: formData.name,
      category: formData.category,
    };

    setProducts(products.map((p) => (p.id === editProduct.id ? updatedProduct : p)));
    toast({
      title: 'Продукция обновлена',
      description: 'Информация о продукции успешно обновлена',
    });
    setEditProduct(null);
    setFormData({ name: '', category: '' });
  };

  const openEditDialog = (product: Product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
    });
  };

  const openAddDialog = () => {
    setFormData({ name: '', category: '' });
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Видов продукции</p>
              <p className="text-3xl font-bold mt-1">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Icon name="Package" size={24} className="text-purple-500" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Категорий</p>
              <p className="text-3xl font-bold mt-1">
                {new Set(products.map((p) => p.category)).size}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Icon name="FolderOpen" size={24} className="text-blue-500" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Справочник продукции</h3>
            <Button onClick={openAddDialog}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить продукцию
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(product.id)}
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

      <Dialog
        open={isAddDialogOpen || editProduct !== null}
        onOpenChange={() => {
          setIsAddDialogOpen(false);
          setEditProduct(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editProduct ? 'Редактировать продукцию' : 'Добавить продукцию'}</DialogTitle>
            <DialogDescription>Заполните информацию о продукции</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                placeholder="Бензин АИ-95"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="category">Категория</Label>
              <Input
                id="category"
                placeholder="Нефтепродукты"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setEditProduct(null);
              }}
            >
              Отмена
            </Button>
            <Button onClick={editProduct ? handleEdit : handleAdd}>
              {editProduct ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить продукцию?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Продукция будет удалена из справочника.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
