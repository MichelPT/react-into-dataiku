// Simple fix-paths.js for Dataiku environment
(function() {
    'use strict';
    
    console.log('Fix-paths.js loaded for Dataiku webapp');
    
    // Function to fix paths in the current document
    function fixPaths() {
        const baseResourcePath = '../../resources/out';
        
        // Fix all links and scripts with /_next/ paths
        document.querySelectorAll('link[href^="/_next/"], script[src^="/_next/"]').forEach(function(element) {
            const attr = element.tagName === 'LINK' ? 'href' : 'src';
            const originalPath = element.getAttribute(attr);
            
            if (originalPath && originalPath.startsWith('/_next/')) {
                const newPath = baseResourcePath + originalPath;
                element.setAttribute(attr, newPath);
                console.log('Fixed path:', originalPath, '->', newPath);
            }
        });
        
        // Fix favicon
        const favicon = document.querySelector('link[rel="icon"][href="/favicon.ico"]');
        if (favicon) {
            favicon.setAttribute('href', baseResourcePath + '/favicon.ico');
            console.log('Fixed favicon path');
        }
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixPaths);
    } else {
        fixPaths();
    }
    
    // Also run after a delay to catch dynamically loaded assets
    setTimeout(fixPaths, 1000);
    
    console.log('Fix-paths.js initialization complete');
})();
