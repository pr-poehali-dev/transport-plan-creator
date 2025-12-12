import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ProductsPanel() {
  const products = [
    {
      id: 1,
      name: 'Бензин АИ-95',
      category: 'Нефтепродукты',
      warehouses: 3,
      totalStock: 820,
      consumption: 450,
      production: 180,
    },
    {
      id: 2,
      name: 'Бензин АИ-92',
      category: 'Нефтепродукты',
      warehouses: 2,
      totalStock: 560,
      consumption: 280,
      production: 280,
    },
    {
      id: 3,
      name: 'Дизель',
      category: 'Нефтепродукты',
      warehouses: 2,
      totalStock: 880,
      consumption: 350,
      production: 220,
    },
    {
      id: 4,
      name: 'Нефть',
      category: 'Сырье',
      warehouses: 1,
      totalStock: 1200,
      consumption: 1050,
      production: 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Видов продукции</p>
              <p className="text-3xl font-bold mt-1">12</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Icon name="Package" size={24} className="text-purple-500" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Общий остаток</p>
              <p className="text-3xl font-bold mt-1">3,460</p>
              <p className="text-xs text-muted-foreground">м³</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Icon name="Database" size={24} className="text-blue-500" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Потребление</p>
              <p className="text-3xl font-bold mt-1">2,130</p>
              <p className="text-xs text-muted-foreground">м³/мес</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Icon name="TrendingDown" size={24} className="text-orange-500" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Производство</p>
              <p className="text-3xl font-bold mt-1">680</p>
              <p className="text-xs text-muted-foreground">м³/мес</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={24} className="text-green-500" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Каталог продукции</h3>
            <Button>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить продукцию
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Складов</TableHead>
                <TableHead>Общий остаток</TableHead>
                <TableHead>Потребление/мес</TableHead>
                <TableHead>Производство/мес</TableHead>
                <TableHead>Баланс</TableHead>
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
                  <TableCell className="text-muted-foreground">{product.warehouses} шт</TableCell>
                  <TableCell>
                    <span className="font-semibold">{product.totalStock} м³</span>
                  </TableCell>
                  <TableCell className="text-orange-600">{product.consumption} м³</TableCell>
                  <TableCell className="text-green-600">{product.production} м³</TableCell>
                  <TableCell>
                    {product.production - product.consumption > 0 ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Icon name="TrendingUp" size={14} />
                        <span className="text-sm font-medium">
                          +{product.production - product.consumption} м³
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-orange-600">
                        <Icon name="TrendingDown" size={14} />
                        <span className="text-sm font-medium">
                          {product.production - product.consumption} м³
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm">
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Icon name="BarChart3" size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Icon name="BarChart3" size={18} />
            Топ продукции по остаткам
          </h3>
          <div className="space-y-4">
            {products.slice(0, 3).map((product, idx) => (
              <div key={product.id} className="flex items-center gap-4">
                <div className="text-2xl font-bold text-muted-foreground w-8">#{idx + 1}</div>
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(product.totalStock / 1200) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{product.totalStock} м³</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Icon name="Activity" size={18} />
            Динамика производства
          </h3>
          <div className="space-y-4">
            {products
              .filter((p) => p.production > 0)
              .map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Производство в месяц</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+{product.production} м³</p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
