#!/usr/bin/env python

from dataiku.customwebapp import *
import json

# Simple test endpoint
@app.route('/test')
def test():
    return json.dumps({'status': 'success', 'message': 'Backend is working'})

# Test the first_api_call endpoint
@app.route('/first_api_call')
def first_api_call():
    return json.dumps({'status': 'success', 'message': 'Backend connected successfully'})

if __name__ == '__main__':
    app.run(debug=True)
