"""
Оптимизация маршрутов с полным вывозом товаров и распределением машин.
Учитывает: стоянку машин, грузоподъёмность, цепочки рейсов для универсалов.
"""
import json
import os
from typing import Dict, List, Any, Optional, Tuple
import math


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    month = body_data.get('month', '')
    warehouses = body_data.get('warehouses', [])
    enterprises = body_data.get('enterprises', [])
    vehicles = body_data.get('vehicles', [])
    
    print(f"=== Получен запрос: месяц={month}, складов={len(warehouses)}, предприятий={len(enterprises)}, машин={len(vehicles)}")
    
    if not warehouses or not enterprises or not vehicles:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуются склады, предприятия и транспорт'}),
            'isBase64Encoded': False
        }
    
    routes = optimize_routes_full(warehouses, enterprises, vehicles, month)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'month': month,
            'routes': routes,
            'total_routes': len(routes),
            'summary': generate_summary(routes)
        }),
        'isBase64Encoded': False
    }


def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Расчёт расстояния между двумя точками (км)"""
    if not all([lat1, lng1, lat2, lng2]):
        return 999999.0
    
    R = 6371.0
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    
    a = math.sin(delta_lat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return round(R * c, 2)


def normalize_product(name: str) -> str:
    """Нормализация названий продуктов"""
    return name.strip().lower()


def can_vehicle_carry(vehicle: Dict, product: str) -> bool:
    """Проверяет, может ли машина везти данный товар"""
    vehicle_products = [normalize_product(p) for p in vehicle.get('productTypes', [])]
    return normalize_product(product) in vehicle_products


def optimize_routes_full(warehouses: List[Dict], enterprises: List[Dict], vehicles: List[Dict], month: str) -> List[Dict]:
    """
    Полная оптимизация:
    1. Создаём копию остатков складов
    2. Для каждой активной машины:
       - Начинаем от места стоянки
       - Строим цепочку рейсов до полного вывоза товаров
       - Для универсалов: Склад→Завод(погрузка)→ДОК→Склад...
    """
    routes = []
    
    # Копия остатков (будем уменьшать по мере вывоза)
    remaining_stocks = {}
    for w in warehouses:
        stocks_normalized = {}
        for product, volume in w.get('stocks', {}).items():
            key = normalize_product(product)
            if volume > 0:
                stocks_normalized[key] = {
                    'volume': volume,
                    'original_name': product
                }
        remaining_stocks[w['id']] = stocks_normalized
    
    # Копия потребностей (будем уменьшать по мере доставки)
    remaining_needs = {}
    for e in enterprises:
        needs_normalized = {}
        for product, volume in e.get('needs', {}).items():
            key = normalize_product(product)
            if volume > 0:
                needs_normalized[key] = {
                    'volume': volume,
                    'original_name': product
                }
        remaining_needs[e['id']] = needs_normalized
    
    print(f"=== Начальные остатки: {sum(len(s) for s in remaining_stocks.values())} позиций на складах")
    print(f"=== Начальные потребности: {sum(len(n) for n in remaining_needs.values())} позиций на предприятиях")
    
    # Сортируем машины по грузоподъёмности (большие сначала)
    active_vehicles = [v for v in vehicles if v.get('status') == 'active']
    active_vehicles.sort(key=lambda v: v.get('volume', 0), reverse=True)
    
    print(f"=== Активных машин: {len(active_vehicles)}")
    
    # Логирование для диагностики
    all_warehouse_products = set()
    for stocks in remaining_stocks.values():
        all_warehouse_products.update(stocks.keys())
    
    all_vehicle_products = set()
    for v in active_vehicles:
        all_vehicle_products.update(normalize_product(p) for p in v.get('productTypes', []))
    
    print(f"=== Товары на складах: {sorted(all_warehouse_products)}")
    print(f"=== Товары, которые везут машины: {sorted(all_vehicle_products)}")
    
    for vehicle in active_vehicles:
        vehicle_routes = build_vehicle_routes(
            vehicle, warehouses, enterprises, remaining_stocks, remaining_needs
        )
        routes.extend(vehicle_routes)
        
        if vehicle_routes:
            vehicle_id = vehicle.get('licensePlate') or vehicle.get('number', 'Неизвестно')
            print(f"=== Машина {vehicle_id}: создано {len(vehicle_routes)} рейсов")
    
    # Проверяем, что осталось на складах
    total_remaining = sum(
        data['volume'] 
        for warehouse_stocks in remaining_stocks.values() 
        for data in warehouse_stocks.values()
    )
    
    if total_remaining > 0:
        print(f"⚠️ ВНИМАНИЕ: На складах осталось {total_remaining:.1f} м³ товаров")
        for wid, stocks in remaining_stocks.items():
            if stocks:
                warehouse = next((w for w in warehouses if w['id'] == wid), None)
                print(f"   {warehouse['name'] if warehouse else wid}: {stocks}")
    
    return routes


def build_vehicle_routes(
    vehicle: Dict,
    warehouses: List[Dict],
    enterprises: List[Dict],
    remaining_stocks: Dict,
    remaining_needs: Dict
) -> List[Dict]:
    """
    Строит цепочку рейсов для одной машины:
    - Начало: место стоянки машины
    - Цикл: находим ближайший склад с подходящим товаром → везём на нужное предприятие
    - Для универсалов: если везём доски/брус на Завод, загружаемся щепой и везём на ДОК
    """
    vehicle_routes = []
    vehicle_capacity = vehicle.get('volume', 0)
    vehicle_number = vehicle.get('licensePlate') or vehicle.get('number', 'Неизвестно')
    vehicle_products = [normalize_product(p) for p in vehicle.get('productTypes', [])]
    
    # Стоянка машины (предприятие)
    parking_enterprise_name = vehicle.get('enterprise', '')
    parking_enterprise = next((e for e in enterprises if e['name'] == parking_enterprise_name), None)
    
    if not parking_enterprise:
        if enterprises:
            parking_enterprise = enterprises[0]
            print(f"⚠️ Машина {vehicle_number}: предприятие '{parking_enterprise_name}' не найдено, использую {parking_enterprise['name']}")
        else:
            print(f"⚠️ Машина {vehicle_number}: нет доступных предприятий")
            return []
    
    current_lat = parking_enterprise['lat']
    current_lng = parking_enterprise['lng']
    current_location = parking_enterprise['name']
    
    # Флаг: универсал ли?
    is_universal = 'универсал' in normalize_product(vehicle.get('category', ''))
    
    trips_count = 0
    max_trips = 50  # защита от бесконечного цикла
    
    while trips_count < max_trips:
        # Ищем ближайший склад с товаром, который машина может везти
        best_trip = find_best_trip(
            current_lat, current_lng, current_location,
            vehicle, vehicle_products, vehicle_capacity,
            warehouses, enterprises,
            remaining_stocks, remaining_needs
        )
        
        if not best_trip:
            print(f"Машина {vehicle_number}: больше нет подходящих рейсов (сделано {trips_count})")
            break
        
        # Создаём основной маршрут: текущая позиция → склад → предприятие
        main_route = {
            'vehicle': vehicle_number,
            'vehicleType': vehicle.get('category', 'Неизвестно'),
            'product': best_trip['product_original'],
            'volume': best_trip['volume'],
            'from': best_trip['warehouse']['name'],
            'fromLat': best_trip['warehouse']['lat'],
            'fromLng': best_trip['warehouse']['lng'],
            'to': best_trip['enterprise']['name'],
            'toLat': best_trip['enterprise']['lat'],
            'toLng': best_trip['enterprise']['lng'],
            'distance': best_trip['distance_delivery'],
            'parkingDistance': best_trip['distance_to_warehouse']
        }
        
        vehicle_routes.append(main_route)
        
        # Обновляем остатки и потребности
        warehouse_id = best_trip['warehouse']['id']
        enterprise_id = best_trip['enterprise']['id']
        product_key = best_trip['product_key']
        
        remaining_stocks[warehouse_id][product_key]['volume'] -= best_trip['volume']
        if remaining_stocks[warehouse_id][product_key]['volume'] <= 0:
            del remaining_stocks[warehouse_id][product_key]
        
        if product_key in remaining_needs[enterprise_id]:
            remaining_needs[enterprise_id][product_key]['volume'] -= best_trip['volume']
            if remaining_needs[enterprise_id][product_key]['volume'] <= 0:
                del remaining_needs[enterprise_id][product_key]
        
        # Универсал на Заводе: загружаем щепой и везём на Павловский ДОК
        if is_universal and best_trip['enterprise']['name'] == 'Завод':
            dok_enterprise = next((e for e in enterprises if 'павловский док' in normalize_product(e['name'])), None)
            
            if dok_enterprise and 'щепа' in vehicle_products:
                # Проверяем, нужна ли щепа на ДОКе
                dok_needs = remaining_needs.get(dok_enterprise['id'], {})
                chips_key = normalize_product('Щепа')
                
                if chips_key in dok_needs:
                    chips_volume = min(vehicle_capacity, dok_needs[chips_key]['volume'])
                    chips_distance = calculate_distance(
                        best_trip['enterprise']['lat'], best_trip['enterprise']['lng'],
                        dok_enterprise['lat'], dok_enterprise['lng']
                    )
                    
                    chips_route = {
                        'vehicle': vehicle_number,
                        'vehicleType': vehicle.get('category', 'Универсал'),
                        'product': 'Щепа',
                        'volume': chips_volume,
                        'from': 'Завод',
                        'fromLat': best_trip['enterprise']['lat'],
                        'fromLng': best_trip['enterprise']['lng'],
                        'to': dok_enterprise['name'],
                        'toLat': dok_enterprise['lat'],
                        'toLng': dok_enterprise['lng'],
                        'distance': chips_distance,
                        'parkingDistance': 0  # уже в пути
                    }
                    
                    vehicle_routes.append(chips_route)
                    
                    # Обновляем потребности ДОКа
                    remaining_needs[dok_enterprise['id']][chips_key]['volume'] -= chips_volume
                    if remaining_needs[dok_enterprise['id']][chips_key]['volume'] <= 0:
                        del remaining_needs[dok_enterprise['id']][chips_key]
                    
                    # Текущая позиция = Павловский ДОК
                    current_lat = dok_enterprise['lat']
                    current_lng = dok_enterprise['lng']
                    current_location = dok_enterprise['name']
                else:
                    # Щепа не нужна, возвращаемся на склад
                    current_lat = best_trip['enterprise']['lat']
                    current_lng = best_trip['enterprise']['lng']
                    current_location = best_trip['enterprise']['name']
            else:
                # Нет ДОКа или машина не везёт щепу
                current_lat = best_trip['enterprise']['lat']
                current_lng = best_trip['enterprise']['lng']
                current_location = best_trip['enterprise']['name']
        else:
            # Обычная машина или не завод
            current_lat = best_trip['enterprise']['lat']
            current_lng = best_trip['enterprise']['lng']
            current_location = best_trip['enterprise']['name']
        
        trips_count += 1
    
    return vehicle_routes


def find_best_trip(
    current_lat: float,
    current_lng: float,
    current_location: str,
    vehicle: Dict,
    vehicle_products: List[str],
    vehicle_capacity: float,
    warehouses: List[Dict],
    enterprises: List[Dict],
    remaining_stocks: Dict,
    remaining_needs: Dict
) -> Optional[Dict]:
    """
    Находит лучший рейс: ближайший склад с товаром → предприятие с потребностью
    Возвращает: {warehouse, enterprise, product_key, product_original, volume, distance_to_warehouse, distance_delivery}
    """
    best_trip = None
    best_total_distance = float('inf')
    
    for warehouse in warehouses:
        warehouse_stocks = remaining_stocks.get(warehouse['id'], {})
        if not warehouse_stocks:
            continue
        
        distance_to_warehouse = calculate_distance(
            current_lat, current_lng,
            warehouse['lat'], warehouse['lng']
        )
        
        for product_key, stock_data in warehouse_stocks.items():
            if product_key not in vehicle_products:
                continue
            
            available_volume = stock_data['volume']
            if available_volume <= 0:
                continue
            
            # Ищем предприятие, которому нужен этот товар
            for enterprise in enterprises:
                enterprise_needs_dict = remaining_needs.get(enterprise['id'], {})
                if product_key not in enterprise_needs_dict:
                    continue
                
                needed_volume = enterprise_needs_dict[product_key]['volume']
                if needed_volume <= 0:
                    continue
                
                distance_delivery = calculate_distance(
                    warehouse['lat'], warehouse['lng'],
                    enterprise['lat'], enterprise['lng']
                )
                
                total_distance = distance_to_warehouse + distance_delivery
                
                if total_distance < best_total_distance:
                    transport_volume = min(vehicle_capacity, available_volume, needed_volume)
                    
                    best_trip = {
                        'warehouse': warehouse,
                        'enterprise': enterprise,
                        'product_key': product_key,
                        'product_original': stock_data['original_name'],
                        'volume': transport_volume,
                        'distance_to_warehouse': distance_to_warehouse,
                        'distance_delivery': distance_delivery
                    }
                    best_total_distance = total_distance
    
    return best_trip


def generate_summary(routes: List[Dict]) -> Dict:
    """Генерирует сводку по маршрутам"""
    if not routes:
        return {'total_distance': 0, 'total_volume': 0, 'vehicles_used': 0}
    
    total_distance = sum(r.get('distance', 0) + r.get('parkingDistance', 0) for r in routes)
    total_volume = sum(r.get('volume', 0) for r in routes)
    vehicles_used = len(set(r.get('vehicle', '') for r in routes))
    
    return {
        'total_distance': round(total_distance, 1),
        'total_volume': round(total_volume, 1),
        'vehicles_used': vehicles_used,
        'trips_count': len(routes)
    }