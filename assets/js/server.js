const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const accountsFilePath = path.join(__dirname, '../../database/accounts.txt');

app.use(express.static(path.join(__dirname, '../../'))); //eeto gagamit ng mga static files (HTML, CSS, JS)
app.use(bodyParser.json()); //eto mag paparse ng JSON bodies

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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/register.html'));
});

app.listen(PORT, () => {
    console.log('Server is running on http://localhost:3000');
});