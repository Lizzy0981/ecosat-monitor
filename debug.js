/**
 * Archivo temporal de depuración para EcoSat Monitor
 * Carga este archivo antes que app.js para identificar errores
 */

console.log('🔍 Iniciando depuración de EcoSat Monitor...');

// Verificar librerías externas
window.addEventListener('DOMContentLoaded', () => {
    console.log('📋 Verificando dependencias...');
    
    // Verificar Chart.js
    if (typeof Chart !== 'undefined') {
        console.log('✅ Chart.js cargado correctamente');
    } else {
        console.error('❌ Chart.js NO encontrado');
    }
    
    // Verificar Leaflet
    if (typeof L !== 'undefined') {
        console.log('✅ Leaflet cargado correctamente');
    } else {
        console.error('❌ Leaflet NO encontrado');
    }
    
    // Verificar Font Awesome
    const faTest = document.createElement('i');
    faTest.className = 'fas fa-test';
    if (window.getComputedStyle(faTest).fontFamily.includes('Font Awesome')) {
        console.log('✅ Font Awesome cargado correctamente');
    } else {
        console.log('⚠️ Font Awesome puede no estar cargado');
    }
    
    // Verificar módulos propios
    const modules = [
        'DataManager',
        'SatelliteService', 
        'ChartsController',
        'GamificationSystem',
        'OfflineStorage',
        'Translations'
    ];
    
    modules.forEach(module => {
        if (typeof window[module] !== 'undefined') {
            console.log(`✅ ${module} disponible`);
        } else {
            console.error(`❌ ${module} NO encontrado`);
        }
    });
    
    // Verificar elementos del DOM
    const requiredElements = [
        'loading-screen',
        'progress-bar',
        'satellite-status',
        'realtime-chart'
    ];
    
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ Elemento #${id} encontrado`);
        } else {
            console.warn(`⚠️ Elemento #${id} NO encontrado`);
        }
    });
    
    console.log('🔍 Depuración completada. Revisa los errores arriba.');
});

// Capturar errores JavaScript
window.addEventListener('error', (e) => {
    console.error('🚨 Error JavaScript detectado:', {
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        column: e.colno,
        stack: e.error?.stack
    });
});

// Capturar errores de Promise no manejadas
window.addEventListener('unhandledrejection', (e) => {
    console.error('🚨 Promise rechazada no manejada:', e.reason);
});

console.log('🛡️ Handlers de error configurados');