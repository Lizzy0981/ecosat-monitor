/**
 * EcoSat Monitor - Enhanced Charts Controller with Satellite Data Focus
 * Manages advanced satellite data visualizations and real-time updates
 * Author: Elizabeth Díaz Familia
 * Version: 1.1.0 - Satellite Data Focus
 */

class ChartsController {
    constructor() {
        this.charts = new Map();
        this.isInitialized = false;
        this.updateInterval = null;
        this.animationConfig = {
            duration: 1000,
            easing: 'easeInOutCubic'
        };
        
        // Satellite-specific chart configurations
        this.satelliteChartConfigs = {
            ndvi: {
                label: 'NDVI Global',
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                yMin: 0,
                yMax: 1,
                unit: ''
            },
            temperature: {
                label: 'Temperatura Superficial (°C)',
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                yMin: -5,
                yMax: 50,
                unit: '°C'
            },
            deforestation: {
                label: 'Tasa Deforestación (%)',
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                yMin: -10,
                yMax: 2,
                unit: '%'
            },
            fires: {
                label: 'Focos de Calor',
                borderColor: 'rgb(220, 38, 38)',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                yMin: 0,
                yMax: 5000,
                unit: ''
            }
        };
        
        console.log('ChartsController initialized with satellite focus');
    }

    /**
     * Initialize the charts controller
     */
    init() {
        this.isInitialized = true;
        console.log('ChartsController ready for satellite data visualization');
    }

    /**
     * Initialize satellite trends chart
     */
    async initSatelliteTrendsChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas with ID ${canvasId} not found`);
            return;
        }

        const ctx = canvas.getContext('2d');
        
        try {
            // Get initial satellite trends data
            const trendsData = await this.generateSatelliteTrendsData('realtime');
            
            const config = {
                type: 'line',
                data: {
                    labels: trendsData.labels,
                    datasets: [
                        {
                            label: 'NDVI Global',
                            data: trendsData.ndvi,
                            borderColor: 'rgb(16, 185, 129)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            fill: true,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        },
                        {
                            label: 'Focos de Calor (x100)',
                            data: trendsData.fires.map(val => val / 100), // Scale down for visualization
                            borderColor: 'rgb(239, 68, 68)',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            tension: 0.4,
                            fill: false,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        },
                        {
                            label: 'Temperatura LST (°C)',
                            data: trendsData.temperature,
                            borderColor: 'rgb(245, 158, 11)',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            tension: 0.4,
                            fill: false,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Tendencias Satelitales en Tiempo Real',
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: 'white',
                            bodyColor: 'white',
                            borderColor: 'rgb(59, 130, 246)',
                            borderWidth: 1,
                            callbacks: {
                                afterTitle: function() {
                                    return 'Datos Satelitales';
                                },
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    
                                    // Format values based on dataset
                                    if (context.dataset.label.includes('NDVI')) {
                                        label += context.parsed.y.toFixed(3);
                                    } else if (context.dataset.label.includes('Focos')) {
                                        label += (context.parsed.y * 100).toLocaleString();
                                    } else if (context.dataset.label.includes('Temperatura')) {
                                        label += context.parsed.y.toFixed(1) + '°C';
                                    }
                                    
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Tiempo',
                                font: {
                                    weight: 'bold'
                                }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Valores Normalizados',
                                font: {
                                    weight: 'bold'
                                }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            },
                            min: -5,
                            max: 50
                        }
                    },
                    animation: this.animationConfig
                }
            };

            const chart = new Chart(ctx, config);
            this.charts.set(canvasId, chart);
            
            console.log(`Satellite trends chart initialized on ${canvasId}`);
            return chart;
            
        } catch (error) {
            console.error('Error initializing satellite trends chart:', error);
        }
    }

    /**
     * Initialize real-time chart (keeping for compatibility)
     */
    async initRealtimeChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas with ID ${canvasId} not found`);
            return;
        }

        const ctx = canvas.getContext('2d');
        
        try {
            // Get initial chart data
            const chartData = await this.generateRealtimeChartData('ndvi', '24h');
            
            const config = {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: chartData.datasets[0].label,
                        data: chartData.datasets[0].data,
                        borderColor: chartData.datasets[0].borderColor,
                        backgroundColor: chartData.datasets[0].backgroundColor,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3,
                        pointHoverRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: 'white',
                            bodyColor: 'white',
                            borderColor: 'rgb(59, 130, 246)',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        y: {
                            display: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        }
                    },
                    animation: this.animationConfig
                }
            };

            const chart = new Chart(ctx, config);
            this.charts.set(canvasId, chart);
            
            console.log(`Real-time chart initialized on ${canvasId}`);
            return chart;
            
        } catch (error) {
            console.error('Error initializing real-time chart:', error);
        }
    }

    /**
     * Update chart with new metric and timeframe
     */
    async updateChart(metric, timeframe) {
        try {
            const chartData = await this.generateRealtimeChartData(metric, timeframe);
            const chart = this.charts.get('realtime-chart');
            
            if (chart && chartData) {
                // Update chart data
                chart.data.labels = chartData.labels;
                chart.data.datasets[0] = {
                    ...chart.data.datasets[0],
                    label: chartData.datasets[0].label,
                    data: chartData.datasets[0].data,
                    borderColor: chartData.datasets[0].borderColor,
                    backgroundColor: chartData.datasets[0].backgroundColor
                };
                
                // Update y-axis scale based on metric
                const config = this.satelliteChartConfigs[metric];
                if (config) {
                    chart.options.scales.y.min = config.yMin;
                    chart.options.scales.y.max = config.yMax;
                }
                
                chart.update('active');
                
                // Update chart stats
                this.updateChartStats(chartData.datasets[0].data, metric);
            }
        } catch (error) {
            console.error('Error updating chart:', error);
        }
    }

    /**
     * Update satellite trends
     */
    async updateSatelliteTrends(trendsData) {
        const chart = this.charts.get('satellite-trends-chart');
        if (!chart || !trendsData) return;

        try {
            // Update NDVI data
            if (trendsData.ndvi) {
                chart.data.labels = trendsData.ndvi.labels;
                chart.data.datasets[0].data = trendsData.ndvi.data;
            }
            
            // Update fires data
            if (trendsData.fires) {
                chart.data.datasets[1].data = trendsData.fires.data.map(val => val / 100);
            }
            
            // Update temperature data
            if (trendsData.temperature) {
                chart.data.datasets[2].data = trendsData.temperature.data;
            }
            
            chart.update('active');
            console.log('Satellite trends updated successfully');
            
        } catch (error) {
            console.error('Error updating satellite trends:', error);
        }
    }

    /**
     * Update real-time data for all charts
     */
    async updateRealtimeData() {
        try {
            // Update satellite trends chart
            const trendsChart = this.charts.get('satellite-trends-chart');
            if (trendsChart) {
                const trendsData = await this.generateSatelliteTrendsData('realtime');
                await this.updateSatelliteTrends(trendsData);
            }
            
            // Update real-time chart if exists
            const realtimeChart = this.charts.get('realtime-chart');
            if (realtimeChart) {
                // Get current metric and timeframe from UI or state
                const currentMetric = this.getCurrentMetric();
                const currentTimeframe = this.getCurrentTimeframe();
                await this.updateChart(currentMetric, currentTimeframe);
            }
            
            console.log('Real-time data updated for all charts');
            
        } catch (error) {
            console.error('Error updating real-time data:', error);
        }
    }

    /**
     * Generate satellite trends data for visualization
     */
    async generateSatelliteTrendsData(period) {
        try {
            const dataPoints = this.getDataPointsCount(period);
            const labels = this.generateTimeLabels(period, dataPoints);
            
            // Generate NDVI data
            const ndviData = this.generateMetricData('ndvi', dataPoints);
            
            // Generate fire hotspots data
            const firesData = this.generateMetricData('fires', dataPoints);
            
            // Generate temperature data
            const temperatureData = this.generateMetricData('temperature', dataPoints);
            
            return {
                labels,
                ndvi: {
                    data: ndviData,
                    labels: labels,
                    metric: 'ndvi'
                },
                fires: {
                    data: firesData,
                    labels: labels,
                    metric: 'fires'
                },
                temperature: {
                    data: temperatureData,
                    labels: labels,
                    metric: 'temperature'
                },
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error generating satellite trends data:', error);
            return null;
        }
    }

    /**
     * Generate real-time chart data for specific metric
     */
    async generateRealtimeChartData(metric, timeframe) {
        try {
            const dataPoints = this.getDataPointsCount(timeframe);
            const labels = this.generateTimeLabels(timeframe, dataPoints);
            const data = this.generateMetricData(metric, dataPoints);
            const config = this.satelliteChartConfigs[metric] || this.satelliteChartConfigs.ndvi;

            return {
                labels,
                datasets: [{
                    label: config.label,
                    data,
                    borderColor: config.borderColor,
                    backgroundColor: config.backgroundColor,
                    tension: 0.4,
                    fill: true
                }],
                metric,
                timeframe,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error generating real-time chart data:', error);
            return null;
        }
    }

    /**
     * Get number of data points for timeframe
     */
    getDataPointsCount(timeframe) {
        switch (timeframe) {
            case '24h':
            case 'realtime': return 24;
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
                case 'realtime':
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
     * Generate realistic satellite metric data
     */
    generateMetricData(metric, count) {
        const data = [];
        let baseValue, variance, trend;

        switch (metric) {
            case 'ndvi':
                baseValue = 0.73;
                variance = 0.05;
                trend = 0.001;
                break;
            case 'temperature':
                baseValue = 25.2;
                variance = 3.5;
                trend = 0.02;
                break;
            case 'deforestation':
                baseValue = -2.4;
                variance = 0.8;
                trend = -0.01;
                break;
            case 'fires':
                baseValue = 1200;
                variance = 300;
                trend = -2;
                break;
            default:
                baseValue = 50;
                variance = 10;
                trend = 0;
        }

        // Add seasonal variation for some metrics
        const currentMonth = new Date().getMonth();
        let seasonalFactor = 1;
        
        if (metric === 'fires') {
            // Fire season peaks in certain months
            seasonalFactor = (currentMonth >= 6 && currentMonth <= 9) ? 1.5 : 0.8;
        } else if (metric === 'ndvi') {
            // Vegetation peaks in growing season
            seasonalFactor = (currentMonth >= 4 && currentMonth <= 8) ? 1.1 : 0.9;
        }

        for (let i = 0; i < count; i++) {
            const noise = (Math.random() - 0.5) * variance * 2;
            const trendValue = (baseValue * seasonalFactor) + (trend * i) + noise;
            
            let finalValue;
            switch (metric) {
                case 'ndvi':
                    finalValue = Math.max(0, Math.min(1, trendValue));
                    data.push(Number(finalValue.toFixed(3)));
                    break;
                case 'fires':
                    finalValue = Math.max(0, Math.floor(trendValue));
                    data.push(finalValue);
                    break;
                case 'temperature':
                    data.push(Number(trendValue.toFixed(1)));
                    break;
                default:
                    data.push(Number(trendValue.toFixed(2)));
            }
        }

        return data;
    }

    /**
     * Update chart statistics display
     */
    updateChartStats(data, metric) {
        if (!data || data.length === 0) return;

        const current = data[data.length - 1];
        const previous = data[data.length - 2] || current;
        const average = data.reduce((sum, val) => sum + val, 0) / data.length;
        const trend = ((current - previous) / previous) * 100;

        // Format values based on metric
        let currentFormatted, averageFormatted;
        const config = this.satelliteChartConfigs[metric];
        
        if (config) {
            switch (metric) {
                case 'ndvi':
                    currentFormatted = current.toFixed(3);
                    averageFormatted = average.toFixed(3);
                    break;
                case 'fires':
                    currentFormatted = current.toLocaleString();
                    averageFormatted = Math.floor(average).toLocaleString();
                    break;
                case 'temperature':
                    currentFormatted = current.toFixed(1) + '°C';
                    averageFormatted = average.toFixed(1) + '°C';
                    break;
                default:
                    currentFormatted = current.toFixed(2) + (config.unit || '');
                    averageFormatted = average.toFixed(2) + (config.unit || '');
            }
        } else {
            currentFormatted = current.toString();
            averageFormatted = average.toFixed(2);
        }

        // Update UI elements
        this.updateElement('current-value', currentFormatted);
        this.updateElement('average-value', averageFormatted);
        
        const trendElement = document.getElementById('trend-value');
        if (trendElement) {
            trendElement.textContent = `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`;
            trendElement.className = `stat-value trend-${trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable'}`;
        }
    }

    /**
     * Get current metric from UI
     */
    getCurrentMetric() {
        const select = document.getElementById('chart-metric');
        return select ? select.value : 'ndvi';
    }

    /**
     * Get current timeframe from UI
     */
    getCurrentTimeframe() {
        const select = document.getElementById('chart-timeframe');
        return select ? select.value : '24h';
    }

    /**
     * Create comparative chart for multiple satellites
     */
    async createComparativeChart(canvasId, satellites, metric) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const colors = [
            'rgb(59, 130, 246)',   // Blue
            'rgb(16, 185, 129)',   // Green
            'rgb(245, 158, 11)',   // Orange
            'rgb(239, 68, 68)',    // Red
            'rgb(124, 58, 237)'    // Purple
        ];

        try {
            const datasets = satellites.map((satellite, index) => {
                const data = this.generateMetricData(metric, 24);
                return {
                    label: satellite.name,
                    data: data,
                    borderColor: colors[index % colors.length],
                    backgroundColor: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.1)'),
                    tension: 0.4,
                    fill: false,
                    pointRadius: 3,
                    pointHoverRadius: 5
                };
            });

            const labels = this.generateTimeLabels('24h', 24);

            const config = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: `Comparación ${this.satelliteChartConfigs[metric]?.label || metric} - Múltiples Satélites`,
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Tiempo (Horas)'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: this.satelliteChartConfigs[metric]?.label || metric
                            }
                        }
                    },
                    animation: this.animationConfig
                }
            };

            const chart = new Chart(ctx, config);
            this.charts.set(canvasId, chart);
            
            return chart;
        } catch (error) {
            console.error('Error creating comparative chart:', error);
        }
    }

    /**
     * Create heatmap visualization for satellite coverage
     */
    async createCoverageHeatmap(canvasId, coverageData) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        // This would create a heatmap showing satellite coverage
        // For now, we'll create a placeholder that could be enhanced
        console.log('Coverage heatmap would be created here');
        console.log('Coverage data:', coverageData);
    }

    /**
     * Export chart as image
     */
    exportChart(canvasId, filename = 'satellite-chart') {
        const chart = this.charts.get(canvasId);
        if (!chart) {
            console.warn(`Chart ${canvasId} not found`);
            return;
        }

        try {
            const canvas = chart.canvas;
            const url = canvas.toDataURL('image/png');
            
            const link = document.createElement('a');
            link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.png`;
            link.href = url;
            link.click();
            
            console.log(`Chart exported as ${link.download}`);
        } catch (error) {
            console.error('Error exporting chart:', error);
        }
    }

    /**
     * Update element content safely
     */
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    /**
     * Resize all charts
     */
    resizeCharts() {
        this.charts.forEach((chart) => {
            chart.resize();
        });
    }

    /**
     * Update chart theme (dark/light mode)
     */
    updateTheme(isDark) {
        const textColor = isDark ? '#F9FAFB' : '#1F2937';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        this.charts.forEach((chart) => {
            // Update text colors
            chart.options.plugins.title.color = textColor;
            chart.options.plugins.legend.labels.color = textColor;
            chart.options.scales.x.title.color = textColor;
            chart.options.scales.y.title.color = textColor;
            chart.options.scales.x.ticks.color = textColor;
            chart.options.scales.y.ticks.color = textColor;
            
            // Update grid colors
            chart.options.scales.x.grid.color = gridColor;
            chart.options.scales.y.grid.color = gridColor;
            
            chart.update('none');
        });
    }

    /**
     * Start auto-refresh for charts
     */
    startAutoRefresh(intervalMinutes = 5) {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(() => {
            this.updateRealtimeData();
        }, intervalMinutes * 60 * 1000);

        console.log(`Chart auto-refresh started: ${intervalMinutes} minutes`);
    }

    /**
     * Stop auto-refresh
     */
    stopAutoRefresh() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('Chart auto-refresh stopped');
        }
    }

    /**
     * Get chart statistics
     */
    getChartStats() {
        return {
            totalCharts: this.charts.size,
            chartIds: Array.from(this.charts.keys()),
            isAutoRefreshing: !!this.updateInterval,
            lastUpdate: new Date().toISOString()
        };
    }

    /**
     * Destroy specific chart
     */
    destroyChart(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.destroy();
            this.charts.delete(canvasId);
            console.log(`Chart ${canvasId} destroyed`);
        }
    }

    /**
     * Cleanup and destroy all charts
     */
    destroy() {
        // Stop auto-refresh
        this.stopAutoRefresh();
        
        // Destroy all charts
        this.charts.forEach((chart, id) => {
            chart.destroy();
        });
        
        // Clear charts map
        this.charts.clear();
        
        // Reset state
        this.isInitialized = false;
        
        console.log('ChartsController destroyed - all charts cleaned up');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartsController;
}