/**
 * EcoSat Monitor - Enhanced Application Logic with Satellite Data Focus
 * Removed Audio System + Added Satellite Components
 * Author: Elizabeth Díaz Familia
 * Version: 1.1.1 - Fixed Scroll Issue
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
        
        // Satellite tracking system
        this.satelliteTracker = {
            activeSatellites: new Map(),
            statusIndicator: null,
            updateInterval: null,
            lastUpdate: null
        };
        
        // App state
        this.appState = {
            currentSection: 'dashboard',
            selectedCity: null,
            satelliteLayer: 'vegetation',
            satelliteSource: 'landsat8',
            chartMetric: 'ndvi',
            chartTimeframe: '24h',
            userStats: {
                points: 2450,
                streak: 7,
                level: 8,
                achievements: []
            },
            globalMetrics: {
                vegetationIndex: 0.73,
                deforestationRate: -2.4,
                fireHotspots: 1247,
                airQuality: 67,
                surfaceTemperature: 1.2
            },
            satelliteData: {
                globalNDVI: 0.73,
                fireHotspots: 1247,
                cloudCoverage: 32,
                imagesProcessed: 2847,
                areaCovered: '45.2M km²',
                dataLatency: 47
            }
        };

        this.init();
    }

    /**
     * Initialize the enhanced application
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
            await this.initializeSatelliteSystem();
            this.startAutoUpdate();
            this.hideLoadingScreen();
            this.checkNotificationPermission();
            this.cleanupAudioElements();
            console.log('🛰️ EcoSat Monitor initialized successfully with satellite focus');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.handleError('init_error', error);
        }
    }

    /**
     * Clean up any remaining audio elements
     */
    cleanupAudioElements() {
        const audioElements = document.querySelectorAll('[class*="audio"], [id*="audio"]');
        audioElements.forEach(element => {
            if (element.id !== 'app' && !element.closest('.footer-personal')) {
                element.remove();
            }
        });
        
        if (window.AudioGenerator) {
            delete window.AudioGenerator;
        }
        if (window.AudioIntegration) {
            delete window.AudioIntegration;
        }
        
        console.log('🔇 Audio elements cleaned up successfully');
    }

    /**
     * Initialize satellite tracking system
     */
    async initializeSatelliteSystem() {
        try {
            this.initializeSatelliteStatusIndicator();
            await this.loadSatelliteData();
            this.startSatelliteTracking();
            this.initializeSatelliteComponents();
            console.log('🛰️ Satellite system initialized successfully');
        } catch (error) {
            console.error('Error initializing satellite system:', error);
        }
    }

    /**
     * Initialize satellite status indicator with animation
     */
    initializeSatelliteStatusIndicator() {
        const satelliteStatus = document.getElementById('satellite-status');
        if (satelliteStatus) {
            const signalBars = satelliteStatus.querySelectorAll('.signal-bar');
            let currentBar = 0;
            
            this.satelliteTracker.statusIndicator = setInterval(() => {
                signalBars.forEach((bar, index) => {
                    bar.style.opacity = index <= currentBar ? '1' : '0.3';
                });
                currentBar = (currentBar + 1) % signalBars.length;
            }, 800);
        }

        this.updateSatelliteStatusText();
    }

    /**
     * Update satellite status text with different satellites
     */
    updateSatelliteStatusText() {
        const statusTexts = [
            'Landsat-8 Online',
            'Sentinel-2 Active',
            'MODIS Scanning',
            'Data Streaming...',
            'Sentinel-5P Ready',
            'Processing Images...'
        ];
        let statusIndex = 0;
        
        setInterval(() => {
            const statusElement = document.getElementById('satellite-status-text');
            if (statusElement) {
                statusElement.textContent = statusTexts[statusIndex];
                statusIndex = (statusIndex + 1) % statusTexts.length;
            }
        }, 4000);
    }

    /**
     * Load satellite tracking data
     */
    async loadSatelliteData() {
        try {
            if (this.satelliteService) {
                const satelliteData = await this.satelliteService.getActiveSatellites();
                this.satelliteTracker.activeSatellites = new Map(
                    satelliteData.map(sat => [sat.name, sat])
                );
                this.satelliteTracker.lastUpdate = new Date().toISOString();
            }
        } catch (error) {
            console.error('Error loading satellite data:', error);
        }
    }

    /**
     * Start satellite position tracking
     */
    startSatelliteTracking() {
        if (this.satelliteTracker.updateInterval) {
            clearInterval(this.satelliteTracker.updateInterval);
        }
        
        this.satelliteTracker.updateInterval = setInterval(async () => {
            try {
                await this.updateSatellitePositions();
                await this.updateSatelliteMetrics();
            } catch (error) {
                console.error('Error in satellite tracking update:', error);
            }
        }, 60000);
    }

    /**
     * Update satellite positions and data
     */
    async updateSatellitePositions() {
        if (this.satelliteService) {
            try {
                const updatedData = await this.satelliteService.updatePositions();
                this.updateSatelliteDataDisplay(updatedData);
            } catch (error) {
                console.error('Error updating satellite positions:', error);
            }
        }
    }

    /**
     * Update satellite metrics in the UI
     */
    async updateSatelliteMetrics() {
        try {
            const analysis = await this.dataManager.getSatelliteAnalysis('realtime');
            
            this.updateElement('global-ndvi', analysis.globalNDVI.toFixed(3));
            this.updateElement('fire-hotspots', analysis.fireHotspots.toLocaleString());
            this.updateElement('cloud-coverage', `${analysis.cloudCoverage}%`);
            this.updateElement('images-processed', analysis.imagesProcessed.toLocaleString());
            this.updateElement('area-covered', analysis.areaCovered);
            this.updateElement('avg-resolution', analysis.averageResolution);
            this.updateElement('data-latency', `${analysis.dataLatency}s`);
            this.updateElement('last-satellite-update', `Actualizado: ${this.getTimeAgo(analysis.lastUpdated)}`);
            
        } catch (error) {
            console.error('Error updating satellite metrics:', error);
        }
    }

    /**
     * Initialize satellite-specific UI components
     */
    initializeSatelliteComponents() {
        this.initializeSatelliteLayerSelector();
        this.initializeSatelliteSourceSelector();
        this.initializeSatellitePassesDisplay();
        this.initializeEnvironmentalZones();
    }

    /**
     * Initialize satellite layer selector functionality
     */
    initializeSatelliteLayerSelector() {
        const layerSelect = document.getElementById('satellite-layer-select');
        if (layerSelect) {
            layerSelect.addEventListener('change', (e) => {
                this.changeSatelliteLayer(e.target.value);
            });
        }
    }

    /**
     * Initialize satellite source selector functionality
     */
    initializeSatelliteSourceSelector() {
        const sourceSelect = document.getElementById('satellite-source');
        if (sourceSelect) {
            sourceSelect.addEventListener('change', (e) => {
                this.changeSatelliteSource(e.target.value);
            });
        }
    }

    /**
     * Initialize satellite passes display
     */
    async initializeSatellitePassesDisplay() {
        try {
            const passes = await this.dataManager.getSatellitePasses(-23.5505, -46.6333, 24);
            this.displaySatellitePasses(passes);
        } catch (error) {
            console.error('Error loading satellite passes:', error);
        }
    }

    /**
     * Display satellite passes in the UI
     */
    displaySatellitePasses(passes) {
        const passesContainer = document.getElementById('satellite-passes');
        if (!passesContainer || !passes || passes.length === 0) return;
        
        passesContainer.innerHTML = passes.slice(0, 3).map(pass => {
            const startTime = new Date(pass.startTime);
            const satelliteClass = this.getSatelliteIconClass(pass.satelliteName);
            
            return `
                <div class="pass-item">
                    <div class="satellite-icon ${satelliteClass}">
                        <i class="fas fa-satellite"></i>
                    </div>
                    <div class="pass-info">
                        <span class="satellite-name">${pass.satelliteName}</span>
                        <span class="pass-time">${startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} UTC</span>
                        <span class="coverage-area">${pass.coverageArea}</span>
                    </div>
                    <div class="pass-quality ${pass.quality.toLowerCase()}">${pass.quality}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Get CSS class for satellite icon
     */
    getSatelliteIconClass(satelliteName) {
        if (satelliteName.includes('LANDSAT')) return 'landsat';
        if (satelliteName.includes('SENTINEL')) return 'sentinel';
        if (satelliteName.includes('MODIS') || satelliteName.includes('TERRA') || satelliteName.includes('AQUA')) return 'modis';
        return 'landsat';
    }

    /**
     * Initialize environmental zones display
     */
    async initializeEnvironmentalZones() {
        try {
            const zones = await this.dataManager.getEnvironmentalZones('best', 5);
            this.displayEnvironmentalZones(zones);
        } catch (error) {
            console.error('Error loading environmental zones:', error);
        }
    }

    /**
     * Display environmental zones in the UI
     */
    displayEnvironmentalZones(zones) {
        const zonesContainer = document.getElementById('environmental-zones');
        if (!zonesContainer || !zones || zones.length === 0) return;
        
        zonesContainer.innerHTML = zones.map(zone => `
            <div class="zone-item">
                <div class="zone-rank">${zone.rank}</div>
                <div class="zone-info">
                    <div class="zone-name">${zone.name}</div>
                    <div class="zone-location">${zone.location}</div>
                    <div class="zone-coordinates">${zone.coordinates.lat.toFixed(1)}°, ${zone.coordinates.lon.toFixed(1)}°</div>
                </div>
                <div class="zone-metrics">
                    <span class="ndvi-score excellent">NDVI: ${zone.ndvi}</span>
                    <span class="deforestation-rate ${zone.deforestationRate > -0.5 ? 'good' : 'moderate'}">${zone.deforestationRate}%</span>
                </div>
                <div class="zone-trend ${zone.trend > 0.01 ? 'excellent' : zone.trend > 0 ? 'good' : 'stable'}">
                    <i class="fas fa-arrow-${zone.trend > 0 ? 'up' : zone.trend < 0 ? 'down' : 'minus'}"></i>
                    <span>${zone.trend > 0 ? '+' : ''}${zone.trend.toFixed(2)}</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Show loading screen with progress - FIXED VERSION
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const progressBar = document.getElementById('progress-bar');
        
        if (!loadingScreen) return;
        
        let progress = 0;

        const updateProgress = () => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            
            if (progress < 100) {
                setTimeout(updateProgress, 200);
            }
        };

        loadingScreen.style.display = 'flex';
        loadingScreen.style.pointerEvents = 'auto';
        loadingScreen.classList.remove('hidden');
        updateProgress();
    }

    /**
     * Hide loading screen - FIXED VERSION
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (!loadingScreen) return;
        
        // Asegurar que no bloquee interacciones inmediatamente
        loadingScreen.style.pointerEvents = 'none';
        
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                loadingScreen.style.display = 'none';
                
                // CRÍTICO: Asegurar que el body permita scroll
                document.body.style.overflow = 'auto';
                document.body.style.overflowX = 'hidden';
                document.body.style.overflowY = 'auto';
                
                console.log('✅ Loading screen hidden - Scroll enabled');
            }, 500);
        }, 1000);
    }

    /**
     * Load and initialize core modules
     */
    async loadDependencies() {
        this.offlineStorage = new OfflineStorage();
        await this.offlineStorage.init();

        this.dataManager = new DataManager(this.offlineStorage);
        this.satelliteService = new SatelliteService(this.dataManager);
        
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
        this.setupNavigationEvents();
        this.setupControlEvents();
        this.setupDashboardEvents();
        this.setupSatelliteEvents();
        this.setupModalEvents();
        this.setupNetworkEvents();
        this.setupWindowEvents();
    }

    /**
     * Setup satellite-specific event listeners
     */
    setupSatelliteEvents() {
        const satelliteLayerSelect = document.getElementById('satellite-layer-select');
        if (satelliteLayerSelect) {
            satelliteLayerSelect.addEventListener('change', (e) => {
                this.changeSatelliteLayer(e.target.value);
            });
        }

        const satelliteSource = document.getElementById('satellite-source');
        if (satelliteSource) {
            satelliteSource.addEventListener('change', (e) => {
                this.changeSatelliteSource(e.target.value);
            });
        }

        const analysisPeriod = document.getElementById('analysis-period');
        if (analysisPeriod) {
            analysisPeriod.addEventListener('change', (e) => {
                this.updateAnalysisPeriod(e.target.value);
            });
        }

        const refreshButton = document.getElementById('refresh-satellite-data');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.refreshSatelliteData();
            });
        }

        const zoneFilter = document.getElementById('zone-filter');
        if (zoneFilter) {
            zoneFilter.addEventListener('change', (e) => {
                this.filterEnvironmentalZones(e.target.value);
            });
        }
    }

    /**
     * Change satellite layer
     */
    async changeSatelliteLayer(layer) {
        this.appState.satelliteLayer = layer;
        
        try {
            if (this.map) {
                await this.updateSatelliteMapLayer(layer);
            }
            this.updateSatelliteLayerLegend(layer);
        } catch (error) {
            console.error('Error changing satellite layer:', error);
        }
    }

    /**
     * Change satellite source
     */
    async changeSatelliteSource(source) {
        this.appState.satelliteSource = source;
        
        try {
            this.updateSatelliteSourceInfo(source);
            await this.initializeSatellitePassesDisplay();
        } catch (error) {
            console.error('Error changing satellite source:', error);
        }
    }

    /**
     * Update satellite source information
     */
    updateSatelliteSourceInfo(source) {
        const satelliteConfigs = {
            landsat8: { name: 'Landsat-8', resolution: '30m resolución' },
            sentinel2: { name: 'Sentinel-2', resolution: '10m resolución' },
            modis: { name: 'MODIS Terra/Aqua', resolution: '250m resolución' },
            sentinel5p: { name: 'Sentinel-5P', resolution: '7km resolución' }
        };
        
        const config = satelliteConfigs[source];
        if (config) {
            this.updateElement('active-satellite', config.name);
            this.updateElement('satellite-resolution', config.resolution);
        }
    }

    /**
     * Update satellite map layer
     */
    async updateSatelliteMapLayer(layer) {
        console.log(`Updating satellite map layer to: ${layer}`);
        this.updateSatelliteLayerLegend(layer);
    }

    /**
     * Update satellite layer legend
     */
    updateSatelliteLayerLegend(layer) {
        const legends = {
            vegetation: [
                { color: 'vegetation-high', label: 'Alto (>0.8)' },
                { color: 'vegetation-medium', label: 'Medio (0.4-0.8)' },
                { color: 'vegetation-low', label: 'Bajo (0.2-0.4)' },
                { color: 'vegetation-none', label: 'Sin vegetación (<0.2)' }
            ],
            temperature: [
                { color: 'temp-hot', label: 'Caliente (>35°C)' },
                { color: 'temp-warm', label: 'Cálido (25-35°C)' },
                { color: 'temp-moderate', label: 'Moderado (15-25°C)' },
                { color: 'temp-cold', label: 'Frío (<15°C)' }
            ],
            deforestation: [
                { color: 'deforest-critical', label: 'Crítica (>5%)' },
                { color: 'deforest-high', label: 'Alta (2-5%)' },
                { color: 'deforest-moderate', label: 'Moderada (0.5-2%)' },
                { color: 'deforest-low', label: 'Baja (<0.5%)' }
            ]
        };
        
        const mapLegend = document.querySelector('.map-legend');
        if (mapLegend && legends[layer]) {
            mapLegend.innerHTML = legends[layer].map(item => `
                <div class="legend-item">
                    <span class="legend-color ${item.color}"></span>
                    <span>${item.label}</span>
                </div>
            `).join('');
        }
    }

    /**
     * Update analysis period
     */
    async updateAnalysisPeriod(period) {
        try {
            const analysis = await this.dataManager.getSatelliteAnalysis(period);
            this.updateSatelliteAnalysisDisplay(analysis);
        } catch (error) {
            console.error('Error updating analysis period:', error);
        }
    }

    /**
     * Refresh satellite data
     */
    async refreshSatelliteData() {
        const refreshButton = document.getElementById('refresh-satellite-data');
        if (refreshButton) {
            refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            refreshButton.disabled = true;
        }

        try {
            await this.updateSatelliteMetrics();
            await this.initializeSatellitePassesDisplay();
            await this.initializeEnvironmentalZones();
            
            const now = new Date();
            this.updateElement('last-satellite-update', `Actualizado: ${now.toLocaleTimeString('es-ES')}`);
            
        } catch (error) {
            console.error('Error refreshing satellite data:', error);
        } finally {
            if (refreshButton) {
                refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
                refreshButton.disabled = false;
            }
        }
    }

    /**
     * Filter environmental zones
     */
    async filterEnvironmentalZones(filter) {
        try {
            const zones = await this.dataManager.getEnvironmentalZones(filter, 5);
            this.displayEnvironmentalZones(zones);
        } catch (error) {
            console.error('Error filtering environmental zones:', error);
        }
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
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        const languageToggle = document.getElementById('language-toggle');
        if (languageToggle) {
            languageToggle.addEventListener('click', () => this.toggleLanguage());
        }

        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
        }
    }

    /**
     * Setup dashboard interaction events
     */
    setupDashboardEvents() {
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
        const settingsModal = document.getElementById('settings-modal');
        const settingsClose = document.getElementById('settings-close');
        
        if (settingsClose) {
            settingsClose.addEventListener('click', () => {
                settingsModal.classList.add('hidden');
            });
        }

        this.setupSettingsControls();

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
        const preferredSatellite = document.getElementById('preferred-satellite');
        const dataResolution = document.getElementById('data-resolution');

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

        if (preferredSatellite) {
            preferredSatellite.addEventListener('change', (e) => {
                this.setPreferredSatellite(e.target.value);
            });
        }

        if (dataResolution) {
            dataResolution.addEventListener('change', (e) => {
                this.setDataResolution(e.target.value);
            });
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
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => btn.classList.remove('active'));
        
        const activeBtn = document.querySelector(`[data-section="${section}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        this.appState.currentSection = section;
        
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
            case 'satellite':
                this.loadSatelliteData();
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
        
        const languageToggle = document.getElementById('language-toggle');
        if (languageToggle) {
            languageToggle.querySelector('.lang-text').textContent = language.toUpperCase();
        }

        if (window.Translations) {
            window.Translations.setLanguage(language);
        }
    }

    /**
     * Load initial data for the dashboard
     */
    async loadInitialData() {
        try {
            await this.updateGlobalMetrics();
            await this.initializeSatelliteMap();
            await this.initializeCharts();
            await this.loadRecentAchievements();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.handleError('data_load_error', error);
        }
    }

    /**
     * Update enhanced global metrics with satellite sources
     */
    async updateGlobalMetrics() {
        try {
            const metrics = await this.dataManager.getGlobalMetrics();
            
            this.updateElement('global-aqi', metrics.airQuality || 67);
            this.updateElement('global-temp', `+${metrics.surfaceTemperature || 1.2}°C`);
            this.updateElement('vegetation-index', (metrics.vegetationIndex || 0.73).toFixed(2));
            this.updateElement('deforestation-rate', `${metrics.deforestationRate || -2.4}%`);
            
            this.updateMetricStatus('global-aqi', metrics.airQuality || 67);
            
            this.appState.globalMetrics = metrics;
            
        } catch (error) {
            console.error('Error updating enhanced global metrics:', error);
        }
    }

    /**
     * Initialize satellite map instead of regular world map
     */
    async initializeSatelliteMap() {
        const mapContainer = document.getElementById('satellite-map');
        if (!mapContainer) return;

        try {
            this.map = L.map('satellite-map').setView([20, 0], 2);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors | Satellite Data: NASA, ESA'
            }).addTo(this.map);

            await this.loadSatelliteMapMarkers();
            
        } catch (error) {
            console.error('Error initializing satellite map:', error);
        }
    }

    /**
     * Load satellite data markers on map
     */
    async loadSatelliteMapMarkers() {
        try {
            const zones = await this.dataManager.getEnvironmentalZones('best', 20);
            
            zones.forEach(zone => {
                const color = this.getVegetationColor(zone.ndvi);
                const marker = L.circleMarker([zone.coordinates.lat, zone.coordinates.lon], {
                    radius: 8,
                    fillColor: color,
                    color: '#fff',
                    weight: 2,
                    fillOpacity: 0.8
                }).addTo(this.map);

                marker.bindPopup(`
                    <div class="satellite-popup">
                        <h4>${zone.name}</h4>
                        <p><strong>NDVI:</strong> ${zone.ndvi}</p>
                        <p><strong>Deforestación:</strong> ${zone.deforestationRate}%</p>
                        <p><strong>Último satélite:</strong> ${zone.lastSatellitePass || 'Landsat-8'}</p>
                        <p><strong>Calidad datos:</strong> ${zone.dataQuality || 'Buena'}</p>
                    </div>
                `);
            });
            
        } catch (error) {
            console.error('Error loading satellite map markers:', error);
        }
    }

    /**
     * Get vegetation color based on NDVI value
     */
    getVegetationColor(ndvi) {
        if (ndvi >= 0.8) return '#10B981';
        if (ndvi >= 0.6) return '#84CC16';
        if (ndvi >= 0.4) return '#F59E0B';
        if (ndvi >= 0.2) return '#EF4444';
        return '#6B7280';
    }

    /**
     * Initialize charts with satellite data
     */
    async initializeCharts() {
        try {
            await this.chartsController.initSatelliteTrendsChart('satellite-trends-chart');
            
            const realtimeCanvas = document.getElementById('realtime-chart');
            if (realtimeCanvas) {
                await this.chartsController.initRealtimeChart('realtime-chart');
            }
            
            this.initializeSustainabilityScore();
            
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }

    /**
     * Initialize sustainability score display
     */
    initializeSustainabilityScore() {
        const scoreCircle = document.getElementById('score-circle');
        if (!scoreCircle) return;

        const score = this.calculateSustainabilityScore();
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (score / 100) * circumference;

        this.updateElement('score-number', score);

        const scoreProgress = scoreCircle.querySelector('.score-fill');
        if (scoreProgress) {
            scoreProgress.style.strokeDashoffset = offset;
        }

        this.updateScoreBreakdown();
    }

    /**
     * Calculate overall sustainability score
     */
    calculateSustainabilityScore() {
        const metrics = this.appState.globalMetrics;
        let totalScore = 0;
        let weightSum = 0;

        if (metrics.airQuality) {
            const aqiScore = Math.max(0, 100 - metrics.airQuality);
            totalScore += aqiScore * 0.25;
            weightSum += 0.25;
        }

        if (metrics.vegetationIndex) {
            const vegScore = metrics.vegetationIndex * 100;
            totalScore += vegScore * 0.30;
            weightSum += 0.30;
        }

        if (metrics.surfaceTemperature !== undefined) {
            const tempScore = Math.max(0, 100 - Math.abs(metrics.surfaceTemperature) * 10);
            totalScore += tempScore * 0.20;
            weightSum += 0.20;
        }

        if (metrics.deforestationRate !== undefined) {
            const deforestScore = Math.max(0, 100 + metrics.deforestationRate * 5);
            totalScore += deforestScore * 0.25;
            weightSum += 0.25;
        }

        return weightSum > 0 ? Math.round(totalScore / weightSum) : 69;
    }

    /**
     * Update score breakdown bars
     */
    updateScoreBreakdown() {
        const breakdownItems = [
            { id: 'air-quality-bar', value: this.getAirQualityScore() },
            { id: 'vegetation-bar', value: this.getVegetationScore() },
            { id: 'temperature-bar', value: this.getTemperatureScore() },
            { id: 'deforestation-bar', value: this.getDeforestationScore() }
        ];

        breakdownItems.forEach(item => {
            const progressBar = document.getElementById(item.id);
            if (progressBar) {
                progressBar.style.width = `${item.value}%`;
                
                const valueElement = progressBar.closest('.score-item').querySelector('.score-value');
                if (valueElement) {
                    valueElement.textContent = item.value;
                }
            }
        });
    }

    /**
     * Get individual metric scores
     */
    getAirQualityScore() {
        const aqi = this.appState.globalMetrics.airQuality || 67;
        return Math.max(0, 100 - aqi);
    }

    getVegetationScore() {
        const ndvi = this.appState.globalMetrics.vegetationIndex || 0.73;
        return Math.round(ndvi * 100);
    }

    getTemperatureScore() {
        const temp = this.appState.globalMetrics.surfaceTemperature || 1.2;
        return Math.max(0, 100 - Math.abs(temp) * 10);
    }

    getDeforestationScore() {
        const rate = this.appState.globalMetrics.deforestationRate || -2.4;
        return Math.max(0, 100 + rate * 5);
    }

    /**
     * Load recent achievements
     */
    async loadRecentAchievements() {
        try {
            const achievements = await this.gamificationSystem.getRecentAchievements();
            this.displayAchievements(achievements);
        } catch (error) {
            console.error('Error loading achievements:', error);
        }
    }

    /**
     * Display achievements in UI
     */
    displayAchievements(achievements) {
        const achievementsList = document.getElementById('achievements-list');
        if (!achievementsList || !achievements) return;

        achievementsList.innerHTML = achievements.slice(0, 3).map(achievement => `
            <div class="achievement-item">
                <div class="achievement-icon ${achievement.rarity}">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-info">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                    <span class="achievement-points">+${achievement.points} puntos</span>
                </div>
                <div class="achievement-rarity ${achievement.rarity}">${achievement.rarity}</div>
            </div>
        `).join('');
    }

    /**
     * Update chart based on metric and timeframe
     */
    async updateChart(metric, timeframe) {
        this.appState.chartMetric = metric;
        this.appState.chartTimeframe = timeframe;

        try {
            await this.chartsController.updateChart('realtime-chart', metric, timeframe);
        } catch (error) {
            console.error('Error updating chart:', error);
        }
    }

    /**
     * Update score period
     */
    async updateScorePeriod(period) {
        try {
            const metrics = await this.dataManager.getGlobalMetrics(period);
            this.appState.globalMetrics = metrics;
            this.initializeSustainabilityScore();
        } catch (error) {
            console.error('Error updating score period:', error);
        }
    }

    /**
     * Load section-specific data
     */
    async loadDashboardData() {
        console.log('Loading dashboard data...');
        await this.updateGlobalMetrics();
    }

    async loadCitiesData() {
        console.log('Loading cities data...');
    }

    async loadAnalyticsData() {
        console.log('Loading analytics data...');
    }

    async loadAchievementsData() {
        console.log('Loading achievements data...');
        await this.loadRecentAchievements();
    }

    /**
     * Settings functions
     */
    openSettings() {
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal) {
            settingsModal.classList.remove('hidden');
        }
    }

    toggleAutoUpdate(enabled) {
        if (enabled) {
            this.startAutoUpdate();
        } else {
            this.stopAutoUpdate();
        }
        localStorage.setItem('ecosat-auto-update', enabled);
    }

    toggleNotifications(enabled) {
        if (enabled) {
            this.requestNotificationPermission();
        }
        localStorage.setItem('ecosat-notifications', enabled);
    }

    toggleOfflineMode(enabled) {
        localStorage.setItem('ecosat-offline-mode', enabled);
        if (enabled) {
            this.enableOfflineMode();
        }
    }

    setUpdateFrequency(minutes) {
        this.updateFrequency = minutes * 60 * 1000;
        localStorage.setItem('ecosat-update-frequency', this.updateFrequency);
        this.restartAutoUpdate();
    }

    setPreferredSatellite(satellite) {
        this.appState.satelliteSource = satellite;
        localStorage.setItem('ecosat-preferred-satellite', satellite);
        this.changeSatelliteSource(satellite);
    }

    setDataResolution(resolution) {
        localStorage.setItem('ecosat-data-resolution', resolution);
    }

    clearCache() {
        if (this.dataManager) {
            this.dataManager.clearCache();
        }
        if (this.satelliteService) {
            this.satelliteService.clearCache();
        }
        localStorage.removeItem('ecosat-cache');
        this.showNotification('Cache cleared successfully', 'success');
    }

    /**
     * Auto-update functionality
     */
    startAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        const frequency = parseInt(localStorage.getItem('ecosat-update-frequency')) || 300000;
        
        this.updateInterval = setInterval(async () => {
            try {
                await this.updateGlobalMetrics();
                await this.updateSatelliteMetrics();
                console.log('Auto-update completed');
            } catch (error) {
                console.error('Error in auto-update:', error);
            }
        }, frequency);

        console.log(`Auto-update started with ${frequency / 1000}s interval`);
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('Auto-update stopped');
        }
    }

    restartAutoUpdate() {
        this.stopAutoUpdate();
        this.startAutoUpdate();
    }

    pauseUpdates() {
        this.stopAutoUpdate();
        console.log('Updates paused (tab not visible)');
    }

    resumeUpdates() {
        const autoUpdate = localStorage.getItem('ecosat-auto-update') !== 'false';
        if (autoUpdate) {
            this.startAutoUpdate();
            console.log('Updates resumed (tab visible)');
        }
    }

    /**
     * Notification system
     */
    async checkNotificationPermission() {
        if ('Notification' in window) {
            this.notificationPermission = Notification.permission;
            
            if (this.notificationPermission === 'default') {
                console.log('Notification permission not yet requested');
            }
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission;
            
            if (permission === 'granted') {
                this.showNotification('Notifications enabled successfully', 'success');
            }
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `toast-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Offline functionality
     */
    showOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.classList.remove('hidden');
        }
    }

    hideOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }

    async syncOfflineData() {
        if (this.offlineStorage) {
            try {
                await this.offlineStorage.syncPendingData();
                console.log('Offline data synced successfully');
            } catch (error) {
                console.error('Error syncing offline data:', error);
            }
        }
    }

    enableOfflineMode() {
        console.log('Offline mode enabled');
    }

    /**
     * Update notifications
     */
    applyUpdate() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(registration => {
                if (registration && registration.waiting) {
                    registration.waiting.postMessage({ action: 'skipWaiting' });
                    window.location.reload();
                }
            });
        }
    }

    /**
     * State management
     */
    saveAppState() {
        const state = {
            currentSection: this.appState.currentSection,
            satelliteLayer: this.appState.satelliteLayer,
            satelliteSource: this.appState.satelliteSource,
            chartMetric: this.appState.chartMetric,
            chartTimeframe: this.appState.chartTimeframe,
            userStats: this.appState.userStats
        };
        
        localStorage.setItem('ecosat-app-state', JSON.stringify(state));
    }

    loadAppState() {
        try {
            const savedState = localStorage.getItem('ecosat-app-state');
            if (savedState) {
                const state = JSON.parse(savedState);
                Object.assign(this.appState, state);
            }
        } catch (error) {
            console.error('Error loading app state:', error);
        }
    }

    /**
     * Utility functions
     */
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateMetricStatus(metricId, value) {
        const element = document.getElementById(metricId);
        if (!element) return;

        const statusElement = element.closest('.metric-card').querySelector('.metric-status');
        if (!statusElement) return;

        let status = 'moderate';
        if (metricId === 'global-aqi') {
            if (value <= 50) status = 'good';
            else if (value <= 100) status = 'moderate';
            else if (value <= 150) status = 'warning';
            else status = 'critical';
        }

        statusElement.className = `metric-status ${status}`;
        statusElement.textContent = status.toUpperCase();
    }

    updateSatelliteDataDisplay(data) {
        if (data && data.satellites) {
            data.satellites.forEach(satellite => {
                this.updateElement(`satellite-${satellite.name}-status`, satellite.status);
                this.updateElement(`satellite-${satellite.name}-position`, 
                    `${satellite.lat.toFixed(2)}°, ${satellite.lon.toFixed(2)}°`);
            });
        }
    }

    updateSatelliteAnalysisDisplay(analysis) {
        if (!analysis) return;

        Object.entries(analysis).forEach(([key, value]) => {
            this.updateElement(`analysis-${key}`, value);
        });
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) return 'hace menos de 1 minuto';
        if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
        if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
        return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    }

    /**
     * Error handling
     */
    handleError(type, error) {
        console.error(`Error [${type}]:`, error);
        
        const errorMessages = {
            init_error: 'Error initializing application',
            data_load_error: 'Error loading data',
            satellite_error: 'Error with satellite data',
            network_error: 'Network connection error'
        };

        const message = errorMessages[type] || 'An unexpected error occurred';
        this.showNotification(message, 'error');
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        this.stopAutoUpdate();
        
        if (this.satelliteTracker.statusIndicator) {
            clearInterval(this.satelliteTracker.statusIndicator);
        }
        
        if (this.satelliteTracker.updateInterval) {
            clearInterval(this.satelliteTracker.updateInterval);
        }

        if (this.chartsController) {
            this.chartsController.destroy();
        }
        
        if (this.satelliteService) {
            this.satelliteService.destroy();
        }

        this.saveAppState();

        console.log('EcoSat Monitor application destroyed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.ecosatApp = new EcoSatApp();
});

window.addEventListener('beforeunload', () => {
    if (window.ecosatApp) {
        window.ecosatApp.destroy();
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EcoSatApp;
}