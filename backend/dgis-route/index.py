import json
import os
import urllib.request
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Строит маршрут через 2GIS Directions API
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
    
    api_key = os.environ.get('DGIS_API_KEY')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DGIS_API_KEY not configured'}),
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
    
    # 2GIS Directions API
    url = f'https://catalog.api.2gis.com/carrouting/6.0.0/global?key={api_key}'
    url += f'&start_point={from_lng},{from_lat}&end_point={to_lng},{to_lat}'
    
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            data = json.loads(response.read().decode())
        
        if 'result' not in data or len(data['result']) == 0:
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
        route_data = data['result'][0]
        total_distance = route_data.get('total_distance', 0) / 1000  # метры -> км
        
        coordinates = []
        for maneuver in route_data.get('maneuvers', []):
            if 'outcoming_path' in maneuver and 'geometry' in maneuver['outcoming_path']:
                for point in maneuver['outcoming_path']['geometry']:
                    coordinates.append([point['lat'], point['lon']])
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'coordinates': coordinates if coordinates else [[from_lat, from_lng], [to_lat, to_lng]],
                'distance': round(total_distance, 1),
                'duration': route_data.get('total_duration', 0),
                'fallback': len(coordinates) == 0
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        print(f'2GIS API error: {str(e)}')
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
