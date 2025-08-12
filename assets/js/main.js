// Configuration
const CONFIG = {
    IFRAME_LOAD_TIMEOUT: 15000,
    RETRY_ATTEMPTS: 3,
    VERCEL_URL: 'https://cv-delta-roan.vercel.app/',
    RETRY_DELAYS: [2000, 4000, 6000] // Progressive delays
};

// State management
const state = {
    currentAttempt: 0,
    deviceCheckComplete: false,
    loadingTimeout: null
};

// DOM elements cache
const elements = {
    loadingContainer: null,
    redirectContainer: null,
    retryContainer: null,
    manualRedirectContainer: null,
    errorContainer: null,
    cvIframe: null,
    loadingText: null,
    loadingSubtext: null,
    redirectText: null,
    redirectSubtext: null,
    retryText: null,
    retrySubtext: null,
    manualRedirectButton: null
};

// Initialize DOM elements
function initializeElements() {
    elements.loadingContainer = document.getElementById('loadingContainer');
    elements.redirectContainer = document.getElementById('redirectContainer');
    elements.retryContainer = document.getElementById('retryContainer');
    elements.manualRedirectContainer = document.getElementById('manualRedirectContainer');
    elements.errorContainer = document.getElementById('errorContainer');
    elements.cvIframe = document.getElementById('cvIframe');
    elements.loadingText = document.getElementById('loadingText');
    elements.loadingSubtext = document.getElementById('loadingSubtext');
    elements.redirectText = document.getElementById('redirectText');
    elements.redirectSubtext = document.getElementById('redirectSubtext');
    elements.retryText = document.getElementById('retryText');
    elements.retrySubtext = document.getElementById('retrySubtext');
    elements.manualRedirectButton = document.getElementById('manualRedirectButton');
}

// Show specific screen
function showScreen(screenName) {
    // Hide all screens
    const containers = [
        elements.loadingContainer,
        elements.redirectContainer,
        elements.retryContainer,
        elements.manualRedirectContainer,
        elements.errorContainer
    ];
    
    containers.forEach(container => {
        if (container) {
            container.classList.add('hidden');
        }
    });
    
    // Show requested screen
    const targetElement = elements[screenName + 'Container'];
    if (targetElement) {
        targetElement.classList.remove('hidden');
    }
}

// Update text content safely
function updateText(elementName, text) {
    const element = elements[elementName];
    if (element) {
        element.textContent = text;
    }
}

// Enhanced device detection
function detectProblematicDevice() {
    const ua = navigator.userAgent;
    const isSafariMobile = /Safari/.test(ua) && /Mobile/.test(ua) && !/Chrome/.test(ua);
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroidWebView = /Android.*wv\)/.test(ua);
    const isOldBrowser = !window.fetch || !window.Promise || !window.postMessage;
    const isSmallScreen = window.innerWidth < 768 && window.innerHeight < 600;
    
    const isProblematic = isSafariMobile || 
                         (isIOS && isSmallScreen) || 
                         isAndroidWebView || 
                         isOldBrowser;
    
    return {
        shouldRedirect: isProblematic,
        reason: isSafariMobile ? 'safari_mobile' : 
               (isIOS && isSmallScreen) ? 'ios_small_screen' : 
               isAndroidWebView ? 'android_webview' : 
               isOldBrowser ? 'old_browser' : 'unknown',
        deviceInfo: {
            isSafariMobile,
            isIOS,
            isAndroidWebView,
            isOldBrowser,
            isSmallScreen,
            userAgent: ua.substring(0, 100)
        }
    };
}

// Redirect function with multiple fallback methods
function performRedirect(reason = 'compatibility') {
    console.log(`=== PERFORMING REDIRECT (${reason}) ===`);
    
    // Show redirect screen
    showScreen('redirect');
    updateText('redirectText', 'Redirecting for better compatibility...');
    updateText('redirectSubtext', 'Optimizing experience for your device');
    
    // Perform redirect after short delay
    setTimeout(() => {
        try {
            window.location.href = CONFIG.VERCEL_URL;
        } catch (error) {
            console.log('Standard redirect failed:', error);
            
            try {
                window.location.replace(CONFIG.VERCEL_URL);
            } catch (error2) {
                console.log('Location replace failed:', error2);
                
                // Show manual redirect screen
                showScreen('manualRedirect');
                if (elements.manualRedirectButton) {
                    elements.manualRedirectButton.href = CONFIG.VERCEL_URL;
                }
            }
        }
    }, 2000);
}

// Device compatibility check
function checkDeviceCompatibility() {
    console.log('=== DEVICE COMPATIBILITY CHECK ===');
    
    const deviceCheck = detectProblematicDevice();
    console.log('Device check result:', deviceCheck);
    
    if (deviceCheck.shouldRedirect) {
        console.log('=== DEVICE INCOMPATIBLE - REDIRECTING ===');
        console.log('Reason:', deviceCheck.reason);
        console.log('Device info:', deviceCheck.deviceInfo);
        
        performRedirect(deviceCheck.reason);
        return false;
    }
    
    console.log('=== DEVICE COMPATIBLE - LOADING IFRAME ===');
    return true;
}

// Initialize iframe loading
function initializeIframe() {
    console.log('=== INITIALIZING IFRAME ===');
    
    elements.cvIframe.src = CONFIG.VERCEL_URL;
    elements.cvIframe.onload = handleIframeLoad;
    elements.cvIframe.onerror = handleIframeError;
    
    startLoadingTimeout();
}

function startLoadingTimeout() {
    state.loadingTimeout = setTimeout(() => {
        console.warn('Iframe loading timeout reached');
        handleIframeError();
    }, CONFIG.IFRAME_LOAD_TIMEOUT);
}

function clearLoadingTimeout() {
    if (state.loadingTimeout) {
        clearTimeout(state.loadingTimeout);
        state.loadingTimeout = null;
    }
}

// Iframe load success handler
function handleIframeLoad() {
    console.log('=== IFRAME LOADED SUCCESSFULLY ===');
    clearLoadingTimeout();
    
    setTimeout(() => {
        elements.loadingContainer.classList.add('hidden');
    }, 500);
}

// Enhanced iframe error handler
function handleIframeError() {
    console.error('=== IFRAME LOAD FAILED ===');
    clearLoadingTimeout();
    
    state.currentAttempt++;
    
    if (state.currentAttempt < CONFIG.RETRY_ATTEMPTS) {
        console.log(`Retrying iframe load (attempt ${state.currentAttempt + 1}/${CONFIG.RETRY_ATTEMPTS})`);
        
        // Show retry screen
        showScreen('retry');
        updateText('retryText', 'Retrying connection...');
        updateText('retrySubtext', `Attempt ${state.currentAttempt + 1} of ${CONFIG.RETRY_ATTEMPTS}`);
        
        const retryDelay = CONFIG.RETRY_DELAYS[state.currentAttempt - 1] || 2000;
        
        setTimeout(() => {
            const timestamp = Date.now();
            const retryParam = `?retry=${state.currentAttempt}&t=${timestamp}`;
            elements.cvIframe.src = CONFIG.VERCEL_URL + retryParam;
            startLoadingTimeout();
        }, retryDelay);
    } else {
        console.log('=== ALL RETRY ATTEMPTS FAILED ===');
        
        const deviceCheck = detectProblematicDevice();
        if (deviceCheck.shouldRedirect) {
            console.log('Device incompatible detected after failures, redirecting');
            performRedirect('retry_failure');
        } else {
            console.log('Showing error screen');
            showScreen('error');
        }
    }
}

// Enhanced iframe communication
function handleMessage(event) {
    console.log('=== MESSAGE FROM IFRAME ===');
    console.log('Origin:', event.origin);
    console.log('Data:', event.data);
    
    if (event.origin !== 'https://cv-delta-roan.vercel.app') {
        console.log('Message from unauthorized origin, ignoring');
        return;
    }
    
    if (event.data && event.data.type === 'REDIRECT_REQUEST') {
        console.log('=== REDIRECT REQUEST FROM IFRAME ===');
        console.log('Target URL:', event.data.url);
        console.log('Reason:', event.data.reason);
        
        window.location.href = event.data.url;
    }
    
    if (event.data && event.data.type === 'IFRAME_READY') {
        console.log('Iframe reports ready');
        handleIframeLoad();
    }
    
    if (event.data && event.data.type === 'AUTH_SUCCESS') {
        console.log('Authentication successful in iframe');
        handleIframeLoad();
    }
}

// Handle page visibility changes
function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        console.log('=== PAGE BECAME VISIBLE ===');
        
        if (elements.errorContainer && !elements.errorContainer.classList.contains('hidden')) {
            console.log('Page visible with error state - user might want to retry');
        }
        
        if (elements.loadingContainer && !elements.loadingContainer.classList.contains('hidden') && elements.cvIframe && elements.cvIframe.src) {
            console.log('Page visible but still loading - checking iframe status');
        }
    }
}

// Global error handler
function handleGlobalError(e) {
    console.error('=== GLOBAL ERROR CAUGHT ===');
    console.error('Error:', e.error);
    console.error('Message:', e.message);
    console.error('Source:', e.filename);
    console.error('Line:', e.lineno);
    
    if (!state.deviceCheckComplete || (elements.loadingContainer && !elements.loadingContainer.classList.contains('hidden'))) {
        console.log('Error during loading phase, treating as iframe error');
        handleIframeError();
    }
}

// Handle unhandled promise rejections
function handleUnhandledRejection(e) {
    console.error('=== UNHANDLED PROMISE REJECTION ===');
    console.error('Reason:', e.reason);
    
    if (!state.deviceCheckComplete) {
        console.log('Promise rejection during loading phase');
    }
}

// Initialize application
function initialize() {
    console.log('=== GITHUB PAGES WRAPPER INITIALIZED ===');
    console.log('User Agent:', navigator.userAgent);
    console.log('Screen size:', window.innerWidth + 'x' + window.innerHeight);
    console.log('Viewport size:', window.screen.width + 'x' + window.screen.height);
    
    // Initialize DOM elements
    initializeElements();
    
    // Set up event listeners
    window.addEventListener('message', handleMessage);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Check device compatibility first
    if (checkDeviceCompatibility()) {
        initializeIframe();
        state.deviceCheckComplete = true;
    } else {
        state.deviceCheckComplete = true;
        return;
    }
    
    // Absolute fallback
    setTimeout(() => {
        if (elements.loadingContainer && !elements.loadingContainer.classList.contains('hidden') && state.deviceCheckComplete) {
            console.log('=== ABSOLUTE FALLBACK TRIGGERED ===');
            console.log('Iframe failed to load within absolute timeout');
            
            const finalCheck = detectProblematicDevice();
            if (finalCheck.shouldRedirect) {
                performRedirect('absolute_timeout');
            } else {
                showScreen('error');
            }
        }
    }, 25000);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}