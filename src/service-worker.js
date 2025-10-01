/**
 * EcoSat Monitor - Service Worker
 * Handles caching, offline functionality, and background sync
 * Author: Elizabeth Díaz Familia
 * Version: 1.1.0 - Fixed for GitHub Pages
 */

const CACHE_NAME = 'ecosat-monitor-v1.1.0';
const DATA_CACHE_NAME = 'ecosat-data-v1.1.0';
const UPDATE_CACHE_NAME = 'ecosat-updates-v1.1.0';

// Files to cache for offline functionality - RUTAS RELATIVAS
const FILES_TO_CACHE = [
    './',
    './index.html',
    './offline.html',
    './manifest.json',
    './src/styles.css',
    './src/app.js',
    './src/data-manager.js',
    './src/satellite-service.js',
    './src/charts-controller.js',
    './src/gamification.js',
    './src/offline-storage.js',
    './src/translations.js',
    './src/utils.js',
    
    // External dependencies
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
    /^https:\/\/api\.nasa\.gov/,
    /^https:\/\/api\.openweathermap\.org/,
    /^https:\/\/www\.ncei\.noaa\.gov/,
    /^https:\/\/api\.worldbank\.org/
];

// Cache strategies configuration
const CACHE_STRATEGIES = {
    'cache-first': ['css', 'js', 'images', 'fonts'],
    'network-first': ['api', 'data'],
    'stale-while-revalidate': ['html', 'json']
};

// Maximum cache age (in milliseconds)
const CACHE_MAX_AGE = {
    static: 7 * 24 * 60 * 60 * 1000,    // 7 days
    api: 5 * 60 * 1000,                 // 5 minutes
    images: 30 * 24 * 60 * 60 * 1000    // 30 days
};

/**
 * Service Worker Installation
 */
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Pre-caching app shell');
            return cache.addAll(FILES_TO_CACHE).catch(err => {
                console.error('[ServiceWorker] Failed to cache files:', err);
                // Continue even if some files fail to cache
                return Promise.resolve();
            });
        }).then(() => {
            console.log('[ServiceWorker] Installation successful');
            return self.skipWaiting();
        }).catch((error) => {
            console.error('[ServiceWorker] Installation failed:', error);
        })
    );
});

/**
 * Service Worker Activation
 */
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && 
                        cacheName !== DATA_CACHE_NAME && 
                        cacheName !== UPDATE_CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[ServiceWorker] Activation complete');
            return self.clients.claim();
        })
    );
});

/**
 * Fetch Event Handler - Main caching logic
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle API requests
    if (isAPIRequest(url)) {
        event.respondWith(handleAPIRequest(request));
        return;
    }
    
    // Handle static assets
    if (isStaticAsset(url)) {
        event.respondWith(handleStaticAsset(request));
        return;
    }
    
    // Handle navigation requests
    if (request.mode === 'navigate') {
        event.respondWith(handleNavigationRequest(request));
        return;
    }
    
    // Default: network first with cache fallback
    event.respondWith(
        fetch(request).catch(() => {
            return caches.match(request);
        })
    );
});

/**
 * Handle API requests with network-first strategy
 */
async function handleAPIRequest(request) {
    const cacheName = DATA_CACHE_NAME;
    
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful responses
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
    } catch (error) {
        console.log('[ServiceWorker] Network failed, trying cache');
        
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline response for API failures
        return new Response(
            JSON.stringify({
                error: 'Offline',
                message: 'No cached data available',
                timestamp: new Date().toISOString()
            }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

/**
 * Handle static assets with cache-first strategy
 */
async function handleStaticAsset(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
    } catch (error) {
        console.log('[ServiceWorker] Network failed for static asset');
    }
    
    // Return cached version if available or 404
    return cachedResponse || new Response('Asset not available offline', { status: 404 });
}

/**
 * Handle navigation requests
 */
async function handleNavigationRequest(request) {
    try {
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        console.log('[ServiceWorker] Navigation request failed, serving cached page');
        
        // Try to serve the main page from cache
        const cachedResponse = await caches.match('./index.html') || 
                              await caches.match('./') ||
                              await caches.match('./offline.html');
        
        return cachedResponse || new Response('Offline', { status: 503 });
    }
}

/**
 * Message Handler for communication with main thread
 */
self.addEventListener('message', (event) => {
    console.log('[ServiceWorker] Message received:', event.data);
    
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});

/**
 * Utility Functions
 */

function isAPIRequest(url) {
    return API_CACHE_PATTERNS.some(pattern => pattern.test(url.href));
}

function isStaticAsset(url) {
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2'];
    return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

console.log('[ServiceWorker] Service Worker loaded successfully');
