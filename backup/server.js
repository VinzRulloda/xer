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

//eto mag sasave ng pole data
app.post('/savePole', (req, res) => {
    const { name, address, type, size, assembly, transformerRating } = req.body;

    if (!name || !address || !type || !size || !assembly || !transformerRating) {
        return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    const data = `Name: ${name}, Address: ${address}, Type: ${type}, Size: ${size}, Assembly: ${assembly}, Transformer Rating: ${transformerRating}\n`;

    try {
        fs.appendFileSync(polesFilePath, data);
        res.json({ success: true, message: 'Pole saved successfully' });
    } catch (error) {
        console.error('Error saving pole:', error);
        res.status(500).json({ success: false, message: 'Error saving pole' });
    }
});

// Save edited pole data
app.post('/updatePole', (req, res) => {
    const updatedPole = req.body;

    try {
        let polesData = fs.existsSync(polesFilePath)
            ? JSON.parse(fs.readFileSync(polesFilePath, 'utf8'))
            : [];

        polesData = polesData.map(pole =>
            pole.name === updatedPole.name ? updatedPole : pole
        );

        fs.writeFileSync(polesFilePath, JSON.stringify(polesData, null, 2));
        res.json({ success: true, message: 'Pole updated successfully' });
    } catch (error) {
        console.error('Error updating pole:', error);
        res.status(500).json({ success: false, message: 'Error updating pole' });
    }
});

// Delete selected pole
app.post('/deletePole', (req, res) => {
    const { name } = req.body;

    try {
        let polesData = fs.existsSync(polesFilePath)
            ? JSON.parse(fs.readFileSync(polesFilePath, 'utf8'))
            : [];

        polesData = polesData.filter(pole => pole.name !== name);

        fs.writeFileSync(polesFilePath, JSON.stringify(polesData, null, 2));
        res.json({ success: true, message: 'Pole deleted successfully' });
    } catch (error) {
        console.error('Error deleting pole:', error);
        res.status(500).json({ success: false, message: 'Error deleting pole' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});