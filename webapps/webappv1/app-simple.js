/**
 * Simple Dataiku Webapp Frontend Logic
 * Connects Next.js frontend with Python backend
 */

console.log('🚀 Loading Dataiku Webapp app.js...');

// Global Dataiku App namespace
window.DataikuApp = window.DataikuApp || {};

// App configuration
window.DataikuApp.config = {
    backendUrl: './backend',
    nextjsPath: '../../resources/out',
    debug: true
};

// Utility functions
window.DataikuApp.utils = {
    log: function(message, level = 'info') {
        if (window.DataikuApp.config.debug) {
            console[level](`[DataikuApp] ${message}`);
        }
    },
    
    // Call Python backend
    callBackend: async function(endpoint, data = null) {
        try {
            const options = {
                method: data ? 'POST' : 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            
            if (data) {
                options.body = JSON.stringify(data);
            }
            
            window.DataikuApp.utils.log(`🔗 Calling backend: ${endpoint}`);
            const response = await fetch(window.DataikuApp.config.backendUrl + endpoint, options);
            const result = await response.json();
            
            window.DataikuApp.utils.log(`✅ Backend response ${endpoint}: ${response.status}`);
            return result;
        } catch (error) {
            window.DataikuApp.utils.log(`❌ Backend error ${endpoint}: ${error.message}`, 'error');
            return { error: error.message, success: false };
        }
    }
};

// Backend integration
window.DataikuApp.backend = {
    // Test backend connection
    testConnection: async function() {
        try {
            window.DataikuApp.utils.log('🔍 Testing backend connection...');
            const result = await window.DataikuApp.utils.callBackend('');
            window.DataikuApp.utils.log('✅ Backend connection successful');
            return result;
        } catch (error) {
            window.DataikuApp.utils.log('❌ Backend connection failed', 'error');
            return { error: error.message, success: false };
        }
    },
    
    // Get status
    getStatus: async function() {
        return await window.DataikuApp.utils.callBackend('');
    },
    
    // Process data (example)
    processData: async function(data) {
        return await window.DataikuApp.utils.callBackend('', data);
    }
};

// Initialize when called from body.html
window.DataikuApp.init = function() {
    window.DataikuApp.utils.log('🔥 Initializing DataikuApp...');
    
    // Test backend connection
    window.DataikuApp.backend.testConnection()
        .then(result => {
            if (result.error) {
                window.DataikuApp.utils.log('⚠️ Backend not available, continuing without it');
            } else {
                window.DataikuApp.utils.log('🎉 Backend connection established');
            }
        });
        
    window.DataikuApp.utils.log('✅ DataikuApp initialized successfully');
};

// Auto-initialize when DOM is ready (if not already initialized)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (!window.DataikuApp.initialized) {
            window.DataikuApp.init();
            window.DataikuApp.initialized = true;
        }
    });
} else if (!window.DataikuApp.initialized) {
    window.DataikuApp.init();
    window.DataikuApp.initialized = true;
}

window.DataikuApp.utils.log('📦 app.js loaded successfully');
