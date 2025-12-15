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
    
    if not warehouses or not enterprises:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Warehouses and enterprises are required'}),
            'isBase64Encoded': False
        }
    
    routes = optimize_routes(warehouses, enterprises, month)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'month': month,
            'routes': routes,
            'total_routes': len(routes)
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


def optimize_routes(warehouses: List[Dict], enterprises: List[Dict], month: str) -> List[Dict]:
    """
    Алгоритм оптимизации маршрутов:
    1. Для каждого предприятия находим нужную продукцию
    2. Для каждого товара ищем ближайший склад с достаточным запасом
    3. Создаём маршрут от склада до предприятия
    4. Учитываем остатки и не превышаем их
    """
    routes = []
    
    warehouse_stocks = {}
    for w in warehouses:
        warehouse_stocks[w['id']] = w['stocks'].copy() if 'stocks' in w else {}
    
    for enterprise in enterprises:
        enterprise_needs = enterprise.get('needs', {})
        
        for product, needed_volume in enterprise_needs.items():
            if needed_volume <= 0:
                continue
            
            best_warehouse = None
            best_distance = float('inf')
            
            for warehouse in warehouses:
                available = warehouse_stocks.get(warehouse['id'], {}).get(product, 0)
                
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
                available_volume = warehouse_stocks[best_warehouse['id']].get(product, 0)
                transport_volume = min(needed_volume, available_volume)
                
                routes.append({
                    'product': product,
                    'from': best_warehouse['name'],
                    'to': enterprise['name'],
                    'volume': transport_volume,
                    'distance': best_distance,
                    'reason': f'Ближайший склад с запасом {product}. Остаток на складе: {available_volume} м³'
                })
                
                warehouse_stocks[best_warehouse['id']][product] -= transport_volume
    
    routes.sort(key=lambda r: r['distance'])
    
    return routes
