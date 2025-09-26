/**
 * EcoSat Monitor - Gamification System
 * Manages achievements, points, levels, and user engagement
 * Author: Elizabeth Díaz Familia
 * Version: 1.0.0
 */

class GamificationSystem {
    constructor() {
        this.userStats = {
            points: 0,
            level: 1,
            streak: 0,
            achievements: [],
            badges: [],
            totalGames: 0,
            citiesExplored: 0,
            dataPointsViewed: 0,
            lastActivity: null
        };

        this.achievements = this.initializeAchievements();
        this.levels = this.initializeLevels();
        this.pointsConfig = this.initializePointsConfig();
        this.streakConfig = this.initializeStreakConfig();
        
        this.eventListeners = [];
        this.isInitialized = false;
    }

    /**
     * Initialize the gamification system
     */
    init(initialStats = {}) {
        try {
            this.loadUserStats(initialStats);
            this.setupEventListeners();
            this.checkDailyStreak();
            this.updateUI();
            this.isInitialized = true;
            console.log('GamificationSystem initialized');
        } catch (error) {
            console.error('Error initializing GamificationSystem:', error);
        }
    }

    /**
     * Initialize achievements database
     */
    initializeAchievements() {
        return [
            // Explorer Achievements
            {
                id: 'first_steps',
                name: { es: 'Primeros Pasos', en: 'First Steps' },
                description: { es: 'Abrió la aplicación por primera vez', en: 'Opened the app for the first time' },
                icon: 'fas fa-seedling',
                rarity: 'common',
                points: 10,
                condition: () => true // Auto-awarded on first use
            },
            {
                id: 'city_explorer',
                name: { es: 'Explorador Urbano', en: 'City Explorer' },
                description: { es: 'Exploró 10 ciudades diferentes', en: 'Explored 10 different cities' },
                icon: 'fas fa-city',
                rarity: 'common',
                points: 50,
                condition: (stats) => stats.citiesExplored >= 10
            },
            {
                id: 'globe_trotter',
                name: { es: 'Trotamundos', en: 'Globe Trotter' },
                description: { es: 'Exploró 50 ciudades diferentes', en: 'Explored 50 different cities' },
                icon: 'fas fa-globe',
                rarity: 'rare',
                points: 200,
                condition: (stats) => stats.citiesExplored >= 50
            },

            // Data Achievements
            {
                id: 'data_curious',
                name: { es: 'Curioso de Datos', en: 'Data Curious' },
                description: { es: 'Visualizó 100 puntos de datos', en: 'Viewed 100 data points' },
                icon: 'fas fa-chart-line',
                rarity: 'common',
                points: 30,
                condition: (stats) => stats.dataPointsViewed >= 100
            },
            {
                id: 'data_analyst',
                name: { es: 'Analista de Datos', en: 'Data Analyst' },
                description: { es: 'Visualizó 1000 puntos de datos', en: 'Viewed 1000 data points' },
                icon: 'fas fa-chart-bar',
                rarity: 'rare',
                points: 150,
                condition: (stats) => stats.dataPointsViewed >= 1000
            },
            {
                id: 'data_scientist',
                name: { es: 'Científico de Datos', en: 'Data Scientist' },
                description: { es: 'Visualizó 10000 puntos de datos', en: 'Viewed 10000 data points' },
                icon: 'fas fa-microscope',
                rarity: 'epic',
                points: 500,
                condition: (stats) => stats.dataPointsViewed >= 10000
            },

            // Environmental Achievements
            {
                id: 'tree_hugger',
                name: { es: 'Abrazador de Árboles', en: 'Tree Hugger' },
                description: { es: 'Monitoreó 50 ciudades con alta cobertura verde', en: 'Monitored 50 cities with high green coverage' },
                icon: 'fas fa-tree',
                rarity: 'legendary',
                points: 250,
                condition: (stats) => stats.greenCitiesMonitored >= 50
            },
            {
                id: 'air_guardian',
                name: { es: 'Guardián del Aire', en: 'Air Guardian' },
                description: { es: 'Monitoreó calidad del aire durante 30 días', en: 'Monitored air quality for 30 days' },
                icon: 'fas fa-wind',
                rarity: 'epic',
                points: 300,
                condition: (stats) => stats.airQualityDays >= 30
            },
            {
                id: 'climate_warrior',
                name: { es: 'Guerrero Climático', en: 'Climate Warrior' },
                description: { es: 'Siguió tendencias climáticas durante 100 días', en: 'Tracked climate trends for 100 days' },
                icon: 'fas fa-thermometer-half',
                rarity: 'legendary',
                points: 750,
                condition: (stats) => stats.climateDays >= 100
            },

            // Streak Achievements
            {
                id: 'consistent_user',
                name: { es: 'Usuario Consistente', en: 'Consistent User' },
                description: { es: '7 días consecutivos de uso', en: '7 consecutive days of usage' },
                icon: 'fas fa-fire',
                rarity: 'rare',
                points: 100,
                condition: (stats) => stats.streak >= 7
            },
            {
                id: 'weekly_warrior',
                name: { es: 'Guerrero Semanal', en: 'Weekly Warrior' },
                description: { es: '30 días consecutivos de uso', en: '30 consecutive days of usage' },
                icon: 'fas fa-calendar-check',
                rarity: 'epic',
                points: 400,
                condition: (stats) => stats.streak >= 30
            },
            {
                id: 'dedication_master',
                name: { es: 'Maestro de la Dedicación', en: 'Dedication Master' },
                description: { es: '100 días consecutivos de uso', en: '100 consecutive days of usage' },
                icon: 'fas fa-medal',
                rarity: 'legendary',
                points: 1000,
                condition: (stats) => stats.streak >= 100
            },

            // Satellite Achievements
            {
                id: 'satellite_spotter',
                name: { es: 'Detector de Satélites', en: 'Satellite Spotter' },
                description: { es: 'Accedió a 20 imágenes satelitales', en: 'Accessed 20 satellite images' },
                icon: 'fas fa-satellite',
                rarity: 'rare',
                points: 120,
                condition: (stats) => stats.satelliteImages >= 20
            },
            {
                id: 'space_observer',
                name: { es: 'Observador Espacial', en: 'Space Observer' },
                description: { es: 'Accedió a 100 imágenes satelitales', en: 'Accessed 100 satellite images' },
                icon: 'fas fa-satellite-dish',
                rarity: 'epic',
                points: 350,
                condition: (stats) => stats.satelliteImages >= 100
            },

            // Special Achievements
            {
                id: 'night_owl',
                name: { es: 'Búho Nocturno', en: 'Night Owl' },
                description: { es: 'Usó la app entre medianoche y 6 AM', en: 'Used the app between midnight and 6 AM' },
                icon: 'fas fa-moon',
                rarity: 'rare',
                points: 75,
                condition: (stats) => stats.nightUsage > 0
            },
            {
                id: 'early_bird',
                name: { es: 'Madrugador', en: 'Early Bird' },
                description: { es: 'Usó la app antes de las 6 AM', en: 'Used the app before 6 AM' },
                icon: 'fas fa-sun',
                rarity: 'rare',
                points: 75,
                condition: (stats) => stats.earlyUsage > 0
            },
            {
                id: 'perfectionist',
                name: { es: 'Perfeccionista', en: 'Perfectionist' },
                description: { es: 'Completó el análisis de una ciudad al 100%', en: 'Completed 100% analysis of a city' },
                icon: 'fas fa-star',
                rarity: 'legendary',
                points: 500,
                condition: (stats) => stats.perfectAnalysis > 0
            },

            // Social Achievements
            {
                id: 'knowledge_seeker',
                name: { es: 'Buscador de Conocimiento', en: 'Knowledge Seeker' },
                description: { es: 'Leyó 50 interpretaciones de datos', en: 'Read 50 data interpretations' },
                icon: 'fas fa-book',
                rarity: 'common',
                points: 60,
                condition: (stats) => stats.interpretationsRead >= 50
            },
            {
                id: 'eco_advocate',
                name: { es: 'Defensor Ecológico', en: 'Eco Advocate' },
                description: { es: 'Compartió 10 análisis ambientales', en: 'Shared 10 environmental analyses' },
                icon: 'fas fa-share-alt',
                rarity: 'epic',
                points: 200,
                condition: (stats) => stats.sharesCount >= 10
            }
        ];
    }

    /**
     * Initialize level system
     */
    initializeLevels() {
        return [
            { level: 1, name: { es: 'Novato', en: 'Novice' }, minPoints: 0, maxPoints: 99 },
            { level: 2, name: { es: 'Aprendiz', en: 'Apprentice' }, minPoints: 100, maxPoints: 249 },
            { level: 3, name: { es: 'Explorador', en: 'Explorer' }, minPoints: 250, maxPoints: 499 },
            { level: 4, name: { es: 'Analista', en: 'Analyst' }, minPoints: 500, maxPoints: 999 },
            { level: 5, name: { es: 'Investigador', en: 'Researcher' }, minPoints: 1000, maxPoints: 1999 },
            { level: 6, name: { es: 'Especialista', en: 'Specialist' }, minPoints: 2000, maxPoints: 3999 },
            { level: 7, name: { es: 'Experto', en: 'Expert' }, minPoints: 4000, maxPoints: 7999 },
            { level: 8, name: { es: 'Maestro', en: 'Master' }, minPoints: 8000, maxPoints: 15999 },
            { level: 9, name: { es: 'Gran Maestro', en: 'Grand Master' }, minPoints: 16000, maxPoints: 31999 },
            { level: 10, name: { es: 'Leyenda', en: 'Legend' }, minPoints: 32000, maxPoints: Infinity }
        ];
    }

    /**
     * Initialize points configuration
     */
    initializePointsConfig() {
        return {
            dailyLogin: 10,
            cityExplored: 5,
            dataPointViewed: 1,
            satelliteImageViewed: 3,
            chartInteraction: 2,
            mapInteraction: 2,
            settingsChange: 1,
            shareAction: 15,
            perfectAnalysis: 50,
            streakBonus: (days) => Math.min(days * 2, 50) // Max 50 bonus points
        };
    }

    /**
     * Initialize streak configuration
     */
    initializeStreakConfig() {
        return {
            maxDaysForStreak: 1, // Must use within 1 day to maintain streak
            bonusThreshold: 7, // Start giving bonuses after 7 days
            maxBonusMultiplier: 3 // Maximum 3x point multiplier
        };
    }

    /**
     * Load user statistics
     */
    loadUserStats(initialStats = {}) {
        const saved = localStorage.getItem('ecosat-user-stats');
        if (saved) {
            try {
                this.userStats = { ...this.userStats, ...JSON.parse(saved) };
            } catch (error) {
                console.error('Error loading user stats:', error);
            }
        }
        
        // Apply any initial stats passed in
        this.userStats = { ...this.userStats, ...initialStats };
        
        // Ensure achievements array exists
        if (!this.userStats.achievements) {
            this.userStats.achievements = [];
        }
    }

    /**
     * Save user statistics
     */
    saveUserStats() {
        try {
            localStorage.setItem('ecosat-user-stats', JSON.stringify(this.userStats));
        } catch (error) {
            console.error('Error saving user stats:', error);
        }
    }

    /**
     * Setup event listeners for tracking actions
     */
    setupEventListeners() {
        // Track daily login
        this.trackDailyLogin();
        
        // Track map interactions
        this.trackMapInteractions();
        
        // Track chart interactions
        this.trackChartInteractions();
        
        // Track page visibility for session tracking
        this.trackPageVisibility();
    }

    /**
     * Track daily login
     */
    trackDailyLogin() {
        const today = new Date().toDateString();
        const lastLogin = localStorage.getItem('ecosat-last-login');
        
        if (lastLogin !== today) {
            this.addPoints('dailyLogin');
            this.updateStreak();
            localStorage.setItem('ecosat-last-login', today);
            
            // Award first steps achievement on first login
            if (!lastLogin) {
                this.unlockAchievement('first_steps');
            }
        }
    }

    /**
     * Track map interactions
     */
    trackMapInteractions() {
        // This would be called when user interacts with the map
        document.addEventListener('map-interaction', (event) => {
            this.addPoints('mapInteraction');
            this.incrementStat('mapInteractions');
            
            if (event.detail && event.detail.cityId) {
                this.trackCityExplored(event.detail.cityId);
            }
        });
    }

    /**
     * Track chart interactions
     */
    trackChartInteractions() {
        // This would be called when user interacts with charts
        document.addEventListener('chart-interaction', (event) => {
            this.addPoints('chartInteraction');
            this.incrementStat('chartInteractions');
        });
    }

    /**
     * Track page visibility for accurate session time
     */
    trackPageVisibility() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseSession();
            } else {
                this.resumeSession();
            }
        });
    }

    /**
     * Add points to user total
     */
    addPoints(action, customAmount = null) {
        let points = customAmount || this.pointsConfig[action] || 0;
        
        // Apply streak bonus
        if (this.userStats.streak >= this.streakConfig.bonusThreshold) {
            const bonusMultiplier = Math.min(
                1 + (this.userStats.streak / 30), 
                this.streakConfig.maxBonusMultiplier
            );
            points = Math.round(points * bonusMultiplier);
        }
        
        this.userStats.points += points;
        this.userStats.lastActivity = new Date().toISOString();
        
        // Check for level up
        this.checkLevelUp();
        
        // Check achievements
        this.checkAchievements();
        
        // Update UI
        this.updatePointsDisplay();
        
        // Save progress
        this.saveUserStats();
        
        // Show points notification
        this.showPointsNotification(points, action);
    }

    /**
     * Track city exploration
     */
    trackCityExplored(cityId) {
        if (!this.userStats.exploredCities) {
            this.userStats.exploredCities = [];
        }
        
        if (!this.userStats.exploredCities.includes(cityId)) {
            this.userStats.exploredCities.push(cityId);
            this.userStats.citiesExplored = this.userStats.exploredCities.length;
            this.addPoints('cityExplored');
        }
    }

    /**
     * Track data point viewing
     */
    trackDataPointViewed() {
        this.incrementStat('dataPointsViewed');
        this.addPoints('dataPointViewed');
    }

    /**
     * Track satellite image viewing
     */
    trackSatelliteImageViewed() {
        this.incrementStat('satelliteImages');
        this.addPoints('satelliteImageViewed');
    }

    /**
     * Increment a statistic
     */
    incrementStat(statName, amount = 1) {
        if (!this.userStats[statName]) {
            this.userStats[statName] = 0;
        }
        this.userStats[statName] += amount;
        this.saveUserStats();
    }

    /**
     * Update streak counter
     */
    updateStreak() {
        const today = new Date();
        const lastActivity = this.userStats.lastActivity ? new Date(this.userStats.lastActivity) : null;
        
        if (lastActivity) {
            const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
            
            if (daysDiff <= this.streakConfig.maxDaysForStreak) {
                this.userStats.streak += 1;
            } else {
                this.userStats.streak = 1; // Reset streak
            }
        } else {
            this.userStats.streak = 1;
        }
        
        // Update streak display
        this.updateStreakDisplay();
    }

    /**
     * Check for level up
     */
    checkLevelUp() {
        const currentLevel = this.getCurrentLevel();
        if (currentLevel.level > this.userStats.level) {
            const oldLevel = this.userStats.level;
            this.userStats.level = currentLevel.level;
            this.showLevelUpNotification(oldLevel, currentLevel.level);
        }
    }

    /**
     * Get current level based on points
     */
    getCurrentLevel() {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (this.userStats.points >= this.levels[i].minPoints) {
                return this.levels[i];
            }
        }
        return this.levels[0];
    }

    /**
     * Check for new achievements
     */
    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (!this.userStats.achievements.includes(achievement.id)) {
                if (achievement.condition(this.userStats)) {
                    this.unlockAchievement(achievement.id);
                }
            }
        });
    }

    /**
     * Unlock an achievement
     */
    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement || this.userStats.achievements.includes(achievementId)) {
            return;
        }
        
        this.userStats.achievements.push(achievementId);
        this.userStats.points += achievement.points;
        
        this.showAchievementNotification(achievement);
        this.saveUserStats();
        this.updateUI();
    }

    /**
     * Get recent achievements
     */
    async getRecentAchievements(limit = 3) {
        return this.userStats.achievements
            .slice(-limit)
            .map(id => this.achievements.find(a => a.id === id))
            .filter(Boolean);
    }

    /**
     * Get all unlocked achievements
     */
    getUnlockedAchievements() {
        return this.userStats.achievements
            .map(id => this.achievements.find(a => a.id === id))
            .filter(Boolean);
    }

    /**
     * Get progress towards next level
     */
    getLevelProgress() {
        const currentLevel = this.getCurrentLevel();
        const nextLevel = this.levels.find(l => l.level === currentLevel.level + 1);
        
        if (!nextLevel) {
            return { progress: 100, pointsNeeded: 0, isMaxLevel: true };
        }
        
        const pointsInLevel = this.userStats.points - currentLevel.minPoints;
        const pointsNeededForLevel = nextLevel.minPoints - currentLevel.minPoints;
        const progress = Math.round((pointsInLevel / pointsNeededForLevel) * 100);
        
        return {
            progress,
            pointsNeeded: nextLevel.minPoints - this.userStats.points,
            isMaxLevel: false
        };
    }

    /**
     * Update all UI elements
     */
    updateUI() {
        this.updatePointsDisplay();
        this.updateLevelDisplay();
        this.updateStreakDisplay();
        this.updateAchievementsDisplay();
    }

    /**
     * Update points display
     */
    updatePointsDisplay() {
        const element = document.getElementById('user-points');
        if (element) {
            element.textContent = this.userStats.points.toLocaleString();
        }
    }

    /**
     * Update level display
     */
    updateLevelDisplay() {
        const element = document.getElementById('user-level');
        if (element) {
            element.textContent = this.userStats.level;
        }
    }

    /**
     * Update streak display
     */
    updateStreakDisplay() {
        const element = document.getElementById('user-streak');
        if (element) {
            element.textContent = this.userStats.streak;
        }
    }

    /**
     * Update achievements display
     */
    updateAchievementsDisplay() {
        // This would update the achievements section in the UI
        console.log(`Achievements unlocked: ${this.userStats.achievements.length}`);
    }

    /**
     * Show points notification
     */
    showPointsNotification(points, action) {
        if (points <= 0) return;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'points-notification';
        notification.innerHTML = `
            <div class="points-content">
                <i class="fas fa-plus-circle"></i>
                <span>+${points} pts</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate and remove
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }

    /**
     * Show level up notification
     */
    showLevelUpNotification(oldLevel, newLevel) {
        const currentLevelInfo = this.getCurrentLevel();
        
        // Create level up notification
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <div class="level-up-content">
                <h3>¡Nivel Aumentado!</h3>
                <div class="level-info">
                    <span class="old-level">${oldLevel}</span>
                    <i class="fas fa-arrow-right"></i>
                    <span class="new-level">${newLevel}</span>
                </div>
                <p>${currentLevelInfo.name.es}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }

    /**
     * Show achievement notification
     */
    showAchievementNotification(achievement) {
        const currentLang = localStorage.getItem('ecosat-language') || 'es';
        
        const notification = document.createElement('div');
        notification.className = `achievement-notification ${achievement.rarity}`;
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-header">
                    <i class="${achievement.icon}"></i>
                    <h3>¡Logro Desbloqueado!</h3>
                </div>
                <div class="achievement-details">
                    <h4>${achievement.name[currentLang]}</h4>
                    <p>${achievement.description[currentLang]}</p>
                    <span class="achievement-points">+${achievement.points} pts</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }

    /**
     * Check daily streak status
     */
    checkDailyStreak() {
        const today = new Date();
        const lastActivity = this.userStats.lastActivity ? new Date(this.userStats.lastActivity) : null;
        
        if (lastActivity) {
            const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
            
            if (daysDiff > this.streakConfig.maxDaysForStreak) {
                this.userStats.streak = 0;
                this.saveUserStats();
            }
        }
    }

    /**
     * Pause session tracking
     */
    pauseSession() {
        this.sessionPaused = true;
    }

    /**
     * Resume session tracking
     */
    resumeSession() {
        this.sessionPaused = false;
    }

    /**
     * Get user statistics summary
     */
    getStatsSummary() {
        const currentLevel = this.getCurrentLevel();
        const levelProgress = this.getLevelProgress();
        
        return {
            points: this.userStats.points,
            level: this.userStats.level,
            levelName: currentLevel.name,
            streak: this.userStats.streak,
            achievementsCount: this.userStats.achievements.length,
            totalAchievements: this.achievements.length,
            citiesExplored: this.userStats.citiesExplored || 0,
            dataPointsViewed: this.userStats.dataPointsViewed || 0,
            levelProgress: levelProgress
        };
    }

    /**
     * Reset user progress (for testing or user request)
     */
    resetProgress() {
        this.userStats = {
            points: 0,
            level: 1,
            streak: 0,
            achievements: [],
            badges: [],
            totalGames: 0,
            citiesExplored: 0,
            dataPointsViewed: 0,
            lastActivity: null
        };
        
        this.saveUserStats();
        this.updateUI();
    }

    /**
     * Export user data
     */
    exportUserData() {
        return {
            stats: this.userStats,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    /**
     * Import user data
     */
    importUserData(data) {
        try {
            if (data.stats) {
                this.userStats = { ...this.userStats, ...data.stats };
                this.saveUserStats();
                this.updateUI();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing user data:', error);
            return false;
        }
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        this.eventListeners.forEach(listener => {
            document.removeEventListener(listener.event, listener.handler);
        });
        
        this.eventListeners = [];
        this.isInitialized = false;
        console.log('GamificationSystem destroyed');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GamificationSystem;
}