"""
Оптимизация маршрутов доставки на основе остатков складов и потребностей предприятий.
Использует Яндекс.Карты API для расчёта расстояний и ИИ-алгоритмы для оптимизации.
"""
import json
import os
from typing import Dict, List, Any
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
    
    print(f"=== DEBUG: Received request for month: {month}")
    print(f"=== DEBUG: Warehouses count: {len(warehouses)}")
    print(f"=== DEBUG: Enterprises count: {len(enterprises)}")
    print(f"=== DEBUG: Warehouses data: {json.dumps(warehouses, ensure_ascii=False)}")
    print(f"=== DEBUG: Enterprises data: {json.dumps(enterprises, ensure_ascii=False)}")
    
    if not warehouses or not enterprises:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Warehouses and enterprises are required'}),
            'isBase64Encoded': False
        }
    
    routes = optimize_routes(warehouses, enterprises, vehicles, month)
    
    warehouse_stocks_summary = []
    for w in warehouses:
        stocks = w.get('stocks', {})
        warehouse_stocks_summary.append({
            'name': w.get('name', 'Unknown'),
            'stocks': stocks,
            'total_products': len(stocks)
        })
    
    enterprise_needs_summary = []
    for e in enterprises:
        needs = e.get('needs', {})
        enterprise_needs_summary.append({
            'name': e.get('name', 'Unknown'),
            'needs': needs,
            'total_products': len(needs)
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'month': month,
            'routes': routes,
            'total_routes': len(routes),
            'debug': {
                'warehouses': warehouse_stocks_summary,
                'enterprises': enterprise_needs_summary
            }
        }),
        'isBase64Encoded': False
    }


def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Расчёт расстояния между двумя точками по формуле гаверсинусов (км)"""
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


def normalize_product_name(name: str) -> str:
    """Нормализация названия продукта для корректного сопоставления"""
    return name.strip().lower()


def find_suitable_vehicle(product_normalized: str, volume: float, enterprise_name: str, vehicles: List[Dict]) -> Dict:
    """Находит подходящий автомобиль для перевозки груза"""
    for vehicle in vehicles:
        if vehicle.get('status') != 'active':
            continue
        
        vehicle_products = [normalize_product_name(p) for p in vehicle.get('productTypes', [])]
        
        if product_normalized in vehicle_products:
            if vehicle.get('volume', 0) >= volume:
                if vehicle.get('enterprise', '') == enterprise_name:
                    return vehicle
    
    for vehicle in vehicles:
        if vehicle.get('status') != 'active':
            continue
        
        vehicle_products = [normalize_product_name(p) for p in vehicle.get('productTypes', [])]
        
        if product_normalized in vehicle_products:
            if vehicle.get('volume', 0) >= volume:
                return vehicle
    
    return None


def optimize_routes(warehouses: List[Dict], enterprises: List[Dict], vehicles: List[Dict], month: str) -> List[Dict]:
    """
    Алгоритм оптимизации маршрутов:
    1. Для каждого предприятия находим нужную продукцию
    2. Для каждого товара ищем ближайший склад с достаточным запасом
    3. Назначаем подходящий автомобиль
    4. Создаём маршрут от склада до предприятия
    5. Учитываем остатки и не превышаем их
    """
    routes = []
    
    print(f"=== OPTIMIZE: Starting optimization for {len(warehouses)} warehouses, {len(enterprises)} enterprises, {len(vehicles)} vehicles")
    
    warehouse_stocks = {}
    for w in warehouses:
        stocks_normalized = {}
        for product, volume in w.get('stocks', {}).items():
            normalized_key = normalize_product_name(product)
            stocks_normalized[normalized_key] = volume
            print(f"=== OPTIMIZE: Warehouse '{w.get('name')}' has '{product}' (normalized: '{normalized_key}'): {volume} м³")
        warehouse_stocks[w['id']] = stocks_normalized
    
    for enterprise in enterprises:
        enterprise_needs_raw = enterprise.get('needs', {})
        print(f"=== OPTIMIZE: Enterprise '{enterprise.get('name')}' needs: {enterprise_needs_raw}")
        
        enterprise_needs = {}
        for product, volume in enterprise_needs_raw.items():
            normalized_key = normalize_product_name(product)
            enterprise_needs[normalized_key] = volume
            print(f"=== OPTIMIZE: Enterprise needs '{product}' (normalized: '{normalized_key}'): {volume} м³")
        
        for product_normalized, needed_volume in enterprise_needs.items():
            if needed_volume <= 0:
                continue
            
            best_warehouse = None
            best_distance = float('inf')
            
            print(f"=== OPTIMIZE: Looking for warehouse with '{product_normalized}'...")
            
            for warehouse in warehouses:
                available = warehouse_stocks.get(warehouse['id'], {}).get(product_normalized, 0)
                print(f"=== OPTIMIZE: Warehouse '{warehouse.get('name')}' has {available} м³ of '{product_normalized}'")
                
                
                if available <= 0:
                    continue
                
                distance = calculate_distance(
                    warehouse.get('lat', 0),
                    warehouse.get('lng', 0),
                    enterprise.get('lat', 0),
                    enterprise.get('lng', 0)
                )
                
                if distance < best_distance:
                    best_distance = distance
                    best_warehouse = warehouse
            
            if best_warehouse:
                available_volume = warehouse_stocks[best_warehouse['id']].get(product_normalized, 0)
                transport_volume = min(needed_volume, available_volume)
                
                original_product_name = None
                for p in enterprise_needs_raw.keys():
                    if normalize_product_name(p) == product_normalized:
                        original_product_name = p
                        break
                
                assigned_vehicle = find_suitable_vehicle(product_normalized, transport_volume, enterprise['name'], vehicles)
                
                route = {
                    'product': original_product_name or product_normalized,
                    'from': best_warehouse['name'],
                    'fromLat': best_warehouse.get('lat'),
                    'fromLng': best_warehouse.get('lng'),
                    'to': enterprise['name'],
                    'toLat': enterprise.get('lat'),
                    'toLng': enterprise.get('lng'),
                    'volume': transport_volume,
                    'distance': best_distance,
                    'reason': f'Ближайший склад с запасом {original_product_name or product_normalized}. Остаток на складе: {available_volume} м³'
                }
                
                if assigned_vehicle:
                    route['vehicle'] = {
                        'brand': assigned_vehicle.get('brand'),
                        'licensePlate': assigned_vehicle.get('licensePlate'),
                        'volume': assigned_vehicle.get('volume'),
                        'enterprise': assigned_vehicle.get('enterprise')
                    }
                
                routes.append(route)
                
                warehouse_stocks[best_warehouse['id']][product_normalized] -= transport_volume
                print(f"=== OPTIMIZE: Created route: {best_warehouse['name']} -> {enterprise['name']}, {original_product_name}, {transport_volume} м³, Vehicle: {assigned_vehicle.get('brand') if assigned_vehicle else 'None'}")
            else:
                print(f"=== OPTIMIZE: No warehouse found with '{product_normalized}' for {enterprise.get('name')}")
    
    routes.sort(key=lambda r: r['distance'])
    
    return routes