/**
 * EcoSat Monitor - Translations Manager
 * Handles internationalization (i18n) for Spanish and English
 * Author: Elizabeth Díaz Familia
 * Version: 1.0.0
 */

class Translations {
    constructor() {
        this.currentLanguage = 'es';
        this.fallbackLanguage = 'es';
        this.supportedLanguages = ['es', 'en'];
        
        this.translations = this.initializeTranslations();
        this.observers = [];
        this.isInitialized = false;
    }

    /**
     * Initialize translations database
     */
    initializeTranslations() {
        return {
            es: {
                // Header and Navigation
                'header.live': 'EN VIVO',
                'nav.dashboard': 'Dashboard',
                'nav.cities': 'Ciudades',
                'nav.analytics': 'Analytics',
                'nav.rankings': 'Rankings',
                'nav.achievements': 'Logros',

                // Loading Screen
                'loading.title': 'Conectando con satélites...',
                'loading.subtitle': 'Obteniendo datos ambientales en tiempo real',

                // Metrics
                'metrics.air_quality': 'Calidad del Aire',
                'metrics.temperature': 'Temperatura Global',
                'metrics.green_index': 'Índice Verde',
                'metrics.co2_levels': 'Niveles CO2',

                // Status
                'status.good': 'Bueno',
                'status.moderate': 'Moderado',
                'status.above_average': 'Sobre promedio',
                'status.critical': 'Crítico',

                // Dashboard
                'dashboard.world_map': 'Mapa Global Interactivo',
                'dashboard.sustainability_score': 'Puntuación de Sostenibilidad',
                'dashboard.realtime_data': 'Datos en Tiempo Real',
                'dashboard.recent_achievements': 'Logros Recientes',
                'dashboard.top_cities': 'Ciudades Destacadas',

                // Map
                'map.air_quality': 'Calidad del Aire',
                'map.temperature': 'Temperatura',
                'map.vegetation': 'Vegetación',
                'map.pollution': 'Contaminación',

                // Legend
                'legend.good': 'Bueno',
                'legend.moderate': 'Moderado',
                'legend.unhealthy': 'No saludable',
                'legend.critical': 'Crítico',

                // Scores
                'scores.air_quality': 'Calidad del Aire',
                'scores.green_spaces': 'Espacios Verdes',
                'scores.energy_efficiency': 'Eficiencia Energética',
                'scores.carbon_footprint': 'Huella de Carbono',

                // Period
                'period.today': 'Hoy',
                'period.week': 'Esta semana',
                'period.month': 'Este mes',

                // Chart
                'chart.co2_levels': 'Niveles CO2',
                'chart.air_quality': 'Calidad del Aire',
                'chart.temperature': 'Temperatura',
                'chart.humidity': 'Humedad',

                // Timeframe
                'timeframe.24h': 'Últimas 24h',
                'timeframe.7d': 'Últimos 7 días',
                'timeframe.30d': 'Últimos 30 días',

                // Stats
                'stats.current': 'Actual',
                'stats.trend': 'Tendencia',
                'stats.average': 'Promedio',

                // Achievements
                'achievements.tree_hugger': 'Abrazador de Árboles',
                'achievements.tree_hugger_desc': 'Monitoreó 50 ciudades con alta cobertura verde',
                'achievements.data_explorer': 'Explorador de Datos',
                'achievements.data_explorer_desc': 'Accedió a datos satelitales 100 veces',
                'achievements.weekly_warrior': 'Guerrero Semanal',
                'achievements.weekly_warrior_desc': '7 días consecutivos monitoreando',

                // Rarity
                'rarity.common': 'Común',
                'rarity.rare': 'Raro',
                'rarity.epic': 'Épico',
                'rarity.legendary': 'Legendario',

                // Filter
                'filter.best': 'Mejores',
                'filter.worst': 'Peores',
                'filter.improved': 'Más mejoradas',

                // Common
                'common.view_all': 'Ver todos',
                'common.loading': 'Cargando...',
                'common.error': 'Error',
                'common.retry': 'Reintentar',
                'common.close': 'Cerrar',
                'common.save': 'Guardar',
                'common.cancel': 'Cancelar',
                'common.ok': 'Aceptar',
                'common.yes': 'Sí',
                'common.no': 'No',

                // Offline
                'offline.message': 'Modo offline activado',
                'offline.sync': 'Sincronizando datos...',
                'offline.synced': 'Datos sincronizados',

                // Update
                'update.available': 'Nueva versión disponible',
                'update.install': 'Actualizar',
                'update.installing': 'Instalando actualización...',
                'update.completed': 'Actualización completada',

                // Settings
                'settings.title': 'Configuración',
                'settings.general': 'General',
                'settings.auto_update': 'Actualizaciones automáticas',
                'settings.notifications': 'Notificaciones',
                'settings.offline_mode': 'Modo offline',
                'settings.data': 'Datos',
                'settings.update_frequency': 'Frecuencia de actualización',
                'settings.cache_size': 'Tamaño de caché',
                'settings.clear_cache': 'Limpiar',
                'settings.about': 'Acerca de',
                'settings.description': 'Dashboard de sostenibilidad urbana con datos satelitales',
                'settings.developer': 'Desarrollado por Elizabeth Díaz Familia',
                'settings.github': 'GitHub',
                'settings.linkedin': 'LinkedIn',

                // Frequency
                'frequency.1min': '1 minuto',
                'frequency.5min': '5 minutos',
                'frequency.15min': '15 minutos',
                'frequency.30min': '30 minutos',

                // Messages
                'messages.data_updated': 'Datos actualizados correctamente',
                'messages.cache_cleared': 'Caché limpiado correctamente',
                'messages.settings_saved': 'Configuración guardada',
                'messages.connection_error': 'Error de conexión',
                'messages.loading_data': 'Cargando datos ambientales...',

                // Cities
                'cities.new_york': 'Nueva York',
                'cities.london': 'Londres',
                'cities.tokyo': 'Tokio',
                'cities.sao_paulo': 'São Paulo',
                'cities.delhi': 'Delhi',
                'cities.sydney': 'Sídney',
                'cities.cairo': 'El Cairo',
                'cities.mexico_city': 'Ciudad de México',

                // Environmental terms
                'env.air_quality_index': 'Índice de Calidad del Aire',
                'env.carbon_dioxide': 'Dióxido de Carbono',
                'env.vegetation_index': 'Índice de Vegetación',
                'env.urban_heat_island': 'Isla de Calor Urbano',
                'env.deforestation': 'Deforestación',
                'env.sustainability': 'Sostenibilidad',
                'env.pollution': 'Contaminación',
                'env.greenhouse_gases': 'Gases de Efecto Invernadero',

                // Units
                'units.ppm': 'ppm',
                'units.celsius': '°C',
                'units.fahrenheit': '°F',
                'units.percentage': '%',
                'units.micrograms': 'μg/m³',
                'units.index': 'índice',

                // Time
                'time.today': 'hoy',
                'time.yesterday': 'ayer',
                'time.this_week': 'esta semana',
                'time.last_week': 'la semana pasada',
                'time.this_month': 'este mes',
                'time.last_month': 'el mes pasado',
                'time.minutes_ago': 'hace {0} minutos',
                'time.hours_ago': 'hace {0} horas',
                'time.days_ago': 'hace {0} días'
            },

            en: {
                // Header and Navigation
                'header.live': 'LIVE',
                'nav.dashboard': 'Dashboard',
                'nav.cities': 'Cities',
                'nav.analytics': 'Analytics',
                'nav.rankings': 'Rankings',
                'nav.achievements': 'Achievements',

                // Loading Screen
                'loading.title': 'Connecting to satellites...',
                'loading.subtitle': 'Getting real-time environmental data',

                // Metrics
                'metrics.air_quality': 'Air Quality',
                'metrics.temperature': 'Global Temperature',
                'metrics.green_index': 'Green Index',
                'metrics.co2_levels': 'CO2 Levels',

                // Status
                'status.good': 'Good',
                'status.moderate': 'Moderate',
                'status.above_average': 'Above average',
                'status.critical': 'Critical',

                // Dashboard
                'dashboard.world_map': 'Interactive World Map',
                'dashboard.sustainability_score': 'Sustainability Score',
                'dashboard.realtime_data': 'Real-time Data',
                'dashboard.recent_achievements': 'Recent Achievements',
                'dashboard.top_cities': 'Featured Cities',

                // Map
                'map.air_quality': 'Air Quality',
                'map.temperature': 'Temperature',
                'map.vegetation': 'Vegetation',
                'map.pollution': 'Pollution',

                // Legend
                'legend.good': 'Good',
                'legend.moderate': 'Moderate',
                'legend.unhealthy': 'Unhealthy',
                'legend.critical': 'Critical',

                // Scores
                'scores.air_quality': 'Air Quality',
                'scores.green_spaces': 'Green Spaces',
                'scores.energy_efficiency': 'Energy Efficiency',
                'scores.carbon_footprint': 'Carbon Footprint',

                // Period
                'period.today': 'Today',
                'period.week': 'This week',
                'period.month': 'This month',

                // Chart
                'chart.co2_levels': 'CO2 Levels',
                'chart.air_quality': 'Air Quality',
                'chart.temperature': 'Temperature',
                'chart.humidity': 'Humidity',

                // Timeframe
                'timeframe.24h': 'Last 24h',
                'timeframe.7d': 'Last 7 days',
                'timeframe.30d': 'Last 30 days',

                // Stats
                'stats.current': 'Current',
                'stats.trend': 'Trend',
                'stats.average': 'Average',

                // Achievements
                'achievements.tree_hugger': 'Tree Hugger',
                'achievements.tree_hugger_desc': 'Monitored 50 cities with high green coverage',
                'achievements.data_explorer': 'Data Explorer',
                'achievements.data_explorer_desc': 'Accessed satellite data 100 times',
                'achievements.weekly_warrior': 'Weekly Warrior',
                'achievements.weekly_warrior_desc': '7 consecutive days monitoring',

                // Rarity
                'rarity.common': 'Common',
                'rarity.rare': 'Rare',
                'rarity.epic': 'Epic',
                'rarity.legendary': 'Legendary',

                // Filter
                'filter.best': 'Best',
                'filter.worst': 'Worst',
                'filter.improved': 'Most improved',

                // Common
                'common.view_all': 'View all',
                'common.loading': 'Loading...',
                'common.error': 'Error',
                'common.retry': 'Retry',
                'common.close': 'Close',
                'common.save': 'Save',
                'common.cancel': 'Cancel',
                'common.ok': 'OK',
                'common.yes': 'Yes',
                'common.no': 'No',

                // Offline
                'offline.message': 'Offline mode activated',
                'offline.sync': 'Syncing data...',
                'offline.synced': 'Data synced',

                // Update
                'update.available': 'New version available',
                'update.install': 'Update',
                'update.installing': 'Installing update...',
                'update.completed': 'Update completed',

                // Settings
                'settings.title': 'Settings',
                'settings.general': 'General',
                'settings.auto_update': 'Auto updates',
                'settings.notifications': 'Notifications',
                'settings.offline_mode': 'Offline mode',
                'settings.data': 'Data',
                'settings.update_frequency': 'Update frequency',
                'settings.cache_size': 'Cache size',
                'settings.clear_cache': 'Clear',
                'settings.about': 'About',
                'settings.description': 'Urban sustainability dashboard with satellite data',
                'settings.developer': 'Developed by Elizabeth Díaz Familia',
                'settings.github': 'GitHub',
                'settings.linkedin': 'LinkedIn',

                // Frequency
                'frequency.1min': '1 minute',
                'frequency.5min': '5 minutes',
                'frequency.15min': '15 minutes',
                'frequency.30min': '30 minutes',

                // Messages
                'messages.data_updated': 'Data updated successfully',
                'messages.cache_cleared': 'Cache cleared successfully',
                'messages.settings_saved': 'Settings saved',
                'messages.connection_error': 'Connection error',
                'messages.loading_data': 'Loading environmental data...',

                // Cities
                'cities.new_york': 'New York',
                'cities.london': 'London',
                'cities.tokyo': 'Tokyo',
                'cities.sao_paulo': 'São Paulo',
                'cities.delhi': 'Delhi',
                'cities.sydney': 'Sydney',
                'cities.cairo': 'Cairo',
                'cities.mexico_city': 'Mexico City',

                // Environmental terms
                'env.air_quality_index': 'Air Quality Index',
                'env.carbon_dioxide': 'Carbon Dioxide',
                'env.vegetation_index': 'Vegetation Index',
                'env.urban_heat_island': 'Urban Heat Island',
                'env.deforestation': 'Deforestation',
                'env.sustainability': 'Sustainability',
                'env.pollution': 'Pollution',
                'env.greenhouse_gases': 'Greenhouse Gases',

                // Units
                'units.ppm': 'ppm',
                'units.celsius': '°C',
                'units.fahrenheit': '°F',
                'units.percentage': '%',
                'units.micrograms': 'μg/m³',
                'units.index': 'index',

                // Time
                'time.today': 'today',
                'time.yesterday': 'yesterday',
                'time.this_week': 'this week',
                'time.last_week': 'last week',
                'time.this_month': 'this month',
                'time.last_month': 'last month',
                'time.minutes_ago': '{0} minutes ago',
                'time.hours_ago': '{0} hours ago',
                'time.days_ago': '{0} days ago'
            }
        };
    }

    /**
     * Initialize the translations system
     */
    init(language = null) {
        if (language && this.supportedLanguages.includes(language)) {
            this.currentLanguage = language;
        } else {
            this.currentLanguage = this.detectLanguage();
        }

        this.applyTranslations();
        this.setupLanguageObserver();
        this.isInitialized = true;
        
        console.log(`Translations initialized: ${this.currentLanguage}`);
    }

    /**
     * Detect user's preferred language
     */
    detectLanguage() {
        // Check localStorage first
        const saved = localStorage.getItem('ecosat-language');
        if (saved && this.supportedLanguages.includes(saved)) {
            return saved;
        }

        // Check browser language
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0];
        
        if (this.supportedLanguages.includes(langCode)) {
            return langCode;
        }

        return this.fallbackLanguage;
    }

    /**
     * Set the current language
     */
    setLanguage(language) {
        if (!this.supportedLanguages.includes(language)) {
            console.warn(`Language ${language} not supported`);
            return false;
        }

        this.currentLanguage = language;
        localStorage.setItem('ecosat-language', language);
        
        this.applyTranslations();
        this.notifyObservers();
        
        return true;
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get translation for a key
     */
    get(key, params = null) {
        const translation = this.translations[this.currentLanguage]?.[key] || 
                          this.translations[this.fallbackLanguage]?.[key] || 
                          key;

        // Replace parameters if provided
        if (params && Array.isArray(params)) {
            return this.replacePlaceholders(translation, params);
        }

        return translation;
    }

    /**
     * Replace placeholders in translation string
     */
    replacePlaceholders(text, params) {
        return text.replace(/{(\d+)}/g, (match, index) => {
            return params[index] !== undefined ? params[index] : match;
        });
    }

    /**
     * Apply translations to all elements with data-i18n attribute
     */
    applyTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.get(key);
            
            // Determine where to put the translation
            if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email')) {
                element.placeholder = translation;
            } else if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = translation;
            } else if (element.tagName === 'IMG') {
                element.alt = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update document language attribute
        document.documentElement.lang = this.currentLanguage;
    }

    /**
     * Setup mutation observer to handle dynamically added content
     */
    setupLanguageObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node itself has data-i18n
                        if (node.hasAttribute && node.hasAttribute('data-i18n')) {
                            const key = node.getAttribute('data-i18n');
                            node.textContent = this.get(key);
                        }
                        
                        // Check for child elements with data-i18n
                        const i18nElements = node.querySelectorAll ? node.querySelectorAll('[data-i18n]') : [];
                        i18nElements.forEach(element => {
                            const key = element.getAttribute('data-i18n');
                            element.textContent = this.get(key);
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.observers.push(observer);
    }

    /**
     * Add language change observer
     */
    addLanguageChangeObserver(callback) {
        this.observers.push({ type: 'callback', callback });
    }

    /**
     * Remove language change observer
     */
    removeLanguageChangeObserver(callback) {
        this.observers = this.observers.filter(obs => 
            obs.type !== 'callback' || obs.callback !== callback
        );
    }

    /**
     * Notify observers of language change
     */
    notifyObservers() {
        this.observers.forEach(observer => {
            if (observer.type === 'callback' && typeof observer.callback === 'function') {
                observer.callback(this.currentLanguage);
            }
        });
    }

    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return this.supportedLanguages.map(lang => ({
            code: lang,
            name: this.get(`language.${lang}`) || lang.toUpperCase(),
            nativeName: this.getLanguageNativeName(lang)
        }));
    }

    /**
     * Get native name for language
     */
    getLanguageNativeName(langCode) {
        const nativeNames = {
            es: 'Español',
            en: 'English'
        };
        return nativeNames[langCode] || langCode;
    }

    /**
     * Toggle between supported languages
     */
    toggleLanguage() {
        const currentIndex = this.supportedLanguages.indexOf(this.currentLanguage);
        const nextIndex = (currentIndex + 1) % this.supportedLanguages.length;
        const nextLanguage = this.supportedLanguages[nextIndex];
        
        this.setLanguage(nextLanguage);
        return nextLanguage;
    }

    /**
     * Check if a translation key exists
     */
    hasTranslation(key) {
        return !!(this.translations[this.currentLanguage]?.[key] || 
                  this.translations[this.fallbackLanguage]?.[key]);
    }

    /**
     * Get all translations for current language
     */
    getAllTranslations() {
        return { ...this.translations[this.currentLanguage] };
    }

    /**
     * Add or update translation
     */
    addTranslation(key, translations) {
        Object.keys(translations).forEach(lang => {
            if (this.supportedLanguages.includes(lang)) {
                if (!this.translations[lang]) {
                    this.translations[lang] = {};
                }
                this.translations[lang][key] = translations[lang];
            }
        });
    }

    /**
     * Format date according to current language
     */
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        return new Intl.DateTimeFormat(this.currentLanguage, formatOptions).format(date);
    }

    /**
     * Format time according to current language
     */
    formatTime(date, options = {}) {
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        return new Intl.DateTimeFormat(this.currentLanguage, formatOptions).format(date);
    }

    /**
     * Format number according to current language
     */
    formatNumber(number, options = {}) {
        return new Intl.NumberFormat(this.currentLanguage, options).format(number);
    }

    /**
     * Format relative time (e.g., "2 hours ago")
     */
    formatRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 60) {
            return this.get('time.minutes_ago', [diffMinutes]);
        } else if (diffHours < 24) {
            return this.get('time.hours_ago', [diffHours]);
        } else if (diffDays < 7) {
            return this.get('time.days_ago', [diffDays]);
        } else {
            return this.formatDate(date);
        }
    }

    /**
     * Get language direction (for RTL support in future)
     */
    getLanguageDirection() {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        return rtlLanguages.includes(this.currentLanguage) ? 'rtl' : 'ltr';
    }

    /**
     * Export translations for external use
     */
    exportTranslations(language = null) {
        const targetLang = language || this.currentLanguage;
        return {
            language: targetLang,
            translations: this.translations[targetLang] || {},
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Import translations from external source
     */
    importTranslations(data) {
        try {
            if (data.language && data.translations) {
                this.translations[data.language] = {
                    ...this.translations[data.language],
                    ...data.translations
                };
                
                if (this.currentLanguage === data.language) {
                    this.applyTranslations();
                }
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing translations:', error);
            return false;
        }
    }

    /**
     * Clean up observers and resources
     */
    destroy() {
        this.observers.forEach(observer => {
            if (observer.disconnect) {
                observer.disconnect();
            }
        });
        
        this.observers = [];
        this.isInitialized = false;
        console.log('Translations destroyed');
    }
}

// Global instance
window.Translations = new Translations();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.Translations.init();
    });
} else {
    window.Translations.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Translations;
}