from dataiku.customwebapp import *
import json

# Simple test endpoint
@app.route('/first_api_call')
def first_api_call():
    """First API call endpoint for webapp initialization"""
    try:
        result = {
            "status": "success", 
            "message": "Well Log Analysis backend is running",
            "backend_version": "1.0.0"
        }
        return json.dumps(result), 200, {'Content-Type': 'application/json'}
    except Exception as e:
        error_result = {"status": "error", "message": str(e)}
        return json.dumps(error_result), 500, {'Content-Type': 'application/json'}

@app.route('/get_datasets')
def get_datasets():
    """API endpoint to get available datasets"""
    try:
        # Simple test response
        result = {
            "status": "success",
            "datasets": ["test_dataset_1", "test_dataset_2"],
            "message": "Found 2 datasets"
        }
        return json.dumps(result), 200, {'Content-Type': 'application/json'}
    except Exception as e:
        error_result = {"status": "error", "message": str(e)}
        return json.dumps(error_result), 500, {'Content-Type': 'application/json'}

@app.route('/test')
def test():
    """Simple test endpoint"""
    result = {
        "status": "success",
        "message": "Test endpoint working"
    }
    return json.dumps(result), 200, {'Content-Type': 'application/json'}
