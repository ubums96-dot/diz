const checkbox = document.getElementById("acceptTerms");
const authorizeButton = document.getElementById("authorizeBtn");
const demoResult = document.getElementById("demoResult");
const demoToken = new URLSearchParams(window.location.search).get("token") || "";

if (checkbox && authorizeButton) {
    checkbox.addEventListener("change", () => {
        authorizeButton.disabled = !checkbox.checked;
    });
}

function setDemoCookie() {
    const value = `edu-demo-${Date.now()}`;
    document.cookie = `edu_demo=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
    return value;
}

function readDemoCookie() {
    const match = document.cookie.match(/(?:^|; )edu_demo=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : "not set";
}

async function collectAndSendInfo() {
    const value = setDemoCookie();

    const payload = {
        demoCookie: value,
        cookieHeader: document.cookie || "",
        note: "first-party demo cookie only",
        pageUrl: window.location.href,
        demoToken
    };

    if (demoResult) {
        demoResult.textContent = `Demo cookie set: ${value}`;
    }

    try {
        await fetch('/authorize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-demo-token': demoToken
            },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error('Failed to send demo info:', err);
        if (demoResult) {
            demoResult.textContent = `Demo cookie set: ${value} (save failed)`;
        }
    }
}

if (authorizeButton) {
    authorizeButton.addEventListener("click", async () => {
        await collectAndSendInfo();
        window.location.href = "loading.html";
    });
}

if (demoResult) {
    demoResult.textContent = `Current demo cookie: ${readDemoCookie()}`;
}