import json
import os
import urllib.request
import urllib.parse
from typing import Dict, Any, List, Tuple

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Строит маршрут между двумя точками используя Яндекс.Маршрутизатор
    Принимает: fromLat, fromLng, toLat, toLng
    Возвращает: координаты маршрута и расстояние
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
    
    api_key = os.environ.get('YANDEX_MAPS_API_KEY')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'YANDEX_MAPS_API_KEY not configured'}),
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
    
    # Яндекс.Маршрутизатор API
    url = f'https://api.routing.yandex.net/v2/route?apikey={api_key}'
    url += f'&waypoints={from_lng},{from_lat}|{to_lng},{to_lat}'
    url += '&mode=driving&avoid_tolls=false'
    
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            data = json.loads(response.read().decode())
        
        if 'route' not in data or 'legs' not in data['route']:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'coordinates': [[from_lat, from_lng], [to_lat, to_lng]],
                    'distance': 0,
                    'fallback': True
                }),
                'isBase64Encoded': False
            }
        
        # Извлекаем координаты маршрута
        coordinates: List[Tuple[float, float]] = []
        total_distance = 0
        
        for leg in data['route']['legs']:
            for step in leg.get('steps', []):
                if 'polyline' in step:
                    for point in step['polyline']['points']:
                        coordinates.append([point[1], point[0]])  # lat, lng
            total_distance += leg.get('distance', {}).get('value', 0)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'coordinates': coordinates if coordinates else [[from_lat, from_lng], [to_lat, to_lng]],
                'distance': total_distance / 1000,  # km
                'fallback': len(coordinates) == 0
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        print(f'Yandex API error: {str(e)}')
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'coordinates': [[from_lat, from_lng], [to_lat, to_lng]],
                'distance': 0,
                'fallback': True,
                'error': str(e)
            }),
            'isBase64Encoded': False
        }
