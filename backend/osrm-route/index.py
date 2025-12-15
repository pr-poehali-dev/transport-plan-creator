import json
import urllib.request
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Прокси для OSRM с fallback на прямые линии
    Принимает: fromLat, fromLng, toLat, toLng
    Возвращает: координаты маршрута, расстояние, время
    '''
    method: str = event.get('httpMethod', 'GET')
    
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
    from_lat = body_data.get('fromLat')
    from_lng = body_data.get('fromLng')
    to_lat = body_data.get('toLat')
    to_lng = body_data.get('toLng')
    
    if not all([from_lat, from_lng, to_lat, to_lng]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing coordinates'}),
            'isBase64Encoded': False
        }
    
    # Пробуем OSRM
    url = f'https://router.project-osrm.org/route/v1/driving/{from_lng},{from_lat};{to_lng},{to_lat}?overview=full&geometries=geojson'
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'TransportPlanner/1.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
        
        if data.get('code') == 'Ok' and data.get('routes'):
            route = data['routes'][0]
            coords = [[c[1], c[0]] for c in route['geometry']['coordinates']]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'coordinates': coords,
                    'distance': round(route['distance'] / 1000, 1),
                    'duration': round(route['duration'] / 60),
                    'fallback': False
                }),
                'isBase64Encoded': False
            }
    except Exception as e:
        print(f'OSRM error: {str(e)}')
    
    # Fallback: изогнутая линия с примерным расчётом
    from math import radians, sin, cos, sqrt, atan2
    
    R = 6371
    lat1, lon1 = radians(from_lat), radians(from_lng)
    lat2, lon2 = radians(to_lat), radians(to_lng)
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c
    
    # Создаём изогнутую линию с промежуточными точками (имитация дороги)
    curve_coords = []
    steps = 8  # Количество промежуточных точек
    for i in range(steps + 1):
        t = i / steps
        # Интерполяция с небольшим отклонением для имитации дороги
        mid_lat = from_lat + (to_lat - from_lat) * t
        mid_lng = from_lng + (to_lng - from_lng) * t
        
        # Добавляем небольшое отклонение для создания кривой
        if 0 < i < steps:
            offset = sin(t * 3.14159) * 0.02  # Максимальное отклонение 0.02 градуса
            mid_lat += offset * (to_lng - from_lng) / abs(to_lng - from_lng) if to_lng != from_lng else 0
        
        curve_coords.append([mid_lat, mid_lng])
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'coordinates': curve_coords,
            'distance': round(distance * 1.3, 1),
            'duration': round(distance * 1.3 / 60 * 60),
            'fallback': True
        }),
        'isBase64Encoded': False
    }