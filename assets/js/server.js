// eto yung server side niyo lahat ng mangyayare sa client side (register.html, index.html, login-script.js, home.html, home.js) dito dadaan

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const accountsFilePath = path.join(__dirname, '../../database/accounts.txt');
const polesFilePath = path.join(__dirname, '../../database/poles.txt');

app.use(express.static(path.join(__dirname, '../../'))); //eto gagamit ng mga static files (HTML, CSS, JS)
app.use(bodyParser.json()); //eto mag paparse ng JSON bodies

//eto mag preprevent ng caching ng sensitive page (home.html)
app.use((req,res,next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
});

//eto yung mag aaccess at mag babasa nung text file
function getAccounts() {
    if (!fs.existsSync(accountsFilePath)) {
        return {};
    }

    try {
        const data = fs.readFileSync(accountsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error ('Error reading accounts file:', err);
        return {};
    }
}

//eto mag susulat ng accounts sa text file
function saveAccount(username,password) {
    const accounts = getAccounts();
    accounts[username] = password;

    try {
        fs.writeFileSync(accountsFilePath, JSON.stringify(accounts, null, 2));
    } catch (err) {
        console.error('Error saving account:', err);
    }
}

//eto mag hahandle ng login request
app.post('/login', (req, res) => {
    const {username, password} = req.body;
    const accounts = getAccounts();

    if (accounts[username] && accounts [username] === password) {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.json({ success: false, message: 'Invalid username or password'});
    }
});

//pang register or save accounts
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const accounts = getAccounts();

    if (accounts[username]) {
        return res.json({ success: false, message: 'Username already exists' });
    }

    saveAccount(username, password);
    res.json({ success: true, message: 'Account created successfully'});
});

// pang save ng pole data
app.post('/savePole', (req, res) => {
    const { name, address, type, size, assembly, transformerRating, position } = req.body;

    // pang validate ng mga naka sulat
    if (!name || !address || !type || !size || !assembly || !transformerRating || !position) {
        return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    // eto mag crecreate ng pole na object
    const newPole = {
        id: Date.now(),
        name,
        address,
        type,
        size,
        assembly,
        transformerRating,
        position 
    };

    try {
        let polesData = [];

        // babasahin niya yung mga meron na data na
        if (fs.existsSync(polesFilePath)) {
            const fileContent = fs.readFileSync(polesFilePath, 'utf8');
            if (fileContent) {
                // mag paparse lang pag hindi empty yung file
                polesData = JSON.parse(fileContent);
            }
        }

        polesData.push(newPole);

        fs.writeFileSync(polesFilePath, JSON.stringify(polesData, null, 2));
        res.json({ success: true, id: newPole.id });
    } catch (error) {
        console.error('Error saving pole:', error);
        res.status(500).json({ success: false, message: 'Error saving pole', error: error.message });
    }
});

// eto mag sasave ng edited data ng pole
app.post('/updatePole', (req, res) => {
    const updatedPoleData = req.body;

    fs.readFile(polesFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read data' });

        let poles;
        try {
            poles = JSON.parse(data);
        } catch (parseError) {
            return res.status(500).json({ error: 'Failed to parse data' });
        }

        const poleIndex = poles.findIndex(pole => pole.id === updatedPoleData.id);
        if (poleIndex !== -1) {
            // eto amg uupdate ng data ng pole
            poles[poleIndex] = { ...poles[poleIndex], ...updatedPoleData };

            fs.writeFile(polesFilePath, JSON.stringify(poles, null, 2), (writeErr) => {
                if (writeErr) {
                    return res.status(500).json({ error: 'Failed to write data' });
                }
                return res.json({ message: 'Pole updated successfully' });
            });
        } else {
            return res.status(404).json({ error: 'Pole not found' });
        }
    });
});

// eto mag dedelete ng pole
app.post('/deletePole', (req, res) => {
    const { id } = req.body; // kukunin niya yung ID dun sa requested body

    fs.readFile(polesFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read data' });

        let poles;
        try {
            poles = JSON.parse(data);
        } catch (parseError) {
            return res.status(500).json({ error: 'Failed to parse data' });
        }

        // mag fifilter ng data niyo sa poles.txt para yung ID lang at yung mga data non ang kukunin
        const updatedPoles = poles.filter(pole => pole.id !== id);
        
        // eto mag susulat nung data sa poles.txt
        fs.writeFile(polesFilePath, JSON.stringify(updatedPoles, null, 2), (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ error: 'Failed to write data' });
            }
            return res.json({ message: 'Pole deleted successfully' });
        });
    });
});

// eto amg sasave ng lahat ng poles data
app.post('/saveAllPolesData', (req, res) => {
    const updatedPoles = req.body;

    fs.writeFile(polesFilePath, JSON.stringify(updatedPoles, null, 2), (err) => {
        if (err) {
            console.error('Error saving poles:', err);
            return res.status(500).json({ error: 'Failed to save poles' });
        }
        res.status(200).json({ success: true });
    });
});

// eto kukuha nung mga pole data
app.get('/getPoles', (req, res) => {
    try {
        if (!fs.existsSync(polesFilePath)) {
            return res.json([]);
        }

        const data = fs.readFileSync(polesFilePath, 'utf8');
        const poles = data ? JSON.parse(data) : [];
        res.json(poles);
    } catch (error) {
        console.error('Error reading poles:', error);
        res.status(500).json({ error: 'Failed to read poles data' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});