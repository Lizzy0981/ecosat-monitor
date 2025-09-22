/**
 * EcoSat Monitor - Service Worker
 * Handles caching, offline functionality, and background sync
 * Author: Elizabeth Díaz Familia
 * Version: 1.0.0
 */

const CACHE_NAME = 'ecosat-monitor-v1.0.0';
const DATA_CACHE_NAME = 'ecosat-data-v1.0.0';
const UPDATE_CACHE_NAME = 'ecosat-updates-v1.0.0';

// Files to cache for offline functionality
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/data-manager.js',
    '/satellite-service.js',
    '/charts-controller.js',
    '/gamification.js',
    '/offline-storage.js',
    '/translations.js',
    '/utils.js',
    '/manifest.json',
    
    // External dependencies
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
    
    // Fallback pages
    '/offline.html',
    
    // Essential icons
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png'
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

// Background sync configuration
const BACKGROUND_SYNC = {
    tag: 'ecosat-background-sync',
    maxRetentionTime: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Service Worker Installation
 */
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Pre-caching app shell');
            return cache.addAll(FILES_TO_CACHE);
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
        console.log('[ServiceWorker] Network failed, trying cache:', error);
        
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
        // Check if cache is stale
        const cacheTime = new Date(cachedResponse.headers.get('sw-cache-time') || 0);
        const now = new Date();
        const maxAge = getMaxAge(request.url);
        
        if (now - cacheTime < maxAge) {
            return cachedResponse;
        }
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Add cache timestamp
            const responseClone = networkResponse.clone();
            const headers = new Headers(responseClone.headers);
            headers.set('sw-cache-time', new Date().toISOString());
            
            const newResponse = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: headers
            });
            
            cache.put(request, newResponse.clone());
            return newResponse;
        }
    } catch (error) {
        console.log('[ServiceWorker] Network failed for static asset:', error);
    }
    
    // Return cached version if available
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
        console.log('[ServiceWorker] Navigation request failed, serving offline page');
        
        // Try to serve the main page from cache
        const cachedResponse = await caches.match('/index.html');
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback to offline page
        return caches.match('/offline.html');
    }
}

/**
 * Background Sync Event Handler
 */
self.addEventListener('sync', (event) => {
    console.log('[ServiceWorker] Background sync triggered:', event.tag);
    
    if (event.tag === BACKGROUND_SYNC.tag) {
        event.waitUntil(handleBackgroundSync());
    }
});

/**
 * Handle background synchronization
 */
async function handleBackgroundSync() {
    try {
        console.log('[ServiceWorker] Performing background sync');
        
        // Get pending sync data from IndexedDB
        const pendingData = await getPendingData();
        
        if (pendingData.length > 0) {
            for (const item of pendingData) {
                try {
                    await syncDataItem(item);
                    await removePendingData(item.id);
                } catch (error) {
                    console.error('[ServiceWorker] Failed to sync item:', error);
                }
            }
        }
        
        // Update cached data
        await updateCachedData();
        
        console.log('[ServiceWorker] Background sync completed');
    } catch (error) {
        console.error('[ServiceWorker] Background sync failed:', error);
    }
}

/**
 * Push Event Handler for notifications
 */
self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Push message received');
    
    const options = {
        body: 'Nuevos datos ambientales disponibles',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        tag: 'ecosat-notification',
        data: {
            url: '/'
        },
        actions: [
            {
                action: 'view',
                title: 'Ver datos',
                icon: '/assets/icons/action-view.png'
            },
            {
                action: 'dismiss',
                title: 'Descartar',
                icon: '/assets/icons/action-dismiss.png'
            }
        ]
    };
    
    if (event.data) {
        const data = event.data.json();
        options.body = data.message || options.body;
        options.data = { ...options.data, ...data };
    }
    
    event.waitUntil(
        self.registration.showNotification('EcoSat Monitor', options)
    );
});

/**
 * Notification Click Handler
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[ServiceWorker] Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'view' || !event.action) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url || '/')
        );
    }
});

/**
 * Message Handler for communication with main thread
 */
self.addEventListener('message', (event) => {
    console.log('[ServiceWorker] Message received:', event.data);
    
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    } else if (event.data.action === 'getCacheSize') {
        getCacheSize().then(size => {
            event.ports[0].postMessage({ size });
        });
    } else if (event.data.action === 'clearCache') {
        clearDataCache().then(success => {
            event.ports[0].postMessage({ success });
        });
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

function getMaxAge(url) {
    if (url.includes('api')) return CACHE_MAX_AGE.api;
    if (url.match(/\.(png|jpg|jpeg|svg|ico)$/)) return CACHE_MAX_AGE.images;
    return CACHE_MAX_AGE.static;
}

async function getPendingData() {
    // This would typically read from IndexedDB
    // Simplified implementation for demo
    return [];
}

async function syncDataItem(item) {
    const response = await fetch(item.url, {
        method: item.method || 'POST',
        headers: item.headers || { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
    });
    
    if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
    }
    
    return response;
}

async function removePendingData(id) {
    // This would typically remove from IndexedDB
    console.log('[ServiceWorker] Removed pending data:', id);
}

async function updateCachedData() {
    try {
        const cache = await caches.open(DATA_CACHE_NAME);
        
        // Update essential API endpoints
        const essentialEndpoints = [
            '/api/global-metrics',
            '/api/cities-data',
            '/api/chart-data'
        ];
        
        for (const endpoint of essentialEndpoints) {
            try {
                const response = await fetch(endpoint);
                if (response.ok) {
                    await cache.put(endpoint, response);
                }
            } catch (error) {
                console.log('[ServiceWorker] Failed to update cached endpoint:', endpoint);
            }
        }
    } catch (error) {
        console.error('[ServiceWorker] Failed to update cached data:', error);
    }
}

async function getCacheSize() {
    try {
        const cacheNames = await caches.keys();
        let totalSize = 0;
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            
            for (const request of requests) {
                const response = await cache.match(request);
                if (response) {
                    const blob = await response.blob();
                    totalSize += blob.size;
                }
            }
        }
        
        return totalSize;
    } catch (error) {
        console.error('[ServiceWorker] Failed to calculate cache size:', error);
        return 0;
    }
}

async function clearDataCache() {
    try {
        const deleted = await caches.delete(DATA_CACHE_NAME);
        console.log('[ServiceWorker] Data cache cleared:', deleted);
        return deleted;
    } catch (error) {
        console.error('[ServiceWorker] Failed to clear data cache:', error);
        return false;
    }
}

/**
 * Periodic cache cleanup
 */
function scheduleCleanup() {
    setInterval(async () => {
        try {
            const cache = await caches.open(DATA_CACHE_NAME);
            const requests = await cache.keys();
            const now = new Date();
            
            for (const request of requests) {
                const response = await cache.match(request);
                if (response) {
                    const cacheTime = new Date(response.headers.get('sw-cache-time') || 0);
                    const maxAge = getMaxAge(request.url);
                    
                    if (now - cacheTime > maxAge) {
                        await cache.delete(request);
                        console.log('[ServiceWorker] Cleaned expired cache entry:', request.url);
                    }
                }
            }
        } catch (error) {
            console.error('[ServiceWorker] Cache cleanup failed:', error);
        }
    }, 60 * 60 * 1000); // Run every hour
}

// Initialize cleanup scheduler
scheduleCleanup();

console.log('[ServiceWorker] Service Worker loaded successfully');