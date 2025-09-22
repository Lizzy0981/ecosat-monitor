/**
 * EcoSat Monitor - Main Application Logic
 * Advanced Urban Sustainability Dashboard with Real-time Satellite Data
 * Author: Elizabeth Díaz Familia
 * Version: 1.0.0
 */

class EcoSatApp {
    constructor() {
        this.isOnline = navigator.onLine;
        this.currentLanguage = localStorage.getItem('ecosat-language') || 'es';
        this.currentTheme = localStorage.getItem('ecosat-theme') || 'light';
        this.updateInterval = null;
        this.notificationPermission = 'default';
        
        // Core modules
        this.dataManager = null;
        this.satelliteService = null;
        this.chartsController = null;
        this.gamificationSystem = null;
        this.offlineStorage = null;
        
        // App state
        this.appState = {
            currentSection: 'dashboard',
            selectedCity: null,
            mapLayer: 'air-quality',
            chartMetric: 'co2',
            chartTimeframe: '24h',
            userStats: {
                points: 2450,
                streak: 7,
                level: 8,
                achievements: []
            },
            globalMetrics: {
                aqi: 67,
                temperature: 1.2,
                greenIndex: 73,
                co2Levels: 418
            }
        };

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            this.showLoadingScreen();
            await this.loadDependencies();
            await this.initializeModules();
            this.setupEventListeners();
            this.applyTheme();
            this.setLanguage(this.currentLanguage);
            await this.loadInitialData();
            this.startAutoUpdate();
            this.hideLoadingScreen();
            this.checkNotificationPermission();
            console.log('EcoSat Monitor initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.handleError('init_error', error);
        }
    }

    /**
     * Show loading screen with progress
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const progressBar = document.getElementById('progress-bar');
        let progress = 0;

        const updateProgress = () => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            progressBar.style.width = `${progress}%`;
            
            if (progress < 100) {
                setTimeout(updateProgress, 200);
            }
        };

        loadingScreen.classList.remove('hidden');
        updateProgress();
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 500);
        }, 1000);
    }

    /**
     * Load and initialize core modules
     */
    async loadDependencies() {
        // Initialize storage first
        this.offlineStorage = new OfflineStorage();
        await this.offlineStorage.init();

        // Initialize data layer
        this.dataManager = new DataManager(this.offlineStorage);
        this.satelliteService = new SatelliteService(this.dataManager);
        
        // Initialize UI modules
        this.chartsController = new ChartsController();
        this.gamificationSystem = new GamificationSystem();
    }

    /**
     * Initialize all modules
     */
    async initializeModules() {
        await this.dataManager.init();
        await this.satelliteService.init();
        this.chartsController.init();
        this.gamificationSystem.init(this.appState.userStats);
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Navigation
        this.setupNavigationEvents();
        
        // Theme and language controls
        this.setupControlEvents();
        
        // Dashboard interactions
        this.setupDashboardEvents();
        
        // Modal events
        this.setupModalEvents();
        
        // Network status
        this.setupNetworkEvents();
        
        // Window events
        this.setupWindowEvents();
    }

    /**
     * Setup navigation events
     */
    setupNavigationEvents() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('.nav-btn').dataset.section;
                this.navigateToSection(section);
            });
        });
    }

    /**
     * Setup control events (theme, language, settings)
     */
    setupControlEvents() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());

        // Language toggle
        const languageToggle = document.getElementById('language-toggle');
        languageToggle.addEventListener('click', () => this.toggleLanguage());

        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        settingsBtn.addEventListener('click', () => this.openSettings());
    }

    /**
     * Setup dashboard interaction events
     */
    setupDashboardEvents() {
        // Map layer selector
        const mapLayerSelect = document.getElementById('map-layer-select');
        if (mapLayerSelect) {
            mapLayerSelect.addEventListener('change', (e) => {
                this.changeMapLayer(e.target.value);
            });
        }

        // Chart controls
        const chartMetric = document.getElementById('chart-metric');
        const chartTimeframe = document.getElementById('chart-timeframe');
        
        if (chartMetric) {
            chartMetric.addEventListener('change', (e) => {
                this.updateChart(e.target.value, this.appState.chartTimeframe);
            });
        }

        if (chartTimeframe) {
            chartTimeframe.addEventListener('change', (e) => {
                this.updateChart(this.appState.chartMetric, e.target.value);
            });
        }

        // City filter
        const cityFilter = document.getElementById('city-filter');
        if (cityFilter) {
            cityFilter.addEventListener('change', (e) => {
                this.filterCities(e.target.value);
            });
        }

        // Score period selector
        const scorePeriod = document.getElementById('score-period');
        if (scorePeriod) {
            scorePeriod.addEventListener('change', (e) => {
                this.updateScorePeriod(e.target.value);
            });
        }
    }

    /**
     * Setup modal events
     */
    setupModalEvents() {
        // Settings modal
        const settingsModal = document.getElementById('settings-modal');
        const settingsClose = document.getElementById('settings-close');
        
        if (settingsClose) {
            settingsClose.addEventListener('click', () => {
                settingsModal.classList.add('hidden');
            });
        }

        // Settings controls
        this.setupSettingsControls();

        // Update notification
        const updateBtn = document.getElementById('update-btn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => this.applyUpdate());
        }
    }

    /**
     * Setup settings controls
     */
    setupSettingsControls() {
        const autoUpdateToggle = document.getElementById('auto-update-toggle');
        const notificationsToggle = document.getElementById('notifications-toggle');
        const offlineModeToggle = document.getElementById('offline-mode-toggle');
        const updateFrequency = document.getElementById('update-frequency');
        const clearCache = document.getElementById('clear-cache');

        if (autoUpdateToggle) {
            autoUpdateToggle.addEventListener('change', (e) => {
                this.toggleAutoUpdate(e.target.checked);
            });
        }

        if (notificationsToggle) {
            notificationsToggle.addEventListener('change', (e) => {
                this.toggleNotifications(e.target.checked);
            });
        }

        if (offlineModeToggle) {
            offlineModeToggle.addEventListener('change', (e) => {
                this.toggleOfflineMode(e.target.checked);
            });
        }

        if (updateFrequency) {
            updateFrequency.addEventListener('change', (e) => {
                this.setUpdateFrequency(parseInt(e.target.value));
            });
        }

        if (clearCache) {
            clearCache.addEventListener('click', () => this.clearCache());
        }
    }

    /**
     * Setup network events
     */
    setupNetworkEvents() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.hideOfflineIndicator();
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineIndicator();
        });
    }

    /**
     * Setup window events
     */
    setupWindowEvents() {
        window.addEventListener('beforeunload', () => {
            this.saveAppState();
        });

        window.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseUpdates();
            } else {
                this.resumeUpdates();
            }
        });
    }

    /**
     * Navigate to different sections
     */
    navigateToSection(section) {
        // Update nav buttons
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => btn.classList.remove('active'));
        
        const activeBtn = document.querySelector(`[data-section="${section}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Update sections (for future implementation)
        this.appState.currentSection = section;
        
        // Add section-specific logic here
        switch (section) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'cities':
                this.loadCitiesData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
            case 'rankings':
                this.loadRankingsData();
                break;
            case 'achievements':
                this.loadAchievementsData();
                break;
        }
    }

    /**
     * Toggle theme (light/dark)
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('ecosat-theme', this.currentTheme);
    }

    /**
     * Apply current theme
     */
    applyTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
        
        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            themeIcon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    /**
     * Toggle language (ES/EN)
     */
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'es' ? 'en' : 'es';
        this.setLanguage(this.currentLanguage);
        localStorage.setItem('ecosat-language', this.currentLanguage);
    }

    /**
     * Set application language
     */
    setLanguage(language) {
        this.currentLanguage = language;
        
        // Update language toggle button
        const languageToggle = document.getElementById('language-toggle');
        if (languageToggle) {
            languageToggle.querySelector('.lang-text').textContent = language.toUpperCase();
        }

        // Apply translations
        if (window.Translations) {
            window.Translations.setLanguage(language);
        }
    }

    /**
     * Load initial data for the dashboard
     */
    async loadInitialData() {
        try {
            // Load global metrics
            await this.updateGlobalMetrics();
            
            // Initialize map
            await this.initializeMap();
            
            // Load charts
            await this.initializeCharts();
            
            // Load achievements
            await this.loadRecentAchievements();
            
            // Load top cities
            await this.loadTopCities();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.handleError('data_load_error', error);
        }
    }

    /**
     * Update global metrics
     */
    async updateGlobalMetrics() {
        try {
            const metrics = await this.dataManager.getGlobalMetrics();
            
            // Update UI elements
            this.updateElement('global-aqi', metrics.aqi);
            this.updateElement('global-temp', `+${metrics.temperature}°C`);
            this.updateElement('green-index', metrics.greenIndex);
            this.updateElement('co2-levels', `${metrics.co2Levels} ppm`);
            
            // Update status indicators
            this.updateMetricStatus('global-aqi', metrics.aqi);
            
            this.appState.globalMetrics = metrics;
            
        } catch (error) {
            console.error('Error updating global metrics:', error);
        }
    }

    /**
     * Initialize world map
     */
    async initializeMap() {
        const mapContainer = document.getElementById('world-map');
        if (!mapContainer) return;

        try {
            // Initialize Leaflet map
            this.map = L.map('world-map').setView([20, 0], 2);
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);

            // Load city markers
            await this.loadMapMarkers();
            
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    }

    /**
     * Load map markers for cities
     */
    async loadMapMarkers() {
        try {
            const cities = await this.dataManager.getCitiesData();
            
            cities.forEach(city => {
                const color = this.getAQIColor(city.aqi);
                const marker = L.circleMarker([city.lat, city.lon], {
                    radius: 8,
                    fillColor: color,
                    color: '#fff',
                    weight: 2,
                    fillOpacity: 0.8
                }).addTo(this.map);

                // Add popup
                marker.bindPopup(`
                    <div class="map-popup">
                        <h4>${city.name}</h4>
                        <p><strong>AQI:</strong> ${city.aqi}</p>
                        <p><strong>Temp:</strong> ${city.temperature}°C</p>
                        <p><strong>Estado:</strong> ${this.getAQIStatus(city.aqi)}</p>
                    </div>
                `);
            });
            
        } catch (error) {
            console.error('Error loading map markers:', error);
        }
    }

    /**
     * Initialize charts
     */
    async initializeCharts() {
        try {
            // Initialize real-time chart
            await this.chartsController.initRealtimeChart('realtime-chart');
            
            // Initialize sustainability score chart
            this.initializeSustainabilityScore();
            
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }

    /**
     * Initialize sustainability score visualization
     */
    initializeSustainabilityScore() {
        const scoreCircle = document.getElementById('score-circle');
        const scoreNumber = document.getElementById('overall-score');
        
        if (scoreCircle && scoreNumber) {
            const score = this.appState.globalMetrics.sustainabilityScore || 67;
            const circumference = 2 * Math.PI * 45; // radius = 45
            const offset = circumference - (score / 100) * circumference;
            
            scoreCircle.style.strokeDasharray = circumference;
            scoreCircle.style.strokeDashoffset = offset;
            scoreNumber.textContent = score;
        }
    }

    /**
     * Load recent achievements
     */
    async loadRecentAchievements() {
        try {
            const achievements = await this.gamificationSystem.getRecentAchievements();
            const container = document.getElementById('recent-achievements');
            
            if (container && achievements.length > 0) {
                // Achievements are already in HTML, could be updated dynamically
                console.log('Recent achievements loaded:', achievements.length);
            }
            
        } catch (error) {
            console.error('Error loading achievements:', error);
        }
    }

    /**
     * Load top cities
     */
    async loadTopCities() {
        try {
            const cities = await this.dataManager.getTopCities('best');
            // Cities are already in HTML, could be updated dynamically
            console.log('Top cities loaded:', cities.length);
            
        } catch (error) {
            console.error('Error loading top cities:', error);
        }
    }

    /**
     * Change map layer
     */
    async changeMapLayer(layer) {
        this.appState.mapLayer = layer;
        
        try {
            // Clear existing markers
            this.map.eachLayer(layer => {
                if (layer instanceof L.CircleMarker) {
                    this.map.removeLayer(layer);
                }
            });
            
            // Reload markers with new data
            await this.loadMapMarkers();
            
        } catch (error) {
            console.error('Error changing map layer:', error);
        }
    }

    /**
     * Update chart with new metric and timeframe
     */
    async updateChart(metric, timeframe) {
        this.appState.chartMetric = metric;
        this.appState.chartTimeframe = timeframe;
        
        try {
            await this.chartsController.updateChart(metric, timeframe);
            
        } catch (error) {
            console.error('Error updating chart:', error);
        }
    }

    /**
     * Filter cities display
     */
    async filterCities(filter) {
        try {
            const cities = await this.dataManager.getTopCities(filter);
            // Update cities list in UI
            console.log(`Cities filtered by: ${filter}`, cities.length);
            
        } catch (error) {
            console.error('Error filtering cities:', error);
        }
    }

    /**
     * Update score period
     */
    async updateScorePeriod(period) {
        try {
            const scoreData = await this.dataManager.getSustainabilityScore(period);
            this.updateSustainabilityScore(scoreData);
            
        } catch (error) {
            console.error('Error updating score period:', error);
        }
    }

    /**
     * Start auto-update interval
     */
    startAutoUpdate() {
        const frequency = parseInt(localStorage.getItem('ecosat-update-frequency')) || 5;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(() => {
            if (this.isOnline && !document.hidden) {
                this.updateData();
            }
        }, frequency * 60 * 1000); // Convert minutes to milliseconds
    }

    /**
     * Update data from APIs
     */
    async updateData() {
        try {
            await this.updateGlobalMetrics();
            await this.chartsController.updateRealtimeData();
            
            // Check for achievements
            this.gamificationSystem.checkAchievements();
            
        } catch (error) {
            console.error('Error updating data:', error);
        }
    }

    /**
     * Show offline indicator
     */
    showOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.classList.remove('hidden');
        }
    }

    /**
     * Hide offline indicator
     */
    hideOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }

    /**
     * Sync offline data when back online
     */
    async syncOfflineData() {
        try {
            await this.offlineStorage.syncPendingData();
            await this.updateData();
            this.showNotification('Datos sincronizados correctamente', 'success');
            
        } catch (error) {
            console.error('Error syncing offline data:', error);
        }
    }

    /**
     * Open settings modal
     */
    openSettings() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    /**
     * Toggle auto-update setting
     */
    toggleAutoUpdate(enabled) {
        if (enabled) {
            this.startAutoUpdate();
        } else {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
        }
        localStorage.setItem('ecosat-auto-update', enabled);
    }

    /**
     * Toggle notifications
     */
    async toggleNotifications(enabled) {
        if (enabled && this.notificationPermission !== 'granted') {
            this.notificationPermission = await Notification.requestPermission();
        }
        localStorage.setItem('ecosat-notifications', enabled);
    }

    /**
     * Check notification permission
     */
    async checkNotificationPermission() {
        if ('Notification' in window) {
            this.notificationPermission = Notification.permission;
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        if (this.notificationPermission === 'granted') {
            new Notification('EcoSat Monitor', {
                body: message,
                icon: 'assets/icons/icon-192x192.png'
            });
        }
        
        // Also show in-app notification
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    /**
     * Set update frequency
     */
    setUpdateFrequency(minutes) {
        localStorage.setItem('ecosat-update-frequency', minutes);
        this.startAutoUpdate();
    }

    /**
     * Clear cache
     */
    async clearCache() {
        try {
            await this.offlineStorage.clearCache();
            this.showNotification('Caché limpiado correctamente', 'success');
            
            // Update cache size display
            this.updateCacheSize();
            
        } catch (error) {
            console.error('Error clearing cache:', error);
            this.showNotification('Error al limpiar caché', 'error');
        }
    }

    /**
     * Update cache size display
     */
    async updateCacheSize() {
        try {
            const size = await this.offlineStorage.getCacheSize();
            const element = document.getElementById('cache-size');
            if (element) {
                element.textContent = `${(size / 1024 / 1024).toFixed(1)} MB / 50 MB`;
            }
        } catch (error) {
            console.error('Error updating cache size:', error);
        }
    }

    /**
     * Apply application update
     */
    async applyUpdate() {
        try {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
                window.location.reload();
            }
        } catch (error) {
            console.error('Error applying update:', error);
        }
    }

    /**
     * Pause updates when tab is not visible
     */
    pauseUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    /**
     * Resume updates when tab becomes visible
     */
    resumeUpdates() {
        this.startAutoUpdate();
    }

    /**
     * Save current app state
     */
    saveAppState() {
        localStorage.setItem('ecosat-app-state', JSON.stringify(this.appState));
    }

    /**
     * Load saved app state
     */
    loadAppState() {
        const saved = localStorage.getItem('ecosat-app-state');
        if (saved) {
            try {
                this.appState = { ...this.appState, ...JSON.parse(saved) };
            } catch (error) {
                console.error('Error loading app state:', error);
            }
        }
    }

    /**
     * Utility: Update element content safely
     */
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    /**
     * Utility: Get AQI color code
     */
    getAQIColor(aqi) {
        if (aqi <= 50) return '#4ade80'; // Good - Green
        if (aqi <= 100) return '#fbbf24'; // Moderate - Yellow
        if (aqi <= 150) return '#fb923c'; // Unhealthy for sensitive - Orange
        if (aqi <= 200) return '#ef4444'; // Unhealthy - Red
        if (aqi <= 300) return '#a855f7'; // Very unhealthy - Purple
        return '#7c2d12'; // Hazardous - Maroon
    }

    /**
     * Utility: Get AQI status text
     */
    getAQIStatus(aqi) {
        if (aqi <= 50) return 'Bueno';
        if (aqi <= 100) return 'Moderado';
        if (aqi <= 150) return 'No saludable para sensibles';
        if (aqi <= 200) return 'No saludable';
        if (aqi <= 300) return 'Muy no saludable';
        return 'Peligroso';
    }

    /**
     * Update metric status indicator
     */
    updateMetricStatus(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            const statusElement = element.closest('.metric-card').querySelector('.metric-status');
            if (statusElement) {
                statusElement.className = 'metric-status';
                if (value <= 50) {
                    statusElement.classList.add('good');
                } else if (value <= 100) {
                    statusElement.classList.add('moderate');
                } else if (value <= 150) {
                    statusElement.classList.add('warning');
                } else {
                    statusElement.classList.add('critical');
                }
            }
        }
    }

    /**
     * Handle application errors
     */
    handleError(type, error) {
        console.error(`EcoSat Error [${type}]:`, error);
        
        // Show user-friendly error message
        let message = 'Ha ocurrido un error inesperado';
        
        switch (type) {
            case 'init_error':
                message = 'Error al inicializar la aplicación';
                break;
            case 'data_load_error':
                message = 'Error al cargar los datos';
                break;
            case 'network_error':
                message = 'Error de conexión de red';
                break;
        }
        
        this.showNotification(message, 'error');
    }

    /**
     * Update sustainability score visualization
     */
    updateSustainabilityScore(scoreData) {
        const scoreCircle = document.getElementById('score-circle');
        const scoreNumber = document.getElementById('overall-score');
        
        if (scoreCircle && scoreNumber && scoreData) {
            const score = scoreData.overall;
            const circumference = 2 * Math.PI * 45;
            const offset = circumference - (score / 100) * circumference;
            
            scoreCircle.style.strokeDashoffset = offset;
            scoreNumber.textContent = score;
            
            // Update breakdown scores
            const breakdown = scoreData.breakdown;
            if (breakdown) {
                Object.keys(breakdown).forEach(key => {
                    const progressBar = document.querySelector(`[data-score="${key}"] .score-progress`);
                    const valueSpan = document.querySelector(`[data-score="${key}"] .score-value`);
                    
                    if (progressBar) {
                        progressBar.style.width = `${breakdown[key]}%`;
                    }
                    if (valueSpan) {
                        valueSpan.textContent = breakdown[key];
                    }
                });
            }
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.EcoSatApp = new EcoSatApp();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EcoSatApp;
}