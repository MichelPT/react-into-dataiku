from dataiku.customwebapp import *
import json
import traceback
import dataiku

# Simple test endpoints
@app.route('/first_api_call')
def first_api_call():
    """Test endpoint to verify backend connectivity"""
    try:
        return json.dumps({
            'status': 'success',
            'message': 'Backend connected successfully',
            'timestamp': str(datetime.now()) if 'datetime' in globals() else 'N/A'
        })
    except Exception as e:
        return json.dumps({
            'status': 'error',
            'message': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/get_datasets')
def get_datasets():
    """Get available datasets in the current project"""
    try:
        client = dataiku.api_client()
        project_key = dataiku.default_project_key()
        project = client.get_project(project_key)
        
        datasets = []
        for dataset in project.list_datasets():
            datasets.append({
                'name': dataset['name'],
                'type': dataset.get('type', 'unknown')
            })
        
        return json.dumps({
            'status': 'success',
            'project_key': project_key,
            'datasets': datasets,
            'count': len(datasets)
        })
    except Exception as e:
        return json.dumps({
            'status': 'error',
            'message': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/test')
def test():
    """Simple test endpoint"""
    return json.dumps({
        'status': 'success',
        'message': 'Test endpoint working',
        'dataiku_available': 'dataiku' in globals()
    })

# Import datetime if available
try:
    from datetime import datetime
except ImportError:
    pass
