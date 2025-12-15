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
    
    # 2GIS Routing API (новый формат)
    url = f'https://routing.api.2gis.com/routing/7.0.0/global?key={api_key}'
    
    request_body = {
        "points": [
            {"type": "stop", "lon": from_lng, "lat": from_lat},
            {"type": "stop", "lon": to_lng, "lat": to_lat}
        ],
        "transport": "driving",
        "route_mode": "fastest"
    }
    
    print(f'2GIS request body: {json.dumps(request_body, ensure_ascii=False)}')
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(request_body).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
        
        print(f'2GIS response: {json.dumps(data, ensure_ascii=False)[:500]}')
        
        if 'result' not in data or not isinstance(data['result'], list) or len(data['result']) == 0:
            print('2GIS: No routes found in response')
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'coordinates': [[from_lat, from_lng], [to_lat, to_lng]],
                    'distance': 0,
                    'duration': 0,
                    'fallback': True
                }),
                'isBase64Encoded': False
            }
        
        # Извлекаем координаты маршрута из нового формата API
        route = data['result'][0]
        total_distance = route.get('total_distance', 0) / 1000  # метры -> км
        total_duration = route.get('total_duration', 0) / 60  # секунды -> минуты
        
        coordinates = []
        # Новый формат: legs -> steps -> geometry
        for leg in route.get('legs', []):
            for step in leg.get('steps', []):
                if 'geometry' in step:
                    for point in step['geometry']:
                        coordinates.append([point['lat'], point['lon']])
        
        print(f'2GIS: Extracted {len(coordinates)} coordinates, distance={total_distance}km')
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'coordinates': coordinates if coordinates else [[from_lat, from_lng], [to_lat, to_lng]],
                'distance': round(total_distance, 1),
                'duration': round(total_duration),
                'fallback': len(coordinates) == 0
            }),
            'isBase64Encoded': False
        }
    
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else 'No error body'
        print(f'2GIS API HTTP error {e.code}: {error_body}')
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'coordinates': [[from_lat, from_lng], [to_lat, to_lng]],
                'distance': 0,
                'fallback': True,
                'error': f'HTTP {e.code}: {error_body[:200]}'
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