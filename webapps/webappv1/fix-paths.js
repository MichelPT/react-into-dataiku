// Fix-paths.js - Script untuk memperbaiki path Next.js di lingkungan Dataiku
(function() {
    'use strict';
    
    console.log('Fix-paths.js loaded - Initializing Next.js path fixes for Dataiku');
    
    // Fungsi untuk memperbaiki path relatif
    function fixRelativePaths() {
        const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');
        
        // Fix untuk semua link yang dimulai dengan /_next/
        document.querySelectorAll('link[href^="/_next/"], script[src^="/_next/"]').forEach(element => {
            const originalPath = element.getAttribute('href') || element.getAttribute('src');
            if (originalPath.startsWith('/_next/')) {
                const newPath = `../../resources/out${originalPath}`;
                if (element.tagName === 'LINK') {
                    element.setAttribute('href', newPath);
                } else if (element.tagName === 'SCRIPT') {
                    element.setAttribute('src', newPath);
                }
                console.log(`Fixed path: ${originalPath} -> ${newPath}`);
            }
        });
        
        // Fix untuk favicon
        document.querySelectorAll('link[rel="icon"]').forEach(element => {
            const originalPath = element.getAttribute('href');
            if (originalPath === '/favicon.ico') {
                const newPath = '../../resources/out/favicon.ico';
                element.setAttribute('href', newPath);
                console.log(`Fixed favicon: ${originalPath} -> ${newPath}`);
            }
        });
        
        // Fix untuk asset paths yang mungkin di-load dinamis
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            if (typeof url === 'string' && url.startsWith('/_next/')) {
                url = `../../resources/out${url}`;
                console.log(`Fixed fetch URL: ${url}`);
            }
            return originalFetch.call(this, url, options);
        };
    }
    
    // Jalankan setelah DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixRelativePaths);
    } else {
        fixRelativePaths();
    }
    
    // Observasi perubahan DOM untuk path yang di-load dinamis
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Check untuk script dan link baru
                        const scripts = node.querySelectorAll ? node.querySelectorAll('script[src^="/_next/"]') : [];
                        const links = node.querySelectorAll ? node.querySelectorAll('link[href^="/_next/"]') : [];
                        
                        [...scripts, ...links].forEach(element => {
                            const attr = element.tagName === 'SCRIPT' ? 'src' : 'href';
                            const originalPath = element.getAttribute(attr);
                            if (originalPath.startsWith('/_next/')) {
                                const newPath = `../../resources/out${originalPath}`;
                                element.setAttribute(attr, newPath);
                                console.log(`Fixed dynamic path: ${originalPath} -> ${newPath}`);
                            }
                        });
                    }
                });
            }
        });
    });
    
    // Mulai observasi
    observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
    });
    
    console.log('Fix-paths.js initialization complete');
})();
