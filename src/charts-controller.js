/**
 * EcoSat Monitor - Advanced Charts Controller
 * Handles all data visualizations with Chart.js and custom graphics
 * Author: Elizabeth Díaz Familia
 * Version: 1.0.0
 */

class ChartsController {
    constructor() {
        this.charts = new Map();
        this.animations = new Map();
        this.updateIntervals = new Map();
        this.chartDefaults = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            family: 'system-ui, -apple-system, sans-serif',
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#4ade80',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    intersect: false,
                    mode: 'index'
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(156, 163, 175, 0.2)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(156, 163, 175, 0.2)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 11
                        }
                    }
                }
            },
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            }
        };

        this.colorPalettes = {
            primary: ['#3b82f6', '#1d4ed8', '#1e3a8a', '#312e81'],
            success: ['#22c55e', '#16a34a', '#15803d', '#166534'],
            warning: ['#f59e0b', '#d97706', '#b45309', '#92400e'],
            error: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b'],
            neutral: ['#6b7280', '#4b5563', '#374151', '#1f2937'],
            environmental: ['#10b981', '#059669', '#047857', '#065f46'],
            temperature: ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'],
            pollution: ['#ef4444', '#f97316', '#eab308', '#84cc16']
        };

        this.chartTypes = {
            realtime: 'line',
            comparison: 'bar',
            distribution: 'doughnut',
            trend: 'line',
            heatmap: 'scatter'
        };
    }

    /**
     * Initialize the charts controller
     */
    init() {
        this.setupChartDefaults();
        this.registerCustomPlugins();
        console.log('ChartsController initialized');
    }

    /**
     * Setup Chart.js default configurations
     */
    setupChartDefaults() {
        if (typeof Chart !== 'undefined') {
            Chart.defaults.font.family = 'system-ui, -apple-system, sans-serif';
            Chart.defaults.color = '#6b7280';
            Chart.defaults.borderColor = 'rgba(156, 163, 175, 0.2)';
        }
    }

    /**
     * Register custom Chart.js plugins
     */
    registerCustomPlugins() {
        if (typeof Chart !== 'undefined') {
            // Real-time data plugin
            Chart.register({
                id: 'realTimeData',
                beforeUpdate: (chart) => {
                    if (chart.config.options.realTime && chart.config.options.realTime.enabled) {
                        this.updateRealTimeData(chart);
                    }
                }
            });

            // Gradient plugin
            Chart.register({
                id: 'gradientBackground',
                beforeDraw: (chart) => {
                    if (chart.config.options.gradient && chart.config.options.gradient.enabled) {
                        this.applyGradientBackground(chart);
                    }
                }
            });
        }
    }

    /**
     * Initialize real-time chart
     */
    async initRealtimeChart(canvasId, metric = 'co2', timeframe = '24h') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas element ${canvasId} not found`);
            return null;
        }

        try {
            // Get chart data
            const chartData = await this.getChartData(metric, timeframe);
            
            // Create chart configuration
            const config = this.createRealtimeChartConfig(chartData, metric);
            
            // Destroy existing chart if it exists
            if (this.charts.has(canvasId)) {
                this.charts.get(canvasId).destroy();
            }

            // Create new chart
            const chart = new Chart(canvas.getContext('2d'), config);
            this.charts.set(canvasId, chart);

            // Start real-time updates
            this.startRealTimeUpdates(canvasId, metric, timeframe);

            return chart;
        } catch (error) {
            console.error('Error initializing realtime chart:', error);
            return null;
        }
    }

    /**
     * Create real-time chart configuration
     */
    createRealtimeChartConfig(data, metric) {
        const colors = this.getMetricColors(metric);
        
        return {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: data.datasets[0].label,
                    data: data.datasets[0].data,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: colors.border,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                ...this.chartDefaults,
                realTime: {
                    enabled: true,
                    interval: 300000 // 5 minutes
                },
                gradient: {
                    enabled: true,
                    colors: colors.gradient
                },
                scales: {
                    ...this.chartDefaults.scales,
                    y: {
                        ...this.chartDefaults.scales.y,
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: this.getMetricUnit(metric),
                            color: '#6b7280',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    }
                },
                plugins: {
                    ...this.chartDefaults.plugins,
                    tooltip: {
                        ...this.chartDefaults.plugins.tooltip,
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed.y;
                                const unit = this.getMetricUnit(metric);
                                return `${context.dataset.label}: ${value} ${unit}`;
                            },
                            afterLabel: (context) => {
                                return this.getMetricInterpretation(metric, context.parsed.y);
                            }
                        }
                    }
                }
            }
        };
    }

    /**
     * Get colors for specific metrics
     */
    getMetricColors(metric) {
        const colorMaps = {
            co2: {
                border: '#ef4444',
                background: 'rgba(239, 68, 68, 0.1)',
                gradient: ['rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.1)']
            },
            aqi: {
                border: '#3b82f6',
                background: 'rgba(59, 130, 246, 0.1)',
                gradient: ['rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.1)']
            },
            temperature: {
                border: '#f59e0b',
                background: 'rgba(245, 158, 11, 0.1)',
                gradient: ['rgba(245, 158, 11, 0.8)', 'rgba(245, 158, 11, 0.1)']
            },
            humidity: {
                border: '#22c55e',
                background: 'rgba(34, 197, 94, 0.1)',
                gradient: ['rgba(34, 197, 94, 0.8)', 'rgba(34, 197, 94, 0.1)']
            }
        };

        return colorMaps[metric] || colorMaps.aqi;
    }

    /**
     * Get metric units
     */
    getMetricUnit(metric) {
        const units = {
            co2: 'ppm',
            aqi: 'AQI',
            temperature: '°C',
            humidity: '%'
        };
        return units[metric] || '';
    }

    /**
     * Get metric interpretation
     */
    getMetricInterpretation(metric, value) {
        const interpretations = {
            co2: value > 400 ? 'Elevado' : value > 350 ? 'Normal' : 'Bajo',
            aqi: value > 150 ? 'No saludable' : value > 100 ? 'Moderado' : value > 50 ? 'Aceptable' : 'Bueno',
            temperature: value > 2 ? 'Muy alto' : value > 1 ? 'Alto' : value > 0 ? 'Elevado' : 'Normal',
            humidity: value > 70 ? 'Alto' : value > 30 ? 'Normal' : 'Bajo'
        };
        return interpretations[metric] || '';
    }

    /**
     * Start real-time updates for chart
     */
    startRealTimeUpdates(chartId, metric, timeframe) {
        // Clear existing interval
        if (this.updateIntervals.has(chartId)) {
            clearInterval(this.updateIntervals.get(chartId));
        }

        // Start new interval
        const interval = setInterval(async () => {
            try {
                await this.updateChart(metric, timeframe, chartId);
            } catch (error) {
                console.error('Error updating chart:', error);
            }
        }, 300000); // 5 minutes

        this.updateIntervals.set(chartId, interval);
    }

    /**
     * Update chart with new data
     */
    async updateChart(metric, timeframe, chartId = 'realtime-chart') {
        const chart = this.charts.get(chartId);
        if (!chart) return;

        try {
            const newData = await this.getChartData(metric, timeframe);
            
            // Update chart data with animation
            chart.data.labels = newData.labels;
            chart.data.datasets[0].data = newData.datasets[0].data;
            chart.data.datasets[0].label = newData.datasets[0].label;

            // Update colors if metric changed
            const colors = this.getMetricColors(metric);
            chart.data.datasets[0].borderColor = colors.border;
            chart.data.datasets[0].backgroundColor = colors.background;

            // Update Y-axis label
            chart.options.scales.y.title.text = this.getMetricUnit(metric);

            // Animate the update
            chart.update('active');

            // Update current stats
            this.updateChartStats(newData, metric);

        } catch (error) {
            console.error('Error updating chart data:', error);
        }
    }

    /**
     * Update chart statistics display
     */
    updateChartStats(data, metric) {
        const values = data.datasets[0].data;
        const current = values[values.length - 1];
        const previous = values[values.length - 2];
        const average = values.reduce((sum, val) => sum + val, 0) / values.length;
        const trend = previous ? ((current - previous) / previous * 100) : 0;

        // Update DOM elements
        this.updateElement('current-value', `${current} ${this.getMetricUnit(metric)}`);
        this.updateElement('average-value', `${average.toFixed(1)} ${this.getMetricUnit(metric)}`);
        
        const trendElement = document.getElementById('trend-value');
        if (trendElement) {
            trendElement.textContent = `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`;
            trendElement.className = `stat-value ${trend > 0 ? 'trend-up' : trend < 0 ? 'trend-down' : ''}`;
        }
    }

    /**
     * Create comparison chart
     */
    async createComparisonChart(canvasId, cities, metric) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        try {
            const labels = cities.map(city => city.name);
            const values = cities.map(city => city[metric] || 0);
            const colors = this.generateColorArray(values, metric);

            const config = {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: this.getMetricLabel(metric),
                        data: values,
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                    }]
                },
                options: {
                    ...this.chartDefaults,
                    indexAxis: 'y',
                    scales: {
                        x: {
                            ...this.chartDefaults.scales.x,
                            title: {
                                display: true,
                                text: this.getMetricUnit(metric)
                            }
                        },
                        y: {
                            ...this.chartDefaults.scales.y,
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            };

            if (this.charts.has(canvasId)) {
                this.charts.get(canvasId).destroy();
            }

            const chart = new Chart(canvas.getContext('2d'), config);
            this.charts.set(canvasId, chart);
            return chart;

        } catch (error) {
            console.error('Error creating comparison chart:', error);
            return null;
        }
    }

    /**
     * Create distribution chart (doughnut)
     */
    createDistributionChart(canvasId, data, title = 'Distribution') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        try {
            const config = {
                type: 'doughnut',
                data: {
                    labels: data.labels,
                    datasets: [{
                        data: data.values,
                        backgroundColor: this.colorPalettes.environmental,
                        borderColor: '#ffffff',
                        borderWidth: 2,
                        hoverOffset: 10
                    }]
                },
                options: {
                    ...this.chartDefaults,
                    cutout: '60%',
                    plugins: {
                        ...this.chartDefaults.plugins,
                        legend: {
                            ...this.chartDefaults.plugins.legend,
                            position: 'right'
                        },
                        tooltip: {
                            ...this.chartDefaults.plugins.tooltip,
                            callbacks: {
                                label: (context) => {
                                    const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                                    return `${context.label}: ${percentage}%`;
                                }
                            }
                        }
                    }
                }
            };

            if (this.charts.has(canvasId)) {
                this.charts.get(canvasId).destroy();
            }

            const chart = new Chart(canvas.getContext('2d'), config);
            this.charts.set(canvasId, chart);
            return chart;

        } catch (error) {
            console.error('Error creating distribution chart:', error);
            return null;
        }
    }

    /**
     * Create sustainability radar chart
     */
    createSustainabilityRadar(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        try {
            const config = {
                type: 'radar',
                data: {
                    labels: [
                        'Calidad del Aire',
                        'Espacios Verdes',
                        'Eficiencia Energética',
                        'Gestión de Residuos',
                        'Transporte Limpio',
                        'Recursos Hídricos'
                    ],
                    datasets: [{
                        label: 'Puntuación Actual',
                        data: data.current || [75, 60, 82, 70, 65, 80],
                        backgroundColor: 'rgba(34, 197, 94, 0.2)',
                        borderColor: '#22c55e',
                        borderWidth: 2,
                        pointBackgroundColor: '#22c55e',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2
                    }, {
                        label: 'Objetivo',
                        data: data.target || [90, 85, 90, 85, 80, 90],
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    ...this.chartDefaults,
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 20,
                                color: '#6b7280'
                            },
                            grid: {
                                color: 'rgba(156, 163, 175, 0.3)'
                            },
                            angleLines: {
                                color: 'rgba(156, 163, 175, 0.3)'
                            },
                            pointLabels: {
                                color: '#374151',
                                font: {
                                    size: 11,
                                    weight: 'bold'
                                }
                            }
                        }
                    }
                }
            };

            if (this.charts.has(canvasId)) {
                this.charts.get(canvasId).destroy();
            }

            const chart = new Chart(canvas.getContext('2d'), config);
            this.charts.set(canvasId, chart);
            return chart;

        } catch (error) {
            console.error('Error creating radar chart:', error);
            return null;
        }
    }

    /**
     * Create heatmap visualization
     */
    createHeatmap(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        try {
            // Transform data for scatter plot heatmap
            const scatterData = [];
            data.forEach((row, y) => {
                row.forEach((value, x) => {
                    scatterData.push({
                        x: x,
                        y: y,
                        v: value
                    });
                });
            });

            const config = {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Heatmap',
                        data: scatterData,
                        backgroundColor: (context) => {
                            const value = context.parsed.v;
                            const intensity = value / 100; // Normalize to 0-1
                            return `rgba(239, 68, 68, ${intensity})`;
                        },
                        pointRadius: 15,
                        pointHoverRadius: 18
                    }]
                },
                options: {
                    ...this.chartDefaults,
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom',
                            title: {
                                display: true,
                                text: 'Longitude'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Latitude'
                            }
                        }
                    },
                    plugins: {
                        ...this.chartDefaults.plugins,
                        legend: {
                            display: false
                        },
                        tooltip: {
                            ...this.chartDefaults.plugins.tooltip,
                            callbacks: {
                                label: (context) => {
                                    return `Intensidad: ${context.parsed.v}`;
                                }
                            }
                        }
                    }
                }
            };

            if (this.charts.has(canvasId)) {
                this.charts.get(canvasId).destroy();
            }

            const chart = new Chart(canvas.getContext('2d'), config);
            this.charts.set(canvasId, chart);
            return chart;

        } catch (error) {
            console.error('Error creating heatmap:', error);
            return null;
        }
    }

    /**
     * Apply gradient background to chart
     */
    applyGradientBackground(chart) {
        const ctx = chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
        
        const colors = chart.config.options.gradient.colors || ['rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.1)'];
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        
        chart.data.datasets[0].backgroundColor = gradient;
    }

    /**
     * Update real-time data
     */
    updateRealTimeData(chart) {
        const dataset = chart.data.datasets[0];
        const dataLength = dataset.data.length;
        
        // Add new data point
        const lastValue = dataset.data[dataLength - 1];
        const newValue = lastValue + (Math.random() - 0.5) * 10;
        dataset.data.push(newValue);
        
        // Add new label
        const now = new Date();
        chart.data.labels.push(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
        
        // Remove old data if too many points
        if (dataset.data.length > 50) {
            dataset.data.shift();
            chart.data.labels.shift();
        }
    }

    /**
     * Generate color array for values
     */
    generateColorArray(values, metric) {
        const colors = this.getMetricColors(metric);
        const background = [];
        const border = [];
        
        values.forEach(value => {
            // Vary opacity based on value
            const intensity = Math.min(1, Math.max(0.3, value / 100));
            background.push(colors.background.replace(/[\d.]+\)$/g, `${intensity})`));
            border.push(colors.border);
        });
        
        return { background, border };
    }

    /**
     * Get metric label
     */
    getMetricLabel(metric) {
        const labels = {
            co2: 'Niveles de CO₂',
            aqi: 'Índice de Calidad del Aire',
            temperature: 'Temperatura',
            humidity: 'Humedad',
            score: 'Puntuación de Sostenibilidad'
        };
        return labels[metric] || metric;
    }

    /**
     * Get chart data from data manager
     */
    async getChartData(metric, timeframe) {
        try {
            // This would typically call the data manager
            // For now, we'll generate mock data
            return this.generateMockChartData(metric, timeframe);
        } catch (error) {
            console.error('Error getting chart data:', error);
            return this.generateMockChartData(metric, timeframe);
        }
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
                data
            }]
        };
    }

    /**
     * Get data points count for timeframe
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
     * Generate time labels
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
     * Update real-time data for existing chart
     */
    async updateRealtimeData() {
        this.charts.forEach((chart, chartId) => {
            if (chart.config.options.realTime && chart.config.options.realTime.enabled) {
                this.updateRealTimeData(chart);
                chart.update('none');
            }
        });
    }

    /**
     * Export chart as image
     */
    exportChart(chartId, format = 'png') {
        const chart = this.charts.get(chartId);
        if (!chart) return null;

        try {
            const url = chart.toBase64Image(format, 1.0);
            return url;
        } catch (error) {
            console.error('Error exporting chart:', error);
            return null;
        }
    }

    /**
     * Resize all charts
     */
    resizeCharts() {
        this.charts.forEach(chart => {
            chart.resize();
        });
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
     * Destroy specific chart
     */
    destroyChart(chartId) {
        const chart = this.charts.get(chartId);
        if (chart) {
            chart.destroy();
            this.charts.delete(chartId);
        }

        const interval = this.updateIntervals.get(chartId);
        if (interval) {
            clearInterval(interval);
            this.updateIntervals.delete(chartId);
        }
    }

    /**
     * Destroy all charts and cleanup
     */
    destroy() {
        this.charts.forEach((chart, chartId) => {
            this.destroyChart(chartId);
        });
        
        this.charts.clear();
        this.updateIntervals.clear();
        this.animations.clear();
        
        console.log('ChartsController destroyed');
    }

    /**
     * Theme handling methods
     */
    updateChartsTheme(isDark) {
        const textColor = isDark ? '#e5e7eb' : '#374151';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        this.charts.forEach(chart => {
            // Update text colors
            if (chart.options.scales) {
                Object.keys(chart.options.scales).forEach(scaleKey => {
                    const scale = chart.options.scales[scaleKey];
                    if (scale.ticks) scale.ticks.color = textColor;
                    if (scale.grid) scale.grid.color = gridColor;
                    if (scale.title) scale.title.color = textColor;
                });
            }

            // Update legend colors
            if (chart.options.plugins && chart.options.plugins.legend) {
                chart.options.plugins.legend.labels.color = textColor;
            }

            // Update tooltip colors
            if (chart.options.plugins && chart.options.plugins.tooltip) {
                chart.options.plugins.tooltip.titleColor = isDark ? '#ffffff' : '#000000';
                chart.options.plugins.tooltip.bodyColor = isDark ? '#ffffff' : '#000000';
            }

            chart.update('none');
        });
    }

    /**
     * Language support methods
     */
    updateChartsLanguage(language) {
        const translations = {
            es: {
                'Calidad del Aire': 'Calidad del Aire',
                'Espacios Verdes': 'Espacios Verdes',
                'Eficiencia Energética': 'Eficiencia Energética',
                'Gestión de Residuos': 'Gestión de Residuos',
                'Transporte Limpio': 'Transporte Limpio',
                'Recursos Hídricos': 'Recursos Hídricos',
                'Puntuación Actual': 'Puntuación Actual',
                'Objetivo': 'Objetivo'
            },
            en: {
                'Calidad del Aire': 'Air Quality',
                'Espacios Verdes': 'Green Spaces',
                'Eficiencia Energética': 'Energy Efficiency',
                'Gestión de Residuos': 'Waste Management',
                'Transporte Limpio': 'Clean Transport',
                'Recursos Hídricos': 'Water Resources',
                'Puntuación Actual': 'Current Score',
                'Objetivo': 'Target'
            }
        };

        const labels = translations[language] || translations.es;

        this.charts.forEach(chart => {
            // Update radar chart labels
            if (chart.config.type === 'radar' && chart.data.labels) {
                chart.data.labels = chart.data.labels.map(label => labels[label] || label);
            }

            // Update dataset labels
            if (chart.data.datasets) {
                chart.data.datasets.forEach(dataset => {
                    if (labels[dataset.label]) {
                        dataset.label = labels[dataset.label];
                    }
                });
            }

            chart.update('none');
        });
    }

    /**
     * Animation control methods
     */
    pauseAnimations() {
        this.charts.forEach(chart => {
            chart.options.animation.duration = 0;
            chart.update('none');
        });
    }

    resumeAnimations() {
        this.charts.forEach(chart => {
            chart.options.animation.duration = 750;
        });
    }

    /**
     * Data export methods
     */
    exportChartData(chartId) {
        const chart = this.charts.get(chartId);
        if (!chart) return null;

        return {
            labels: chart.data.labels,
            datasets: chart.data.datasets.map(dataset => ({
                label: dataset.label,
                data: dataset.data
            }))
        };
    }

    exportAllChartsData() {
        const allData = {};
        this.charts.forEach((chart, chartId) => {
            allData[chartId] = this.exportChartData(chartId);
        });
        return allData;
    }

    /**
     * Performance monitoring
     */
    getPerformanceStats() {
        return {
            activeCharts: this.charts.size,
            activeIntervals: this.updateIntervals.size,
            memoryUsage: this.estimateMemoryUsage()
        };
    }

    estimateMemoryUsage() {
        let totalDataPoints = 0;
        this.charts.forEach(chart => {
            chart.data.datasets.forEach(dataset => {
                totalDataPoints += dataset.data.length;
            });
        });
        return `~${(totalDataPoints * 8 / 1024).toFixed(2)} KB`; // Rough estimate
    }

    /**
     * Chart accessibility methods
     */
    enableAccessibility() {
        this.charts.forEach(chart => {
            const canvas = chart.canvas;
            canvas.setAttribute('role', 'img');
            canvas.setAttribute('aria-label', this.generateChartDescription(chart));
        });
    }

    generateChartDescription(chart) {
        const type = chart.config.type;
        const datasetCount = chart.data.datasets.length;
        const dataPointCount = chart.data.labels ? chart.data.labels.length : 0;
        
        return `${type} chart with ${datasetCount} dataset(s) and ${dataPointCount} data points`;
    }

    /**
     * Debug and development methods
     */
    debugChart(chartId) {
        const chart = this.charts.get(chartId);
        if (!chart) {
            console.log(`Chart ${chartId} not found`);
            return;
        }

        console.log(`Chart Debug Info for ${chartId}:`, {
            type: chart.config.type,
            datasets: chart.data.datasets.length,
            dataPoints: chart.data.labels ? chart.data.labels.length : 0,
            options: chart.options,
            plugins: chart.config.plugins
        });
    }

    listAllCharts() {
        console.log('Active Charts:');
        this.charts.forEach((chart, chartId) => {
            console.log(`- ${chartId}: ${chart.config.type} chart`);
        });
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartsController;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ChartsController = ChartsController;
}