#!/usr/bin/env python3

# Minimal backend test - no dataiku imports
import json
import sys
import os

# Add the parent directory to the path to access dataiku modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from dataiku.customwebapp import *
    print("Successfully imported dataiku.customwebapp", file=sys.stderr)
except Exception as e:
    print(f"Failed to import dataiku.customwebapp: {e}", file=sys.stderr)
    # Create a minimal Flask app for testing
    from flask import Flask
    app = Flask(__name__)

@app.route('/first_api_call')
def first_api_call():
    """First API call endpoint for webapp initialization"""
    try:
        result = {
            "status": "success", 
            "message": "Well Log Analysis backend is running",
            "backend_version": "1.0.0"
        }
        response = json.dumps(result)
        print(f"Returning: {response}", file=sys.stderr)
        return response, 200, {'Content-Type': 'application/json'}
    except Exception as e:
        print(f"Error in first_api_call: {e}", file=sys.stderr)
        error_result = {"status": "error", "message": str(e)}
        return json.dumps(error_result), 500, {'Content-Type': 'application/json'}

@app.route('/get_datasets')
def get_datasets():
    """API endpoint to get available datasets"""
    try:
        result = {
            "status": "success",
            "datasets": ["test_dataset_1", "test_dataset_2"],
            "message": "Found 2 datasets"
        }
        response = json.dumps(result)
        print(f"Returning: {response}", file=sys.stderr)
        return response, 200, {'Content-Type': 'application/json'}
    except Exception as e:
        print(f"Error in get_datasets: {e}", file=sys.stderr)
        error_result = {"status": "error", "message": str(e)}
        return json.dumps(error_result), 500, {'Content-Type': 'application/json'}

@app.route('/test')
def test():
    """Simple test endpoint"""
    try:
        result = {
            "status": "success",
            "message": "Test endpoint working"
        }
        response = json.dumps(result)
        print(f"Returning: {response}", file=sys.stderr)
        return response, 200, {'Content-Type': 'application/json'}
    except Exception as e:
        print(f"Error in test: {e}", file=sys.stderr)
        error_result = {"status": "error", "message": str(e)}
        return json.dumps(error_result), 500, {'Content-Type': 'application/json'}

if __name__ == '__main__':
    print("Starting backend in standalone mode", file=sys.stderr)
    app.run(debug=True, host='0.0.0.0', port=5000)
else:
    print("Backend loaded as module", file=sys.stderr)
