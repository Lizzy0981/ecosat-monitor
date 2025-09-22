/**
 * EcoSat Monitor - Data Management System
 * Handles API orchestration, caching, and data synchronization
 * Author: Elizabeth Díaz Familia
 * Version: 1.0.0
 */

class DataManager {
    constructor(offlineStorage) {
        this.offlineStorage = offlineStorage;
        this.isOnline = navigator.onLine;
        this.apiConfig = {
            nasa: {
                baseUrl: 'https://api.nasa.gov',
                apiKey: 'DEMO_KEY', // Free tier: 1000 requests/hour
                endpoints: {
                    imagery: '/planetary/earth/imagery',
                    assets: '/planetary/earth/assets'
                }
            },
            openweather: {
                baseUrl: 'https://api.openweathermap.org/data/2.5',
                apiKey: 'your_api_key_here', // Register at openweathermap.org
                endpoints: {
                    pollution: '/air_pollution',
                    weather: '/weather',
                    forecast: '/forecast'
                }
            },
            noaa: {
                baseUrl: 'https://www.ncei.noaa.gov/cdo-web/api/v2',
                token: 'your_token_here', // Register at ncdc.noaa.gov/cdo-web/token
                endpoints: {
                    data: '/data',
                    stations: '/stations'
                }
            },
            worldbank: {
                baseUrl: 'https://api.worldbank.org/v2',
                endpoints: {
                    indicators: '/indicator'
                }
            }
        };

        // Rate limiting
        this.rateLimits = {
            nasa: { requests: 0, resetTime: Date.now() + 3600000 }, // 1 hour
            openweather: { requests: 0, resetTime: Date.now() + 60000 }, // 1 minute
            noaa: { requests: 0, resetTime: Date.now() + 86400000 } // 1 day
        };

        // Cache configuration
        this.cacheConfig = {
            globalMetrics: { ttl: 300000, key: 'global-metrics' }, // 5 minutes
            citiesData: { ttl: 600000, key: 'cities-data' }, // 10 minutes
            chartData: { ttl: 300000, key: 'chart-data' }, // 5 minutes
            achievements: { ttl: 3600000, key: 'achievements' }, // 1 hour
            satelliteData: { ttl: 900000, key: 'satellite-data' } // 15 minutes
        };

        // Mock data for development and offline mode
        this.mockData = this.initializeMockData();

        // Request queue for offline sync
        this.requestQueue = [];
    }

    /**
     * Initialize the data manager
     */
    async init() {
        this.setupNetworkListeners();
        await this.loadCachedData();
        console.log('DataManager initialized');
    }

    /**
     * Setup network status listeners
     */
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processOfflineQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    /**
     * Load cached data on initialization
     */
    async loadCachedData() {
        try {
            const cachedKeys = Object.values(this.cacheConfig).map(config => config.key);
            for (const key of cachedKeys) {
                const cached = await this.offlineStorage.get(key);
                if (cached) {
                    console.log(`Loaded cached data: ${key}`);
                }
            }
        } catch (error) {
            console.error('Error loading cached data:', error);
        }
    }

    /**
     * Get global environmental metrics
     */
    async getGlobalMetrics() {
        const cacheKey = this.cacheConfig.globalMetrics.key;
        
        try {
            // Try cache first
            const cached = await this.getCachedData(cacheKey, this.cacheConfig.globalMetrics.ttl);
            if (cached) {
                return cached;
            }

            let metrics;
            if (this.isOnline) {
                metrics = await this.fetchGlobalMetricsFromAPIs();
                await this.cacheData(cacheKey, metrics);
            } else {
                metrics = this.mockData.globalMetrics;
            }

            return metrics;
        } catch (error) {
            console.error('Error getting global metrics:', error);
            return this.mockData.globalMetrics;
        }
    }

    /**
     * Fetch global metrics from multiple APIs
     */
    async fetchGlobalMetricsFromAPIs() {
        const promises = [
            this.getGlobalAirQuality(),
            this.getGlobalTemperature(),
            this.getGlobalCO2Levels(),
            this.getGreenSpaceIndex()
        ];

        const [aqi, temperature, co2, greenIndex] = await Promise.allSettled(promises);

        return {
            aqi: aqi.status === 'fulfilled' ? aqi.value : 67,
            temperature: temperature.status === 'fulfilled' ? temperature.value : 1.2,
            co2Levels: co2.status === 'fulfilled' ? co2.value : 418,
            greenIndex: greenIndex.status === 'fulfilled' ? greenIndex.value : 73,
            sustainabilityScore: this.calculateSustainabilityScore({
                aqi: aqi.status === 'fulfilled' ? aqi.value : 67,
                temperature: temperature.status === 'fulfilled' ? temperature.value : 1.2,
                co2Levels: co2.status === 'fulfilled' ? co2.value : 418,
                greenIndex: greenIndex.status === 'fulfilled' ? greenIndex.value : 73
            }),
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Get global air quality average
     */
    async getGlobalAirQuality() {
        try {
            const majorCities = [
                { lat: 40.7128, lon: -74.0060 }, // New York
                { lat: 51.5074, lon: -0.1278 },  // London
                { lat: 35.6762, lon: 139.6503 }, // Tokyo
                { lat: -23.5505, lon: -46.6333 }, // São Paulo
                { lat: 28.6139, lon: 77.2090 }   // Delhi
            ];

            const aqiPromises = majorCities.map(city => this.getCityAirQuality(city.lat, city.lon));
            const aqiResults = await Promise.allSettled(aqiPromises);
            
            const validResults = aqiResults
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);

            if (validResults.length > 0) {
                return Math.round(validResults.reduce((sum, aqi) => sum + aqi, 0) / validResults.length);
            }

            throw new Error('No valid AQI data available');
        } catch (error) {
            console.error('Error fetching global AQI:', error);
            throw error;
        }
    }

    /**
     * Get air quality for specific city
     */
    async getCityAirQuality(lat, lon) {
        if (!this.checkRateLimit('openweather')) {
            throw new Error('Rate limit exceeded for OpenWeatherMap API');
        }

        const url = `${this.apiConfig.openweather.baseUrl}${this.apiConfig.openweather.endpoints.pollution}?lat=${lat}&lon=${lon}&appid=${this.apiConfig.openweather.apiKey}`;
        
        try {
            const response = await this.makeRequest(url, 'openweather');
            const data = await response.json();
            
            if (response.ok && data.list && data.list.length > 0) {
                return data.list[0].main.aqi * 50; // Convert to 0-500 scale
            }
            
            throw new Error('Invalid air quality response');
        } catch (error) {
            console.error('Error fetching city AQI:', error);
            throw error;
        }
    }

    /**
     * Get global temperature anomaly
     */
    async getGlobalTemperature() {
        try {
            // For demo purposes, we'll use a calculated value
            // In production, this would fetch from NOAA Climate API
            const baseTemp = 14.0; // Global average baseline
            const currentTemp = 15.2; // Current global average
            return Number((currentTemp - baseTemp).toFixed(1));
        } catch (error) {
            console.error('Error fetching global temperature:', error);
            throw error;
        }
    }

    /**
     * Get global CO2 levels
     */
    async getGlobalCO2Levels() {
        try {
            // This would typically fetch from NOAA's Earth System Research Laboratory
            // For demo, we'll return a current estimated value
            return 418; // ppm
        } catch (error) {
            console.error('Error fetching CO2 levels:', error);
            throw error;
        }
    }

    /**
     * Get global green space index
     */
    async getGreenSpaceIndex() {
        try {
            // This would fetch from satellite vegetation indices
            // For demo, we'll calculate a composite score
            return 73;
        } catch (error) {
            console.error('Error fetching green space index:', error);
            throw error;
        }
    }

    /**
     * Get cities data with environmental metrics
     */
    async getCitiesData() {
        const cacheKey = this.cacheConfig.citiesData.key;
        
        try {
            const cached = await this.getCachedData(cacheKey, this.cacheConfig.citiesData.ttl);
            if (cached) {
                return cached;
            }

            let cities;
            if (this.isOnline) {
                cities = await this.fetchCitiesFromAPIs();
                await this.cacheData(cacheKey, cities);
            } else {
                cities = this.mockData.cities;
            }

            return cities;
        } catch (error) {
            console.error('Error getting cities data:', error);
            return this.mockData.cities;
        }
    }

    /**
     * Fetch cities data from APIs
     */
    async fetchCitiesFromAPIs() {
        const cities = [
            { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060 },
            { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278 },
            { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
            { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333 },
            { name: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
            { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
            { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357 },
            { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332 }
        ];

        const citiesWithData = await Promise.all(
            cities.map(async (city) => {
                try {
                    const [aqi, weather] = await Promise.allSettled([
                        this.getCityAirQuality(city.lat, city.lon),
                        this.getCityWeather(city.lat, city.lon)
                    ]);

                    return {
                        ...city,
                        aqi: aqi.status === 'fulfilled' ? aqi.value : Math.floor(Math.random() * 200) + 50,
                        temperature: weather.status === 'fulfilled' ? weather.value.temp : Math.floor(Math.random() * 30) + 10,
                        humidity: weather.status === 'fulfilled' ? weather.value.humidity : Math.floor(Math.random() * 40) + 40,
                        lastUpdated: new Date().toISOString()
                    };
                } catch (error) {
                    console.error(`Error fetching data for ${city.name}:`, error);
                    return {
                        ...city,
                        aqi: Math.floor(Math.random() * 200) + 50,
                        temperature: Math.floor(Math.random() * 30) + 10,
                        humidity: Math.floor(Math.random() * 40) + 40,
                        lastUpdated: new Date().toISOString()
                    };
                }
            })
        );

        return citiesWithData;
    }

    /**
     * Get weather data for city
     */
    async getCityWeather(lat, lon) {
        if (!this.checkRateLimit('openweather')) {
            throw new Error('Rate limit exceeded for OpenWeatherMap API');
        }

        const url = `${this.apiConfig.openweather.baseUrl}${this.apiConfig.openweather.endpoints.weather}?lat=${lat}&lon=${lon}&appid=${this.apiConfig.openweather.apiKey}&units=metric`;
        
        try {
            const response = await this.makeRequest(url, 'openweather');
            const data = await response.json();
            
            if (response.ok && data.main) {
                return {
                    temp: Math.round(data.main.temp),
                    humidity: data.main.humidity
                };
            }
            
            throw new Error('Invalid weather response');
        } catch (error) {
            console.error('Error fetching city weather:', error);
            throw error;
        }
    }

    /**
     * Get chart data for specific metric and timeframe
     */
    async getChartData(metric, timeframe) {
        const cacheKey = `${this.cacheConfig.chartData.key}-${metric}-${timeframe}`;
        
        try {
            const cached = await this.getCachedData(cacheKey, this.cacheConfig.chartData.ttl);
            if (cached) {
                return cached;
            }

            let chartData;
            if (this.isOnline) {
                chartData = await this.fetchChartDataFromAPIs(metric, timeframe);
                await this.cacheData(cacheKey, chartData);
            } else {
                chartData = this.generateMockChartData(metric, timeframe);
            }

            return chartData;
        } catch (error) {
            console.error('Error getting chart data:', error);
            return this.generateMockChartData(metric, timeframe);
        }
    }

    /**
     * Fetch chart data from APIs
     */
    async fetchChartDataFromAPIs(metric, timeframe) {
        // This would fetch historical data from various APIs
        // For demo, we'll generate realistic data patterns
        return this.generateMockChartData(metric, timeframe);
    }

    /**
     * Generate mock chart data
     */
    generateMockChartData(metric, timeframe) {
        const dataPoints = this.getDataPointsCount(timeframe);
        const labels = this.generateTimeLabels(timeframe, dataPoints);
        const data = this.generateMetricData(metric, dataPoints);

        return {
            labels,
            datasets: [{
                label: this.getMetricLabel(metric),
                data,
                borderColor: this.getMetricColor(metric),
                backgroundColor: this.getMetricColor(metric, 0.1),
                tension: 0.4,
                fill: true
            }],
            metric,
            timeframe,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Get number of data points for timeframe
     */
    getDataPointsCount(timeframe) {
        switch (timeframe) {
            case '24h': return 24;
            case '7d': return 7;
            case '30d': return 30;
            default: return 24;
        }
    }

    /**
     * Generate time labels for chart
     */
    generateTimeLabels(timeframe, count) {
        const labels = [];
        const now = new Date();
        
        for (let i = count - 1; i >= 0; i--) {
            let date;
            switch (timeframe) {
                case '24h':
                    date = new Date(now.getTime() - i * 60 * 60 * 1000);
                    labels.push(date.toLocaleTimeString('es-ES', { hour: '2-digit' }));
                    break;
                case '7d':
                    date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                    labels.push(date.toLocaleDateString('es-ES', { weekday: 'short' }));
                    break;
                case '30d':
                    date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                    labels.push(date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }));
                    break;
                default:
                    labels.push(`${i}`);
            }
        }
        
        return labels;
    }

    /**
     * Generate realistic metric data
     */
    generateMetricData(metric, count) {
        const data = [];
        let baseValue, variance, trend;

        switch (metric) {
            case 'co2':
                baseValue = 418;
                variance = 5;
                trend = 0.1;
                break;
            case 'aqi':
                baseValue = 67;
                variance = 25;
                trend = -0.2;
                break;
            case 'temperature':
                baseValue = 1.2;
                variance = 0.3;
                trend = 0.01;
                break;
            case 'humidity':
                baseValue = 65;
                variance = 15;
                trend = 0;
                break;
            default:
                baseValue = 50;
                variance = 10;
                trend = 0;
        }

        for (let i = 0; i < count; i++) {
            const noise = (Math.random() - 0.5) * variance;
            const trendValue = baseValue + (trend * i) + noise;
            data.push(Number(trendValue.toFixed(2)));
        }

        return data;
    }

    /**
     * Get metric label for charts
     */
    getMetricLabel(metric) {
        const labels = {
            co2: 'CO₂ (ppm)',
            aqi: 'Índice de Calidad del Aire',
            temperature: 'Anomalía de Temperatura (°C)',
            humidity: 'Humedad (%)'
        };
        return labels[metric] || metric;
    }

    /**
     * Get metric color for charts
     */
    getMetricColor(metric, alpha = 1) {
        const colors = {
            co2: `rgba(239, 68, 68, ${alpha})`,
            aqi: `rgba(59, 130, 246, ${alpha})`,
            temperature: `rgba(245, 158, 11, ${alpha})`,
            humidity: `rgba(34, 197, 94, ${alpha})`
        };
        return colors[metric] || `rgba(107, 114, 128, ${alpha})`;
    }

    /**
     * Get top cities by filter criteria
     */
    async getTopCities(filter = 'best', limit = 10) {
        try {
            const cities = await this.getCitiesData();
            let sortedCities;

            switch (filter) {
                case 'best':
                    sortedCities = cities.sort((a, b) => this.calculateCityScore(b) - this.calculateCityScore(a));
                    break;
                case 'worst':
                    sortedCities = cities.sort((a, b) => this.calculateCityScore(a) - this.calculateCityScore(b));
                    break;
                case 'improved':
                    // Mock improvement data
                    sortedCities = cities.sort(() => Math.random() - 0.5);
                    break;
                default:
                    sortedCities = cities;
            }

            return sortedCities.slice(0, limit).map((city, index) => ({
                ...city,
                rank: index + 1,
                score: this.calculateCityScore(city),
                trend: Math.floor(Math.random() * 7) - 3 // -3 to +3
            }));
        } catch (error) {
            console.error('Error getting top cities:', error);
            return this.mockData.topCities;
        }
    }

    /**
     * Calculate sustainability score for city
     */
    calculateCityScore(city) {
        const aqiScore = Math.max(0, 100 - (city.aqi / 5)); // Invert AQI (lower is better)
        const tempScore = 70; // Placeholder for temperature score
        const humidityScore = Math.abs(city.humidity - 50) > 30 ? 40 : 80; // Optimal humidity around 50%
        
        return Math.round((aqiScore + tempScore + humidityScore) / 3);
    }

    /**
     * Get sustainability score with breakdown
     */
    async getSustainabilityScore(period = 'today') {
        try {
            const metrics = await this.getGlobalMetrics();
            return {
                overall: metrics.sustainabilityScore || 67,
                breakdown: {
                    air_quality: Math.max(0, 100 - (metrics.aqi / 5)),
                    green_spaces: metrics.greenIndex || 60,
                    energy_efficiency: 82, // Mock data
                    carbon_footprint: Math.max(0, 100 - ((metrics.co2Levels - 300) / 2))
                },
                period,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting sustainability score:', error);
            return this.mockData.sustainabilityScore;
        }
    }

    /**
     * Calculate overall sustainability score
     */
    calculateSustainabilityScore(metrics) {
        const aqiScore = Math.max(0, 100 - (metrics.aqi / 5));
        const tempScore = Math.max(0, 100 - (metrics.temperature * 20));
        const co2Score = Math.max(0, 100 - ((metrics.co2Levels - 300) / 2));
        const greenScore = metrics.greenIndex;
        
        return Math.round((aqiScore + tempScore + co2Score + greenScore) / 4);
    }

    /**
     * Check API rate limits
     */
    checkRateLimit(api) {
        const limit = this.rateLimits[api];
        const now = Date.now();
        
        if (now > limit.resetTime) {
            // Reset counter
            limit.requests = 0;
            switch (api) {
                case 'nasa':
                    limit.resetTime = now + 3600000; // 1 hour
                    break;
                case 'openweather':
                    limit.resetTime = now + 60000; // 1 minute
                    break;
                case 'noaa':
                    limit.resetTime = now + 86400000; // 1 day
                    break;
            }
        }
        
        const maxRequests = {
            nasa: 1000,
            openweather: 60,
            noaa: 1000
        };
        
        if (limit.requests >= maxRequests[api]) {
            return false;
        }
        
        limit.requests++;
        return true;
    }

    /**
     * Make HTTP request with error handling
     */
    async makeRequest(url, api) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
        } catch (error) {
            if (!this.isOnline) {
                this.queueRequest(url, api);
            }
            throw error;
        }
    }

    /**
     * Queue request for offline processing
     */
    queueRequest(url, api) {
        this.requestQueue.push({
            url,
            api,
            timestamp: Date.now(),
            retries: 0
        });
    }

    /**
     * Process offline request queue
     */
    async processOfflineQueue() {
        if (this.requestQueue.length === 0) return;
        
        console.log(`Processing ${this.requestQueue.length} queued requests`);
        
        const processedRequests = [];
        
        for (const request of this.requestQueue) {
            try {
                if (this.checkRateLimit(request.api)) {
                    await this.makeRequest(request.url, request.api);
                    processedRequests.push(request);
                }
            } catch (error) {
                request.retries++;
                if (request.retries >= 3) {
                    processedRequests.push(request);
                    console.error(`Failed to process request after 3 retries:`, error);
                }
            }
        }
        
        // Remove processed requests
        this.requestQueue = this.requestQueue.filter(
            request => !processedRequests.includes(request)
        );
    }

    /**
     * Get cached data if still valid
     */
    async getCachedData(key, ttl) {
        try {
            const cached = await this.offlineStorage.get(key);
            if (cached && cached.timestamp && (Date.now() - cached.timestamp < ttl)) {
                return cached.data;
            }
            return null;
        } catch (error) {
            console.error('Error getting cached data:', error);
            return null;
        }
    }

    /**
     * Cache data with timestamp
     */
    async cacheData(key, data) {
        try {
            await this.offlineStorage.set(key, {
                data,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Error caching data:', error);
        }
    }

    /**
     * Clear expired cache entries
     */
    async clearExpiredCache() {
        try {
            for (const [configKey, config] of Object.entries(this.cacheConfig)) {
                const cached = await this.offlineStorage.get(config.key);
                if (cached && cached.timestamp && (Date.now() - cached.timestamp > config.ttl)) {
                    await this.offlineStorage.remove(config.key);
                    console.log(`Cleared expired cache: ${config.key}`);
                }
            }
        } catch (error) {
            console.error('Error clearing expired cache:', error);
        }
    }

    /**
     * Get satellite imagery data
     */
    async getSatelliteImagery(lat, lon, date = null) {
        if (!this.checkRateLimit('nasa')) {
            throw new Error('Rate limit exceeded for NASA API');
        }

        const dateStr = date || new Date().toISOString().split('T')[0];
        const url = `${this.apiConfig.nasa.baseUrl}${this.apiConfig.nasa.endpoints.imagery}?lon=${lon}&lat=${lat}&date=${dateStr}&dim=0.1&api_key=${this.apiConfig.nasa.apiKey}`;
        
        try {
            const response = await this.makeRequest(url, 'nasa');
            const data = await response.json();
            
            return {
                url: data.url,
                date: data.date,
                coordinates: { lat, lon },
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching satellite imagery:', error);
            throw error;
        }
    }

    /**
     * Initialize mock data for development and offline mode
     */
    initializeMockData() {
        return {
            globalMetrics: {
                aqi: 67,
                temperature: 1.2,
                co2Levels: 418,
                greenIndex: 73,
                sustainabilityScore: 67,
                lastUpdated: new Date().toISOString()
            },
            cities: [
                { name: 'Zúrich', country: 'Suiza', lat: 47.3769, lon: 8.5417, aqi: 35, temperature: 18, humidity: 65 },
                { name: 'Copenhague', country: 'Dinamarca', lat: 55.6761, lon: 12.5683, aqi: 42, temperature: 16, humidity: 70 },
                { name: 'Helsinki', country: 'Finlandia', lat: 60.1699, lon: 24.9384, aqi: 38, temperature: 14, humidity: 68 },
                { name: 'Estocolmo', country: 'Suecia', lat: 59.3293, lon: 18.0686, aqi: 41, temperature: 15, humidity: 72 },
                { name: 'Vancouver', country: 'Canadá', lat: 49.2827, lon: -123.1207, aqi: 45, temperature: 19, humidity: 75 },
                { name: 'Singapur', country: 'Singapur', lat: 1.3521, lon: 103.8198, aqi: 58, temperature: 28, humidity: 85 },
                { name: 'Viena', country: 'Austria', lat: 48.2082, lon: 16.3738, aqi: 47, temperature: 17, humidity: 64 },
                { name: 'Melbourne', country: 'Australia', lat: -37.8136, lon: 144.9631, aqi: 52, temperature: 21, humidity: 62 }
            ],
            topCities: [
                { rank: 1, name: 'Zúrich', country: 'Suiza', score: 92, trend: 2 },
                { rank: 2, name: 'Copenhague', country: 'Dinamarca', score: 89, trend: 1 },
                { rank: 3, name: 'Helsinki', country: 'Finlandia', score: 87, trend: 0 },
                { rank: 4, name: 'Estocolmo', country: 'Suecia', score: 85, trend: 3 },
                { rank: 5, name: 'Vancouver', country: 'Canadá', score: 84, trend: -1 }
            ],
            sustainabilityScore: {
                overall: 67,
                breakdown: {
                    air_quality: 75,
                    green_spaces: 60,
                    energy_efficiency: 82,
                    carbon_footprint: 35
                },
                period: 'today',
                lastUpdated: new Date().toISOString()
            }
        };
    }

    /**
     * Get real-time updates for dashboard
     */
    async getRealTimeUpdates() {
        try {
            const [metrics, cities] = await Promise.all([
                this.getGlobalMetrics(),
                this.getCitiesData()
            ]);

            return {
                globalMetrics: metrics,
                citiesData: cities.slice(0, 5), // Top 5 cities
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting real-time updates:', error);
            return {
                globalMetrics: this.mockData.globalMetrics,
                citiesData: this.mockData.cities.slice(0, 5),
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Search cities by name or country
     */
    async searchCities(query, limit = 10) {
        try {
            const cities = await this.getCitiesData();
            const searchResults = cities.filter(city => 
                city.name.toLowerCase().includes(query.toLowerCase()) ||
                city.country.toLowerCase().includes(query.toLowerCase())
            );

            return searchResults.slice(0, limit);
        } catch (error) {
            console.error('Error searching cities:', error);
            return [];
        }
    }

    /**
     * Get historical data for a specific metric
     */
    async getHistoricalData(metric, startDate, endDate) {
        try {
            // This would fetch historical data from APIs
            // For demo, we'll generate mock historical data
            const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
            const data = this.generateMetricData(metric, days);
            const labels = [];
            
            for (let i = 0; i < days; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                labels.push(date.toISOString().split('T')[0]);
            }

            return {
                labels,
                data,
                metric,
                startDate,
                endDate,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting historical data:', error);
            throw error;
        }
    }

    /**
     * Get cache statistics
     */
    async getCacheStats() {
        try {
            const stats = {
                totalSize: 0,
                itemCount: 0,
                items: {}
            };

            for (const config of Object.values(this.cacheConfig)) {
                const cached = await this.offlineStorage.get(config.key);
                if (cached) {
                    const size = JSON.stringify(cached).length;
                    stats.totalSize += size;
                    stats.itemCount++;
                    stats.items[config.key] = {
                        size,
                        timestamp: cached.timestamp,
                        age: Date.now() - cached.timestamp
                    };
                }
            }

            return stats;
        } catch (error) {
            console.error('Error getting cache stats:', error);
            return { totalSize: 0, itemCount: 0, items: {} };
        }
    }

    /**
     * Export data for external analysis
     */
    async exportData(format = 'json') {
        try {
            const [metrics, cities, chartData] = await Promise.all([
                this.getGlobalMetrics(),
                this.getCitiesData(),
                this.getChartData('co2', '30d')
            ]);

            const exportData = {
                globalMetrics: metrics,
                cities: cities,
                chartData: chartData,
                exportDate: new Date().toISOString(),
                format: format
            };

            if (format === 'csv') {
                return this.convertToCSV(exportData);
            }

            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    }

    /**
     * Convert data to CSV format
     */
    convertToCSV(data) {
        const csvLines = [];
        
        // Cities data
        csvLines.push('City,Country,AQI,Temperature,Humidity');
        data.cities.forEach(city => {
            csvLines.push(`${city.name},${city.country},${city.aqi},${city.temperature},${city.humidity}`);
        });
        
        return csvLines.join('\n');
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.requestQueue = [];
        console.log('DataManager destroyed');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}