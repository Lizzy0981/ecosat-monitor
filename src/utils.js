/**
 * EcoSat Monitor - Utility Functions
 * Helper functions for common operations and calculations
 * Author: Elizabeth Díaz Familia
 * Version: 1.0.0
 */

const Utils = {
    /**
     * Format numbers with locale-specific formatting
     */
    formatNumber: (number, options = {}) => {
        const defaults = {
            locale: 'es-ES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        };
        
        const config = { ...defaults, ...options };
        
        try {
            return new Intl.NumberFormat(config.locale, config).format(number);
        } catch (error) {
            return number.toString();
        }
    },

    /**
     * Format bytes to human readable format
     */
    formatBytes: (bytes, decimals = 2) => {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    /**
     * Debounce function execution
     */
    debounce: (func, wait, immediate = false) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    /**
     * Throttle function execution
     */
    throttle: (func, limit) => {
        let lastFunc;
        let lastRan;
        return function(...args) {
            if (!lastRan) {
                func(...args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    if ((Date.now() - lastRan) >= limit) {
                        func(...args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    },

    /**
     * Deep clone an object
     */
    deepClone: (obj) => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));
        
        const cloned = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = Utils.deepClone(obj[key]);
            }
        }
        return cloned;
    },

    /**
     * Generate unique ID
     */
    generateId: (prefix = '') => {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return prefix + timestamp + random;
    },

    /**
     * Calculate distance between two coordinates (Haversine formula)
     */
    calculateDistance: (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of Earth in kilometers
        const dLat = Utils.toRadians(lat2 - lat1);
        const dLon = Utils.toRadians(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(Utils.toRadians(lat1)) * Math.cos(Utils.toRadians(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in kilometers
    },

    /**
     * Convert degrees to radians
     */
    toRadians: (degrees) => degrees * (Math.PI / 180),

    /**
     * Convert radians to degrees
     */
    toDegrees: (radians) => radians * (180 / Math.PI),

    /**
     * Clamp a value between min and max
     */
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),

    /**
     * Linear interpolation between two values
     */
    lerp: (start, end, factor) => start + (end - start) * factor,

    /**
     * Map a value from one range to another
     */
    map: (value, inMin, inMax, outMin, outMax) => {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    /**
     * Check if a value is within a range
     */
    inRange: (value, min, max) => value >= min && value <= max,

    /**
     * Get AQI color based on value
     */
    getAQIColor: (aqi) => {
        if (aqi <= 50) return '#4ade80'; // Good - Green
        if (aqi <= 100) return '#fbbf24'; // Moderate - Yellow
        if (aqi <= 150) return '#fb923c'; // Unhealthy for sensitive - Orange
        if (aqi <= 200) return '#ef4444'; // Unhealthy - Red
        if (aqi <= 300) return '#a855f7'; // Very unhealthy - Purple
        return '#7c2d12'; // Hazardous - Maroon
    },

    /**
     * Get temperature color based on value
     */
    getTemperatureColor: (temp) => {
        if (temp <= -10) return '#3b82f6'; // Very cold - Blue
        if (temp <= 0) return '#06b6d4'; // Cold - Cyan
        if (temp <= 10) return '#10b981'; // Cool - Green
        if (temp <= 20) return '#84cc16'; // Mild - Light green
        if (temp <= 30) return '#eab308'; // Warm - Yellow
        if (temp <= 40) return '#f97316'; // Hot - Orange
        return '#ef4444'; // Very hot - Red
    },

    /**
     * Format date relative to now
     */
    formatRelativeTime: (date) => {
        const now = new Date();
        const diffMs = now - date;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSeconds < 60) return 'hace un momento';
        if (diffMinutes < 60) return `hace ${diffMinutes} min`;
        if (diffHours < 24) return `hace ${diffHours}h`;
        if (diffDays < 7) return `hace ${diffDays}d`;
        
        return date.toLocaleDateString();
    },

    /**
     * Check if device is mobile
     */
    isMobile: () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Check if device supports touch
     */
    isTouchDevice: () => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    /**
     * Get device type
     */
    getDeviceType: () => {
        if (Utils.isMobile()) return 'mobile';
        if (Utils.isTouchDevice()) return 'tablet';
        return 'desktop';
    },

    /**
     * Local storage with error handling
     */
    storage: {
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Storage set error:', error);
                return false;
            }
        },

        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Storage get error:', error);
                return defaultValue;
            }
        },

        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Storage remove error:', error);
                return false;
            }
        },

        clear: () => {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Storage clear error:', error);
                return false;
            }
        },

        exists: (key) => {
            return localStorage.getItem(key) !== null;
        },

        size: () => {
            return localStorage.length;
        },

        getAllKeys: () => {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                keys.push(localStorage.key(i));
            }
            return keys;
        }
    },

    /**
     * URL utilities
     */
    url: {
        getParams: () => {
            const params = {};
            const urlParams = new URLSearchParams(window.location.search);
            for (const [key, value] of urlParams.entries()) {
                params[key] = value;
            }
            return params;
        },

        setParam: (key, value) => {
            const url = new URL(window.location.href);
            url.searchParams.set(key, value);
            window.history.replaceState({}, '', url.toString());
        },

        removeParam: (key) => {
            const url = new URL(window.location.href);
            url.searchParams.delete(key);
            window.history.replaceState({}, '', url.toString());
        },

        buildQuery: (params) => {
            const query = new URLSearchParams(params);
            return query.toString();
        }
    },

    /**
     * Validation utilities
     */
    validate: {
        email: (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        coordinates: (lat, lng) => {
            return (
                typeof lat === 'number' && 
                typeof lng === 'number' &&
                lat >= -90 && lat <= 90 &&
                lng >= -180 && lng <= 180
            );
        },

        url: (url) => {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        },

        aqi: (value) => {
            return typeof value === 'number' && value >= 0 && value <= 500;
        },

        temperature: (value) => {
            return typeof value === 'number' && value >= -100 && value <= 100;
        },

        isEmpty: (value) => {
            if (value === null || value === undefined) return true;
            if (typeof value === 'string') return value.trim() === '';
            if (Array.isArray(value)) return value.length === 0;
            if (typeof value === 'object') return Object.keys(value).length === 0;
            return false;
        }
    },

    /**
     * Array utilities
     */
    array: {
        unique: (array) => [...new Set(array)],

        groupBy: (array, key) => {
            return array.reduce((groups, item) => {
                const group = typeof key === 'function' ? key(item) : item[key];
                groups[group] = groups[group] || [];
                groups[group].push(item);
                return groups;
            }, {});
        },

        sortBy: (array, key, direction = 'asc') => {
            return [...array].sort((a, b) => {
                const aVal = typeof key === 'function' ? key(a) : a[key];
                const bVal = typeof key === 'function' ? key(b) : b[key];
                
                if (aVal < bVal) return direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return direction === 'asc' ? 1 : -1;
                return 0;
            });
        },

        shuffle: (array) => {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        },

        chunk: (array, size) => {
            const chunks = [];
            for (let i = 0; i < array.length; i += size) {
                chunks.push(array.slice(i, i + size));
            }
            return chunks;
        },

        flatten: (array) => {
            return array.reduce((flat, item) => {
                return flat.concat(Array.isArray(item) ? Utils.array.flatten(item) : item);
            }, []);
        }
    },

    /**
     * String utilities
     */
    string: {
        capitalize: (str) => {
            if (typeof str !== 'string' || str.length === 0) return str;
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        },

        camelCase: (str) => {
            return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            }).replace(/\s+/g, '');
        },

        kebabCase: (str) => {
            return str
                .replace(/([a-z])([A-Z])/g, '$1-$2')
                .replace(/[\s_]+/g, '-')
                .toLowerCase();
        },

        truncate: (str, length = 50, suffix = '...') => {
            if (typeof str !== 'string') return str;
            if (str.length <= length) return str;
            return str.substring(0, length - suffix.length) + suffix;
        },

        stripHtml: (html) => {
            const div = document.createElement('div');
            div.innerHTML = html;
            return div.textContent || div.innerText || '';
        },

        escapeHtml: (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    },

    /**
     * Date utilities
     */
    date: {
        format: (date, locale = 'es-ES', options = {}) => {
            const defaultOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            const config = { ...defaultOptions, ...options };
            
            try {
                return new Intl.DateTimeFormat(locale, config).format(date);
            } catch (error) {
                return date.toString();
            }
        },

        addDays: (date, days) => {
            const result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        },

        addHours: (date, hours) => {
            const result = new Date(date);
            result.setHours(result.getHours() + hours);
            return result;
        },

        isToday: (date) => {
            const today = new Date();
            return date.toDateString() === today.toDateString();
        },

        isYesterday: (date) => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return date.toDateString() === yesterday.toDateString();
        },

        daysBetween: (date1, date2) => {
            const diffTime = Math.abs(date2 - date1);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
    },

    /**
     * DOM utilities
     */
    dom: {
        createElement: (tag, attributes = {}, children = []) => {
            const element = document.createElement(tag);
            
            Object.keys(attributes).forEach(key => {
                if (key === 'className') {
                    element.className = attributes[key];
                } else if (key === 'dataset') {
                    Object.keys(attributes[key]).forEach(dataKey => {
                        element.dataset[dataKey] = attributes[key][dataKey];
                    });
                } else {
                    element.setAttribute(key, attributes[key]);
                }
            });
            
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else {
                    element.appendChild(child);
                }
            });
            
            return element;
        },

        addClass: (element, className) => {
            if (element && className) {
                element.classList.add(className);
            }
        },

        removeClass: (element, className) => {
            if (element && className) {
                element.classList.remove(className);
            }
        },

        toggleClass: (element, className) => {
            if (element && className) {
                element.classList.toggle(className);
            }
        },

        hasClass: (element, className) => {
            return element && className && element.classList.contains(className);
        },

        fadeIn: (element, duration = 300) => {
            element.style.opacity = '0';
            element.style.display = 'block';
            
            let start = null;
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const opacity = Math.min(progress / duration, 1);
                
                element.style.opacity = opacity;
                
                if (progress < duration) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        },

        fadeOut: (element, duration = 300) => {
            const initialOpacity = parseFloat(window.getComputedStyle(element).opacity);
            
            let start = null;
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const opacity = Math.max(initialOpacity - (progress / duration), 0);
                
                element.style.opacity = opacity;
                
                if (progress < duration) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.display = 'none';
                }
            };
            
            requestAnimationFrame(animate);
        }
    },

    /**
     * Performance utilities
     */
    performance: {
        measure: (name, fn) => {
            const start = performance.now();
            const result = fn();
            const end = performance.now();
            console.log(`${name} took ${end - start} milliseconds`);
            return result;
        },

        measureAsync: async (name, fn) => {
            const start = performance.now();
            const result = await fn();
            const end = performance.now();
            console.log(`${name} took ${end - start} milliseconds`);
            return result;
        },

        fps: (() => {
            let fps = 0;
            let frames = 0;
            let lastTime = performance.now();
            
            const calculate = () => {
                frames++;
                const currentTime = performance.now();
                
                if (currentTime >= lastTime + 1000) {
                    fps = Math.round((frames * 1000) / (currentTime - lastTime));
                    frames = 0;
                    lastTime = currentTime;
                }
                
                requestAnimationFrame(calculate);
            };
            
            requestAnimationFrame(calculate);
            
            return () => fps;
        })()
    },

    /**
     * Math utilities
     */
    math: {
        randomBetween: (min, max) => Math.random() * (max - min) + min,
        
        randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
        
        roundTo: (number, decimals) => {
            const factor = Math.pow(10, decimals);
            return Math.round(number * factor) / factor;
        },
        
        percentage: (value, total) => (value / total) * 100,
        
        average: (numbers) => numbers.reduce((sum, num) => sum + num, 0) / numbers.length,
        
        median: (numbers) => {
            const sorted = [...numbers].sort((a, b) => a - b);
            const middle = Math.floor(sorted.length / 2);
            
            if (sorted.length % 2 === 0) {
                return (sorted[middle - 1] + sorted[middle]) / 2;
            }
            
            return sorted[middle];
        },
        
        standardDeviation: (numbers) => {
            const avg = Utils.math.average(numbers);
            const squareDiffs = numbers.map(value => Math.pow(value - avg, 2));
            const avgSquareDiff = Utils.math.average(squareDiffs);
            return Math.sqrt(avgSquareDiff);
        }
    },

    /**
     * Network utilities
     */
    network: {
        isOnline: () => navigator.onLine,
        
        ping: async (url = '/favicon.ico') => {
            try {
                const start = performance.now();
                await fetch(url, { 
                    method: 'HEAD',
                    mode: 'no-cors',
                    cache: 'no-cache'
                });
                const end = performance.now();
                return end - start;
            } catch (error) {
                throw new Error('Network unreachable');
            }
        },
        
        getConnectionType: () => {
            if (navigator.connection) {
                return navigator.connection.effectiveType;
            }
            return 'unknown';
        }
    },

    /**
     * Color utilities
     */
    color: {
        hexToRgb: (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },
        
        rgbToHex: (r, g, b) => {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        },
        
        darken: (hex, amount) => {
            const rgb = Utils.color.hexToRgb(hex);
            if (!rgb) return hex;
            
            const factor = 1 - amount;
            return Utils.color.rgbToHex(
                Math.round(rgb.r * factor),
                Math.round(rgb.g * factor),
                Math.round(rgb.b * factor)
            );
        },
        
        lighten: (hex, amount) => {
            const rgb = Utils.color.hexToRgb(hex);
            if (!rgb) return hex;
            
            return Utils.color.rgbToHex(
                Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount)),
                Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount)),
                Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount))
            );
        }
    },

    /**
     * Cookie utilities
     */
    cookie: {
        set: (name, value, days = 7) => {
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
        },
        
        get: (name) => {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            
            return null;
        },
        
        delete: (name) => {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
        }
    },

    /**
     * Error handling
     */
    error: {
        handle: (error, context = '') => {
            const errorInfo = {
                message: error.message,
                stack: error.stack,
                context,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            console.error('Error:', errorInfo);
            
            // Store error for analytics
            const errors = Utils.storage.get('app_errors', []);
            errors.push(errorInfo);
            
            // Keep only last 10 errors
            if (errors.length > 10) {
                errors.shift();
            }
            
            Utils.storage.set('app_errors', errors);
            
            return errorInfo;
        },
        
        getStoredErrors: () => {
            return Utils.storage.get('app_errors', []);
        },
        
        clearStoredErrors: () => {
            Utils.storage.remove('app_errors');
        }
    },

    /**
     * Initialize utilities
     */
    init: () => {
        console.log('🔧 EcoSat Utils initialized');
        
        // Set up global error handler
        window.addEventListener('error', (event) => {
            Utils.error.handle(event.error, 'Global error handler');
        });
        
        // Set up unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            Utils.error.handle(event.reason, 'Unhandled promise rejection');
        });
        
        return Utils;
    }
};

// Initialize utils when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Utils.init);
} else {
    Utils.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.EcoSatUtils = Utils;
}