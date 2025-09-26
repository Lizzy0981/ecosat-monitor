/**
 * EcoSat Monitor - Offline Storage Manager
 * Handles IndexedDB storage, caching, and offline synchronization
 * Author: Elizabeth Díaz Familia
 * Version: 1.0.0
 */

class OfflineStorage {
    constructor() {
        this.dbName = 'EcoSatMonitorDB';
        this.dbVersion = 1;
        this.db = null;
        this.isInitialized = false;
        
        this.stores = {
            cache: 'cache',
            userData: 'userData',
            syncQueue: 'syncQueue',
            settings: 'settings',
            achievements: 'achievements'
        };

        this.maxStorageSize = 50 * 1024 * 1024; // 50MB
        this.compressionEnabled = true;
        this.encryptionEnabled = true;
        
        this.syncQueue = [];
        this.isOnline = navigator.onLine;
        
        this.setupNetworkListeners();
    }

    /**
     * Initialize the offline storage system
     */
    async init() {
        try {
            await this.openDatabase();
            await this.setupStores();
            await this.loadSyncQueue();
            this.isInitialized = true;
            console.log('OfflineStorage initialized successfully');
        } catch (error) {
            console.error('Error initializing OfflineStorage:', error);
            throw error;
        }
    }

    /**
     * Open IndexedDB database
     */
    async openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                reject(new Error('Failed to open database'));
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this.createObjectStores(db);
            };
        });
    }

    /**
     * Create object stores for different data types
     */
    createObjectStores(db) {
        // Cache store for API responses
        if (!db.objectStoreNames.contains(this.stores.cache)) {
            const cacheStore = db.createObjectStore(this.stores.cache, { keyPath: 'id' });
            cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
            cacheStore.createIndex('type', 'type', { unique: false });
        }

        // User data store
        if (!db.objectStoreNames.contains(this.stores.userData)) {
            const userStore = db.createObjectStore(this.stores.userData, { keyPath: 'id' });
            userStore.createIndex('userId', 'userId', { unique: false });
            userStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Sync queue store for offline actions
        if (!db.objectStoreNames.contains(this.stores.syncQueue)) {
            const syncStore = db.createObjectStore(this.stores.syncQueue, { keyPath: 'id', autoIncrement: true });
            syncStore.createIndex('priority', 'priority', { unique: false });
            syncStore.createIndex('timestamp', 'timestamp', { unique: false });
            syncStore.createIndex('action', 'action', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains(this.stores.settings)) {
            const settingsStore = db.createObjectStore(this.stores.settings, { keyPath: 'key' });
        }

        // Achievements store
        if (!db.objectStoreNames.contains(this.stores.achievements)) {
            const achievementsStore = db.createObjectStore(this.stores.achievements, { keyPath: 'id' });
            achievementsStore.createIndex('unlockedAt', 'unlockedAt', { unique: false });
        }
    }

    /**
     * Setup object stores after database is ready
     */
    async setupStores() {
        // Verify all stores exist
        const requiredStores = Object.values(this.stores);
        for (const storeName of requiredStores) {
            if (!this.db.objectStoreNames.contains(storeName)) {
                console.warn(`Missing object store: ${storeName}`);
            }
        }
    }

    /**
     * Setup network event listeners
     */
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processSyncQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    /**
     * Store data in cache with optional compression and encryption
     */
    async set(key, data, options = {}) {
        if (!this.isInitialized) {
            throw new Error('OfflineStorage not initialized');
        }

        const {
            ttl = 3600000, // 1 hour default TTL
            compress = this.compressionEnabled,
            encrypt = this.encryptionEnabled,
            type = 'generic'
        } = options;

        try {
            let processedData = data;

            // Compress data if enabled
            if (compress && typeof data === 'object') {
                processedData = await this.compressData(JSON.stringify(data));
            }

            // Encrypt data if enabled
            if (encrypt) {
                processedData = await this.encryptData(processedData);
            }

            const record = {
                id: key,
                data: processedData,
                timestamp: Date.now(),
                ttl: ttl,
                type: type,
                compressed: compress,
                encrypted: encrypt,
                size: this.calculateSize(processedData)
            };

            await this.performTransaction(this.stores.cache, 'readwrite', (store) => {
                return store.put(record);
            });

            // Check storage size and cleanup if necessary
            await this.checkStorageSize();

        } catch (error) {
            console.error('Error storing data:', error);
            throw error;
        }
    }

    /**
     * Retrieve data from cache
     */
    async get(key) {
        if (!this.isInitialized) {
            throw new Error('OfflineStorage not initialized');
        }

        try {
            const record = await this.performTransaction(this.stores.cache, 'readonly', (store) => {
                return store.get(key);
            });

            if (!record) {
                return null;
            }

            // Check if data has expired
            if (Date.now() - record.timestamp > record.ttl) {
                await this.remove(key);
                return null;
            }

            let data = record.data;

            // Decrypt data if encrypted
            if (record.encrypted) {
                data = await this.decryptData(data);
            }

            // Decompress data if compressed
            if (record.compressed) {
                data = await this.decompressData(data);
                data = JSON.parse(data);
            }

            return data;

        } catch (error) {
            console.error('Error retrieving data:', error);
            return null;
        }
    }

    /**
     * Remove data from cache
     */
    async remove(key) {
        if (!this.isInitialized) {
            return false;
        }

        try {
            await this.performTransaction(this.stores.cache, 'readwrite', (store) => {
                return store.delete(key);
            });
            return true;
        } catch (error) {
            console.error('Error removing data:', error);
            return false;
        }
    }

    /**
     * Clear all cached data
     */
    async clearCache() {
        if (!this.isInitialized) {
            return false;
        }

        try {
            await this.performTransaction(this.stores.cache, 'readwrite', (store) => {
                return store.clear();
            });
            return true;
        } catch (error) {
            console.error('Error clearing cache:', error);
            return false;
        }
    }

    /**
     * Get all keys in cache
     */
    async getAllKeys() {
        if (!this.isInitialized) {
            return [];
        }

        try {
            return await this.performTransaction(this.stores.cache, 'readonly', (store) => {
                return store.getAllKeys();
            });
        } catch (error) {
            console.error('Error getting all keys:', error);
            return [];
        }
    }

    /**
     * Add action to sync queue for offline processing
     */
    async addToSyncQueue(action) {
        if (!this.isInitialized) {
            return false;
        }

        const queueItem = {
            action: action.type,
            data: action.data,
            url: action.url,
            method: action.method || 'GET',
            headers: action.headers || {},
            priority: action.priority || 1,
            timestamp: Date.now(),
            retries: 0,
            maxRetries: action.maxRetries || 3
        };

        try {
            await this.performTransaction(this.stores.syncQueue, 'readwrite', (store) => {
                return store.add(queueItem);
            });

            this.syncQueue.push(queueItem);
            return true;
        } catch (error) {
            console.error('Error adding to sync queue:', error);
            return false;
        }
    }

    /**
     * Load sync queue from storage
     */
    async loadSyncQueue() {
        if (!this.isInitialized) {
            return;
        }

        try {
            this.syncQueue = await this.performTransaction(this.stores.syncQueue, 'readonly', (store) => {
                return store.getAll();
            });
        } catch (error) {
            console.error('Error loading sync queue:', error);
            this.syncQueue = [];
        }
    }

    /**
     * Process sync queue when back online
     */
    async processSyncQueue() {
        if (!this.isOnline || this.syncQueue.length === 0) {
            return;
        }

        console.log(`Processing ${this.syncQueue.length} queued items`);

        const processedItems = [];

        for (const item of this.syncQueue) {
            try {
                const success = await this.processQueueItem(item);
                if (success) {
                    processedItems.push(item);
                } else {
                    item.retries++;
                    if (item.retries >= item.maxRetries) {
                        console.warn('Max retries reached for queue item:', item);
                        processedItems.push(item);
                    }
                }
            } catch (error) {
                console.error('Error processing queue item:', error);
                item.retries++;
                if (item.retries >= item.maxRetries) {
                    processedItems.push(item);
                }
            }
        }

        // Remove processed items from queue
        for (const item of processedItems) {
            await this.removeFromSyncQueue(item.id);
            this.syncQueue = this.syncQueue.filter(q => q.id !== item.id);
        }
    }

    /**
     * Process individual queue item
     */
    async processQueueItem(item) {
        try {
            const response = await fetch(item.url, {
                method: item.method,
                headers: item.headers,
                body: item.data ? JSON.stringify(item.data) : undefined
            });

            return response.ok;
        } catch (error) {
            console.error('Error processing queue item:', error);
            return false;
        }
    }

    /**
     * Remove item from sync queue
     */
    async removeFromSyncQueue(itemId) {
        if (!this.isInitialized) {
            return false;
        }

        try {
            await this.performTransaction(this.stores.syncQueue, 'readwrite', (store) => {
                return store.delete(itemId);
            });
            return true;
        } catch (error) {
            console.error('Error removing from sync queue:', error);
            return false;
        }
    }

    /**
     * Store user data
     */
    async setUserData(userId, data) {
        const record = {
            id: `user_${userId}`,
            userId: userId,
            data: data,
            timestamp: Date.now()
        };

        try {
            await this.performTransaction(this.stores.userData, 'readwrite', (store) => {
                return store.put(record);
            });
            return true;
        } catch (error) {
            console.error('Error storing user data:', error);
            return false;
        }
    }

    /**
     * Get user data
     */
    async getUserData(userId) {
        try {
            const record = await this.performTransaction(this.stores.userData, 'readonly', (store) => {
                return store.get(`user_${userId}`);
            });

            return record ? record.data : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }

    /**
     * Store settings
     */
    async setSetting(key, value) {
        const record = {
            key: key,
            value: value,
            timestamp: Date.now()
        };

        try {
            await this.performTransaction(this.stores.settings, 'readwrite', (store) => {
                return store.put(record);
            });
            return true;
        } catch (error) {
            console.error('Error storing setting:', error);
            return false;
        }
    }

    /**
     * Get setting
     */
    async getSetting(key, defaultValue = null) {
        try {
            const record = await this.performTransaction(this.stores.settings, 'readonly', (store) => {
                return store.get(key);
            });

            return record ? record.value : defaultValue;
        } catch (error) {
            console.error('Error getting setting:', error);
            return defaultValue;
        }
    }

    /**
     * Store achievement
     */
    async storeAchievement(achievement) {
        const record = {
            id: achievement.id,
            achievement: achievement,
            unlockedAt: Date.now()
        };

        try {
            await this.performTransaction(this.stores.achievements, 'readwrite', (store) => {
                return store.put(record);
            });
            return true;
        } catch (error) {
            console.error('Error storing achievement:', error);
            return false;
        }
    }

    /**
     * Get all achievements
     */
    async getAllAchievements() {
        try {
            const records = await this.performTransaction(this.stores.achievements, 'readonly', (store) => {
                return store.getAll();
            });

            return records.map(record => record.achievement);
        } catch (error) {
            console.error('Error getting achievements:', error);
            return [];
        }
    }

    /**
     * Perform IndexedDB transaction
     */
    async performTransaction(storeName, mode, operation) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], mode);
            const store = transaction.objectStore(storeName);
            
            const request = operation(store);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Compress data using gzip-like compression
     */
    async compressData(data) {
        if (typeof CompressionStream !== 'undefined') {
            const stream = new CompressionStream('gzip');
            const writer = stream.writable.getWriter();
            const reader = stream.readable.getReader();
            
            writer.write(new TextEncoder().encode(data));
            writer.close();
            
            const chunks = [];
            let done = false;
            
            while (!done) {
                const { value, done: streamDone } = await reader.read();
                done = streamDone;
                if (value) {
                    chunks.push(value);
                }
            }
            
            return new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
        } else {
            // Fallback: simple string compression
            return this.simpleCompress(data);
        }
    }

    /**
     * Decompress data
     */
    async decompressData(compressedData) {
        if (typeof DecompressionStream !== 'undefined' && compressedData instanceof Uint8Array) {
            const stream = new DecompressionStream('gzip');
            const writer = stream.writable.getWriter();
            const reader = stream.readable.getReader();
            
            writer.write(compressedData);
            writer.close();
            
            const chunks = [];
            let done = false;
            
            while (!done) {
                const { value, done: streamDone } = await reader.read();
                done = streamDone;
                if (value) {
                    chunks.push(value);
                }
            }
            
            const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
            return new TextDecoder().decode(decompressed);
        } else {
            // Fallback: simple string decompression
            return this.simpleDecompress(compressedData);
        }
    }

    /**
     * Simple compression fallback
     */
    simpleCompress(data) {
        // Very basic run-length encoding for demo
        return data.replace(/(.)\1+/g, (match, char) => {
            return char + match.length;
        });
    }

    /**
     * Simple decompression fallback
     */
    simpleDecompress(data) {
        // Reverse of simple compression
        return data.replace(/(.)\d+/g, (match, char) => {
            const count = parseInt(match.slice(1));
            return char.repeat(count);
        });
    }

    /**
     * Encrypt data using Web Crypto API
     */
    async encryptData(data) {
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            try {
                const key = await this.getEncryptionKey();
                const iv = crypto.getRandomValues(new Uint8Array(12));
                const encodedData = new TextEncoder().encode(typeof data === 'string' ? data : JSON.stringify(data));
                
                const encrypted = await crypto.subtle.encrypt(
                    { name: 'AES-GCM', iv: iv },
                    key,
                    encodedData
                );
                
                return {
                    encrypted: Array.from(new Uint8Array(encrypted)),
                    iv: Array.from(iv)
                };
            } catch (error) {
                console.warn('Encryption failed, storing unencrypted:', error);
                return data;
            }
        }
        return data;
    }

    /**
     * Decrypt data using Web Crypto API
     */
    async decryptData(encryptedData) {
        if (typeof crypto !== 'undefined' && crypto.subtle && encryptedData.encrypted) {
            try {
                const key = await this.getEncryptionKey();
                const decrypted = await crypto.subtle.decrypt(
                    { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
                    key,
                    new Uint8Array(encryptedData.encrypted)
                );
                
                return new TextDecoder().decode(decrypted);
            } catch (error) {
                console.warn('Decryption failed:', error);
                return encryptedData;
            }
        }
        return encryptedData;
    }

    /**
     * Get or generate encryption key
     */
    async getEncryptionKey() {
        const keyData = localStorage.getItem('ecosat-encryption-key');
        
        if (keyData) {
            const keyBuffer = new Uint8Array(JSON.parse(keyData));
            return await crypto.subtle.importKey('raw', keyBuffer, 'AES-GCM', false, ['encrypt', 'decrypt']);
        } else {
            const key = await crypto.subtle.generateKey(
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );
            
            const exported = await crypto.subtle.exportKey('raw', key);
            localStorage.setItem('ecosat-encryption-key', JSON.stringify(Array.from(new Uint8Array(exported))));
            
            return key;
        }
    }

    /**
     * Calculate data size in bytes
     */
    calculateSize(data) {
        if (typeof data === 'string') {
            return new Blob([data]).size;
        } else if (data instanceof Uint8Array) {
            return data.length;
        } else {
            return new Blob([JSON.stringify(data)]).size;
        }
    }

    /**
     * Check storage size and cleanup if necessary
     */
    async checkStorageSize() {
        try {
            const usage = await this.getStorageUsage();
            
            if (usage.size > this.maxStorageSize) {
                await this.cleanupOldData();
            }
        } catch (error) {
            console.error('Error checking storage size:', error);
        }
    }

    /**
     * Get storage usage statistics
     */
    async getStorageUsage() {
        if (!this.isInitialized) {
            return { size: 0, count: 0 };
        }

        try {
            const records = await this.performTransaction(this.stores.cache, 'readonly', (store) => {
                return store.getAll();
            });

            const totalSize = records.reduce((sum, record) => sum + (record.size || 0), 0);
            
            return {
                size: totalSize,
                count: records.length,
                formatted: this.formatBytes(totalSize)
            };
        } catch (error) {
            console.error('Error getting storage usage:', error);
            return { size: 0, count: 0 };
        }
    }

    /**
     * Cleanup old data to free space
     */
    async cleanupOldData() {
        if (!this.isInitialized) {
            return;
        }

        try {
            const records = await this.performTransaction(this.stores.cache, 'readonly', (store) => {
                return store.getAll();
            });

            // Sort by timestamp (oldest first)
            records.sort((a, b) => a.timestamp - b.timestamp);

            // Remove oldest 25% of records
            const toRemove = records.slice(0, Math.floor(records.length * 0.25));

            for (const record of toRemove) {
                await this.remove(record.id);
            }

            console.log(`Cleaned up ${toRemove.length} old cache entries`);
        } catch (error) {
            console.error('Error cleaning up old data:', error);
        }
    }

    /**
     * Format bytes to human readable format
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Sync pending data when back online
     */
    async syncPendingData() {
        if (!this.isOnline) {
            return false;
        }

        try {
            await this.processSyncQueue();
            return true;
        } catch (error) {
            console.error('Error syncing pending data:', error);
            return false;
        }
    }

    /**
     * Export all data for backup
     */
    async exportData() {
        if (!this.isInitialized) {
            return null;
        }

        try {
            const data = {
                cache: await this.performTransaction(this.stores.cache, 'readonly', (store) => store.getAll()),
                userData: await this.performTransaction(this.stores.userData, 'readonly', (store) => store.getAll()),
                settings: await this.performTransaction(this.stores.settings, 'readonly', (store) => store.getAll()),
                achievements: await this.performTransaction(this.stores.achievements, 'readonly', (store) => store.getAll()),
                exportDate: new Date().toISOString(),
                version: this.dbVersion
            };

            return data;
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    /**
     * Import data from backup
     */
    async importData(data) {
        if (!this.isInitialized || !data) {
            return false;
        }

        try {
            // Clear existing data
            await this.clearCache();

            // Import each store
            if (data.cache) {
                for (const record of data.cache) {
                    await this.performTransaction(this.stores.cache, 'readwrite', (store) => {
                        return store.put(record);
                    });
                }
            }

            if (data.userData) {
                for (const record of data.userData) {
                    await this.performTransaction(this.stores.userData, 'readwrite', (store) => {
                        return store.put(record);
                    });
                }
            }

            if (data.settings) {
                for (const record of data.settings) {
                    await this.performTransaction(this.stores.settings, 'readwrite', (store) => {
                        return store.put(record);
                    });
                }
            }

            if (data.achievements) {
                for (const record of data.achievements) {
                    await this.performTransaction(this.stores.achievements, 'readwrite', (store) => {
                        return store.put(record);
                    });
                }
            }

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    /**
     * Get cache size for display
     */
    async getCacheSize() {
        const usage = await this.getStorageUsage();
        return usage.size;
    }

    /**
     * Close database connection
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
            this.isInitialized = false;
        }
    }

    /**
     * Destroy and cleanup all resources
     */
    async destroy() {
        try {
            await this.clearCache();
            this.close();
            
            // Remove event listeners
            window.removeEventListener('online', this.processSyncQueue);
            window.removeEventListener('offline', () => {});
            
            console.log('OfflineStorage destroyed');
        } catch (error) {
            console.error('Error destroying OfflineStorage:', error);
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OfflineStorage;
}