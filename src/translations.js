/**
 * EcoSat Monitor - Enhanced Translations with Satellite Terms
 * Multilingual support for satellite data and environmental monitoring
 * Author: Elizabeth Díaz Familia
 * Version: 1.1.0 - Satellite Data Focus
 */

class Translations {
    constructor() {
        this.currentLanguage = 'es';
        this.translations = {
            es: {
                // Navigation
                'nav.dashboard': 'Dashboard',
                'nav.cities': 'Ciudades',
                'nav.analytics': 'Analytics',
                'nav.satellite': 'Satélites',
                'nav.achievements': 'Logros',
                'nav.rankings': 'Rankings',

                // Header
                'header.live': 'EN VIVO',

                // Loading
                'loading.title': 'Conectando con satélites...',
                'loading.subtitle': 'Obteniendo datos ambientales en tiempo real',

                // Metrics
                'metrics.air_quality': 'Calidad del Aire',
                'metrics.temperature': 'Temperatura Global',
                'metrics.vegetation': 'Índice Vegetación',
                'metrics.green_index': 'Índice Verde',
                'metrics.co2_levels': 'Niveles CO2',
                'metrics.deforestation': 'Deforestación',

                // Satellite specific metrics
                'metrics.ndvi': 'NDVI Global',
                'metrics.surface_temperature': 'Temperatura Superficial',
                'metrics.fire_hotspots': 'Focos de Calor',
                'metrics.cloud_coverage': 'Cobertura Nubosa',

                // Status
                'status.good': 'Bueno',
                'status.moderate': 'Moderado',
                'status.warning': 'Advertencia',
                'status.critical': 'Crítico',
                'status.above_average': 'Sobre promedio',
                'status.excellent': 'Excelente',

                // Dashboard sections
                'dashboard.world_map': 'Mapa Global Interactivo',
                'dashboard.satellite_map': 'Mapa Satelital Interactivo',
                'dashboard.sustainability_score': 'Puntuación de Sostenibilidad',
                'dashboard.realtime_data': 'Datos en Tiempo Real',
                'dashboard.realtime_satellite': 'Datos Satelitales en Tiempo Real',
                'dashboard.satellite_analysis': 'Análisis Satelital',
                'dashboard.recent_achievements': 'Logros Recientes',
                'dashboard.top_cities': 'Ciudades Destacadas',
                'dashboard.environmental_zones': 'Zonas Ambientales',

                // Satellite terms
                'satellite.vegetation': 'Vegetación (NDVI)',
                'satellite.temperature': 'Temperatura LST',
                'satellite.air_quality': 'Calidad del Aire',
                'satellite.deforestation': 'Deforestación',
                'satellite.urban_growth': 'Crecimiento Urbano',

                // Map controls
                'map.air_quality': 'Calidad del Aire',
                'map.temperature': 'Temperatura',
                'map.vegetation': 'Vegetación',
                'map.pollution': 'Contaminación',

                // Time periods
                'period.today': 'Hoy',
                'period.week': 'Esta semana',
                'period.month': 'Este mes',
                'period.realtime': 'Tiempo Real',
                'period.daily': 'Diario',
                'period.weekly': 'Semanal',
                'period.monthly': 'Mensual',

                // Chart metrics
                'chart.co2_levels': 'Niveles CO2',
                'chart.air_quality': 'Calidad del Aire',
                'chart.temperature': 'Temperatura',
                'chart.humidity': 'Humedad',
                'chart.ndvi': 'NDVI',
                'chart.deforestation': 'Deforestación',

                // Timeframes
                'timeframe.24h': 'Últimas 24h',
                'timeframe.7d': 'Últimos 7 días',
                'timeframe.30d': 'Últimos 30 días',

                // Stats
                'stats.current': 'Actual',
                'stats.trend': 'Tendencia',
                'stats.average': 'Promedio',

                // Legends
                'legend.good': 'Bueno',
                'legend.moderate': 'Moderado',
                'legend.unhealthy': 'No saludable',
                'legend.critical': 'Crítico',
                'legend.high': 'Alto',
                'legend.medium': 'Medio',
                'legend.low': 'Bajo',
                'legend.none': 'Sin datos',

                // Achievements
                'achievements.satellite_master': 'Maestro Satelital',
                'achievements.satellite_master_desc': 'Analizó datos de 5 satélites diferentes',
                'achievements.vegetation_tracker': 'Rastreador de Vegetación',
                'achievements.vegetation_tracker_desc': 'Monitoreó cambios NDVI por 30 días',
                'achievements.data_observer': 'Observador de Datos',
                'achievements.data_observer_desc': 'Revisó 100 imágenes satelitales',
                'achievements.tree_hugger': 'Abrazador de Árboles',
                'achievements.tree_hugger_desc': 'Monitoreó 50 ciudades con alta cobertura verde',
                'achievements.data_explorer': 'Explorador de Datos',
                'achievements.data_explorer_desc': 'Accedió a datos satelitales 100 veces',
                'achievements.weekly_warrior': 'Guerrero Semanal',
                'achievements.weekly_warrior_desc': '7 días consecutivos monitoreando',

                // Achievement rarities
                'rarity.legendary': 'Legendario',
                'rarity.epic': 'Épico',
                'rarity.rare': 'Raro',

                // Filters
                'filter.best': 'Mejores',
                'filter.worst': 'Peores',
                'filter.improved': 'Más mejoradas',
                'filter.healthiest': 'Más Saludables',
                'filter.critical': 'Críticas',
                'filter.improving': 'En Mejora',
                'filter.degrading': 'En Degradación',

                // Scores
                'scores.air_quality': 'Calidad del Aire',
                'scores.green_spaces': 'Espacios Verdes',
                'scores.energy_efficiency': 'Eficiencia Energética',
                'scores.carbon_footprint': 'Huella de Carbono',

                // Settings
                'settings.title': 'Configuración',
                'settings.satellite': 'Configuración Satelital',
                'settings.preferred_satellite': 'Satélite preferido',
                'settings.data_resolution': 'Resolución de datos',
                'settings.general': 'General',
                'settings.auto_update': 'Actualizaciones automáticas',
                'settings.notifications': 'Notificaciones',
                'settings.offline_mode': 'Modo offline',
                'settings.data': 'Datos',
                'settings.update_frequency': 'Frecuencia de actualización',
                'settings.cache_size': 'Tamaño de caché',
                'settings.clear_cache': 'Limpiar',
                'settings.about': 'Acerca de',
                'settings.description': 'Dashboard de sostenibilidad con datos satelitales en tiempo real',
                'settings.developer': 'Desarrollado por Elizabeth Díaz Familia',
                'settings.github': 'GitHub',
                'settings.linkedin': 'LinkedIn',

                // Frequencies
                'frequency.1min': '1 minuto',
                'frequency.5min': '5 minutos',
                'frequency.15min': '15 minutos',
                'frequency.30min': '30 minutos',

                // Notifications
                'offline.message': 'Modo offline activado',
                'update.available': 'Nueva versión disponible',
                'update.install': 'Actualizar',

                // Common
                'common.view_all': 'Ver todos',
                'common.loading': 'Cargando...',
                'common.error': 'Error',
                'common.success': 'Éxito',
                'common.refresh': 'Actualizar',

                // Satellite passes
                'satellite_passes.title': 'Próximos Pases Satelitales',
                'satellite_passes.quality.excellent': 'Excelente',
                'satellite_passes.quality.good': 'Buena',
                'satellite_passes.quality.moderate': 'Moderada',
                'satellite_passes.quality.poor': 'Pobre',

                // Environmental zones
                'zones.amazonia': 'Reserva Amazónica Central',
                'zones.boreal': 'Bosque Boreal Canadiense',
                'zones.taiga': 'Taiga Siberiana',
                'zones.congo': 'Selva del Congo',

                // Satellite names
                'satellites.landsat8': 'Landsat-8',
                'satellites.sentinel2': 'Sentinel-2',
                'satellites.modis': 'MODIS Terra/Aqua',
                'satellites.sentinel5p': 'Sentinel-5P'
            },

            en: {
                // Navigation
                'nav.dashboard': 'Dashboard',
                'nav.cities': 'Cities',
                'nav.analytics': 'Analytics',
                'nav.satellite': 'Satellites',
                'nav.achievements': 'Achievements',
                'nav.rankings': 'Rankings',

                // Header
                'header.live': 'LIVE',

                // Loading
                'loading.title': 'Connecting to satellites...',
                'loading.subtitle': 'Getting environmental data in real time',

                // Metrics
                'metrics.air_quality': 'Air Quality',
                'metrics.temperature': 'Global Temperature',
                'metrics.vegetation': 'Vegetation Index',
                'metrics.green_index': 'Green Index',
                'metrics.co2_levels': 'CO2 Levels',
                'metrics.deforestation': 'Deforestation',

                // Satellite specific metrics
                'metrics.ndvi': 'Global NDVI',
                'metrics.surface_temperature': 'Surface Temperature',
                'metrics.fire_hotspots': 'Fire Hotspots',
                'metrics.cloud_coverage': 'Cloud Coverage',

                // Status
                'status.good': 'Good',
                'status.moderate': 'Moderate',
                'status.warning': 'Warning',
                'status.critical': 'Critical',
                'status.above_average': 'Above average',
                'status.excellent': 'Excellent',

                // Dashboard sections
                'dashboard.world_map': 'Interactive World Map',
                'dashboard.satellite_map': 'Interactive Satellite Map',
                'dashboard.sustainability_score': 'Sustainability Score',
                'dashboard.realtime_data': 'Real-time Data',
                'dashboard.realtime_satellite': 'Real-time Satellite Data',
                'dashboard.satellite_analysis': 'Satellite Analysis',
                'dashboard.recent_achievements': 'Recent Achievements',
                'dashboard.top_cities': 'Top Cities',
                'dashboard.environmental_zones': 'Environmental Zones',

                // Satellite terms
                'satellite.vegetation': 'Vegetation (NDVI)',
                'satellite.temperature': 'Temperature LST',
                'satellite.air_quality': 'Air Quality',
                'satellite.deforestation': 'Deforestation',
                'satellite.urban_growth': 'Urban Growth',

                // Map controls
                'map.air_quality': 'Air Quality',
                'map.temperature': 'Temperature',
                'map.vegetation': 'Vegetation',
                'map.pollution': 'Pollution',

                // Time periods
                'period.today': 'Today',
                'period.week': 'This week',
                'period.month': 'This month',
                'period.realtime': 'Real Time',
                'period.daily': 'Daily',
                'period.weekly': 'Weekly',
                'period.monthly': 'Monthly',

                // Chart metrics
                'chart.co2_levels': 'CO2 Levels',
                'chart.air_quality': 'Air Quality',
                'chart.temperature': 'Temperature',
                'chart.humidity': 'Humidity',
                'chart.ndvi': 'NDVI',
                'chart.deforestation': 'Deforestation',

                // Timeframes
                'timeframe.24h': 'Last 24h',
                'timeframe.7d': 'Last 7 days',
                'timeframe.30d': 'Last 30 days',

                // Stats
                'stats.current': 'Current',
                'stats.trend': 'Trend',
                'stats.average': 'Average',

                // Legends
                'legend.good': 'Good',
                'legend.moderate': 'Moderate',
                'legend.unhealthy': 'Unhealthy',
                'legend.critical': 'Critical',
                'legend.high': 'High',
                'legend.medium': 'Medium',
                'legend.low': 'Low',
                'legend.none': 'No data',

                // Achievements
                'achievements.satellite_master': 'Satellite Master',
                'achievements.satellite_master_desc': 'Analyzed data from 5 different satellites',
                'achievements.vegetation_tracker': 'Vegetation Tracker',
                'achievements.vegetation_tracker_desc': 'Monitored NDVI changes for 30 days',
                'achievements.data_observer': 'Data Observer',
                'achievements.data_observer_desc': 'Reviewed 100 satellite images',
                'achievements.tree_hugger': 'Tree Hugger',
                'achievements.tree_hugger_desc': 'Monitored 50 cities with high green coverage',
                'achievements.data_explorer': 'Data Explorer',
                'achievements.data_explorer_desc': 'Accessed satellite data 100 times',
                'achievements.weekly_warrior': 'Weekly Warrior',
                'achievements.weekly_warrior_desc': '7 consecutive days monitoring',

                // Achievement rarities
                'rarity.legendary': 'Legendary',
                'rarity.epic': 'Epic',
                'rarity.rare': 'Rare',

                // Filters
                'filter.best': 'Best',
                'filter.worst': 'Worst',
                'filter.improved': 'Most improved',
                'filter.healthiest': 'Healthiest',
                'filter.critical': 'Critical',
                'filter.improving': 'Improving',
                'filter.degrading': 'Degrading',

                // Scores
                'scores.air_quality': 'Air Quality',
                'scores.green_spaces': 'Green Spaces',
                'scores.energy_efficiency': 'Energy Efficiency',
                'scores.carbon_footprint': 'Carbon Footprint',

                // Settings
                'settings.title': 'Settings',
                'settings.satellite': 'Satellite Configuration',
                'settings.preferred_satellite': 'Preferred satellite',
                'settings.data_resolution': 'Data resolution',
                'settings.general': 'General',
                'settings.auto_update': 'Auto-updates',
                'settings.notifications': 'Notifications',
                'settings.offline_mode': 'Offline mode',
                'settings.data': 'Data',
                'settings.update_frequency': 'Update frequency',
                'settings.cache_size': 'Cache size',
                'settings.clear_cache': 'Clear',
                'settings.about': 'About',
                'settings.description': 'Sustainability dashboard with real-time satellite data',
                'settings.developer': 'Developed by Elizabeth Díaz Familia',
                'settings.github': 'GitHub',
                'settings.linkedin': 'LinkedIn',

                // Frequencies
                'frequency.1min': '1 minute',
                'frequency.5min': '5 minutes',
                'frequency.15min': '15 minutes',
                'frequency.30min': '30 minutes',

                // Notifications
                'offline.message': 'Offline mode activated',
                'update.available': 'New version available',
                'update.install': 'Update',

                // Common
                'common.view_all': 'View all',
                'common.loading': 'Loading...',
                'common.error': 'Error',
                'common.success': 'Success',
                'common.refresh': 'Refresh',

                // Satellite passes
                'satellite_passes.title': 'Upcoming Satellite Passes',
                'satellite_passes.quality.excellent': 'Excellent',
                'satellite_passes.quality.good': 'Good',
                'satellite_passes.quality.moderate': 'Moderate',
                'satellite_passes.quality.poor': 'Poor',

                // Environmental zones
                'zones.amazonia': 'Central Amazon Reserve',
                'zones.boreal': 'Canadian Boreal Forest',
                'zones.taiga': 'Siberian Taiga',
                'zones.congo': 'Congo Rainforest',

                // Satellite names
                'satellites.landsat8': 'Landsat-8',
                'satellites.sentinel2': 'Sentinel-2',
                'satellites.modis': 'MODIS Terra/Aqua',
                'satellites.sentinel5p': 'Sentinel-5P'
            }
        };

        this.init();
    }

    /**
     * Initialize translations system
     */
    init() {
        // Set initial language from localStorage or browser
        const savedLanguage = localStorage.getItem('ecosat-language');
        const browserLanguage = navigator.language.slice(0, 2);
        
        this.currentLanguage = savedLanguage || (this.translations[browserLanguage] ? browserLanguage : 'es');
        this.applyTranslations();
        
        console.log(`Translations initialized: ${this.currentLanguage}`);
    }

    /**
     * Set language and apply translations
     */
    setLanguage(language) {
        if (!this.translations[language]) {
            console.warn(`Language ${language} not supported, falling back to Spanish`);
            language = 'es';
        }

        this.currentLanguage = language;
        localStorage.setItem('ecosat-language', language);
        this.applyTranslations();
        
        console.log(`Language changed to: ${language}`);
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
    get(key, defaultValue = null) {
        const translation = this.translations[this.currentLanguage]?.[key];
        
        if (translation) {
            return translation;
        }
        
        // Fallback to Spanish if English translation not found
        if (this.currentLanguage !== 'es') {
            const fallback = this.translations.es[key];
            if (fallback) {
                return fallback;
            }
        }
        
        // Return default value or the key itself
        return defaultValue || key;
    }

    /**
     * Apply translations to all elements with data-i18n attribute
     */
    applyTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.get(key);
            
            if (translation !== key) {
                // Handle different element types
                if (element.tagName === 'INPUT' && (element.type === 'submit' || element.type === 'button')) {
                    element.value = translation;
                } else if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
                    element.placeholder = translation;
                } else if (element.getAttribute('title')) {
                    element.title = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // Update document title if available
        this.updateDocumentTitle();
        
        // Trigger custom event for other components that need to update
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { 
                language: this.currentLanguage,
                translations: this.translations[this.currentLanguage]
            }
        }));
    }

    /**
     * Update document title based on current language
     */
    updateDocumentTitle() {
        const titles = {
            es: 'EcoSat Monitor - Dashboard de Sostenibilidad Urbana',
            en: 'EcoSat Monitor - Urban Sustainability Dashboard'
        };
        
        document.title = titles[this.currentLanguage] || titles.es;
    }

    /**
     * Add translation dynamically
     */
    addTranslation(language, key, value) {
        if (!this.translations[language]) {
            this.translations[language] = {};
        }
        
        this.translations[language][key] = value;
        
        // Re-apply translations if it's the current language
        if (language === this.currentLanguage) {
            this.applyTranslations();
        }
    }

    /**
     * Add multiple translations at once
     */
    addTranslations(language, translations) {
        if (!this.translations[language]) {
            this.translations[language] = {};
        }
        
        Object.assign(this.translations[language], translations);
        
        // Re-apply translations if it's the current language
        if (language === this.currentLanguage) {
            this.applyTranslations();
        }
    }

    /**
     * Get available languages
     */
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }

    /**
     * Get current language display name
     */
    getCurrentLanguageDisplayName() {
        const displayNames = {
            es: 'Español',
            en: 'English'
        };
        
        return displayNames[this.currentLanguage] || this.currentLanguage.toUpperCase();
    }

    /**
     * Format number based on current language
     */
    formatNumber(number, options = {}) {
        const locale = this.currentLanguage === 'es' ? 'es-ES' : 'en-US';
        
        try {
            return new Intl.NumberFormat(locale, options).format(number);
        } catch (error) {
            console.warn('Error formatting number:', error);
            return number.toString();
        }
    }

    /**
     * Format date based on current language
     */
    formatDate(date, options = {}) {
        const locale = this.currentLanguage === 'es' ? 'es-ES' : 'en-US';
        
        try {
            return new Intl.DateTimeFormat(locale, options).format(new Date(date));
        } catch (error) {
            console.warn('Error formatting date:', error);
            return date.toString();
        }
    }

    /**
     * Format relative time (e.g., "2 hours ago")
     */
    formatRelativeTime(date) {
        const now = new Date();
        const targetDate = new Date(date);
        const diffInSeconds = Math.floor((now - targetDate) / 1000);

        if (this.currentLanguage === 'es') {
            if (diffInSeconds < 60) return 'hace un momento';
            if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
            if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)}h`;
            return `hace ${Math.floor(diffInSeconds / 86400)} días`;
        } else {
            if (diffInSeconds < 60) return 'just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
            return `${Math.floor(diffInSeconds / 86400)} days ago`;
        }
    }

    /**
     * Get satellite name translation
     */
    getSatelliteName(satelliteId) {
        const key = `satellites.${satelliteId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        return this.get(key, satelliteId);
    }

    /**
     * Get status translation with color class
     */
    getStatusTranslation(status) {
        const statusKey = `status.${status.toLowerCase()}`;
        return {
            text: this.get(statusKey, status),
            class: status.toLowerCase()
        };
    }

    /**
     * Get metric unit based on language
     */
    getMetricUnit(metric) {
        const units = {
            temperature: this.currentLanguage === 'es' ? '°C' : '°C',
            ndvi: '',
            deforestation: '%',
            fires: this.currentLanguage === 'es' ? 'focos' : 'hotspots',
            co2: 'ppm',
            aqi: this.currentLanguage === 'es' ? 'ICA' : 'AQI'
        };
        
        return units[metric] || '';
    }

    /**
     * Translate array of items (for dropdowns, lists, etc.)
     */
    translateArray(items, keyPrefix = '') {
        return items.map(item => ({
            ...item,
            label: this.get(`${keyPrefix}${item.key}`, item.label || item.key)
        }));
    }

    /**
     * Get pluralized translation
     */
    getPlural(key, count, defaultSingular = null, defaultPlural = null) {
        const singularKey = `${key}.singular`;
        const pluralKey = `${key}.plural`;
        
        const singular = this.get(singularKey, defaultSingular);
        const plural = this.get(pluralKey, defaultPlural);
        
        if (this.currentLanguage === 'es') {
            return count === 1 ? singular : plural;
        } else {
            return count === 1 ? singular : plural;
        }
    }

    /**
     * Translate with interpolation (replace {{variables}})
     */
    interpolate(key, variables = {}, defaultValue = null) {
        let translation = this.get(key, defaultValue);
        
        if (translation && typeof translation === 'string') {
            Object.keys(variables).forEach(variable => {
                const regex = new RegExp(`{{${variable}}}`, 'g');
                translation = translation.replace(regex, variables[variable]);
            });
        }
        
        return translation;
    }

    /**
     * Update element text with translation and interpolation
     */
    updateElement(elementId, key, variables = {}) {
        const element = document.getElementById(elementId);
        if (element) {
            const translation = this.interpolate(key, variables);
            element.textContent = translation;
        }
    }

    /**
     * Listen for language changes from other components
     */
    onLanguageChange(callback) {
        document.addEventListener('languageChanged', (event) => {
            callback(event.detail);
        });
    }

    /**
     * Export current translations (for debugging)
     */
    exportTranslations(language = null) {
        const targetLanguage = language || this.currentLanguage;
        return JSON.stringify(this.translations[targetLanguage], null, 2);
    }

    /**
     * Import translations from external source
     */
    importTranslations(language, translationsData) {
        try {
            const parsed = typeof translationsData === 'string' 
                ? JSON.parse(translationsData) 
                : translationsData;
            
            this.translations[language] = { ...this.translations[language], ...parsed };
            
            if (language === this.currentLanguage) {
                this.applyTranslations();
            }
            
            console.log(`Translations imported for ${language}`);
            return true;
        } catch (error) {
            console.error('Error importing translations:', error);
            return false;
        }
    }

    /**
     * Get completion percentage for a language
     */
    getLanguageCompletion(language) {
        const baseLanguage = 'es'; // Spanish is our base
        const baseKeys = Object.keys(this.translations[baseLanguage] || {});
        const targetKeys = Object.keys(this.translations[language] || {});
        
        const completion = (targetKeys.length / baseKeys.length) * 100;
        return Math.round(completion);
    }

    /**
     * Find missing translations for a language
     */
    findMissingTranslations(language) {
        const baseLanguage = 'es';
        const baseKeys = Object.keys(this.translations[baseLanguage] || {});
        const targetTranslations = this.translations[language] || {};
        
        return baseKeys.filter(key => !targetTranslations[key]);
    }

    /**
     * Validate all translations
     */
    validateTranslations() {
        const results = {};
        
        Object.keys(this.translations).forEach(language => {
            results[language] = {
                completion: this.getLanguageCompletion(language),
                missingKeys: this.findMissingTranslations(language)
            };
        });
        
        return results;
    }
}

// Create global instance
const translations = new Translations();

// Export for different environments
if (typeof window !== 'undefined') {
    window.Translations = translations;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Translations;
}

// Auto-initialize when DOM is loaded
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            translations.applyTranslations();
        });
    } else {
        translations.applyTranslations();
    }
}