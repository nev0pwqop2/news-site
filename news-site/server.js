const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs'); // Import the fs module
const isAuthenticated = require('./middleware/auth'); // Import the authentication middleware

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

// In-memory data structures
let accounts = [];
let newsArticles = []; // Declare and initialize newsArticles

// Load accounts from JSON file
const loadAccounts = () => {
    try {
        const data = fs.readFileSync('accounts.json', 'utf8');
        accounts = JSON.parse(data);
    } catch (err) {
        console.error('Error reading accounts file:', err);
    }
};

// Save accounts to JSON file
const saveAccounts = () => {
    fs.writeFileSync('accounts.json', JSON.stringify(accounts, null, 2));
};

// Load news articles from JSON file
const loadNewsArticles = () => {
    try {
        const data = fs.readFileSync('newsArticles.json', 'utf8');
        newsArticles = JSON.parse(data);
    } catch (err) {
        console.error('Error reading news articles file:', err);
    }
};

// Save news articles to JSON file
const saveNewsArticles = () => {
    try {
        fs.writeFileSync('newsArticles.json', JSON.stringify(newsArticles, null, 2));
    } catch (err) {
        console.error('Error saving news articles:', err);
    }
};

// Load accounts and news articles when the server starts
loadAccounts();
loadNewsArticles();

// Routes
app.get('/', (req, res) => {
    res.render('index', { news: req.session.user ? newsArticles : [], user: req.session.user });
});

// Login route
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = accounts.find(u => u.username === username && u.password === password);
    if (user) {
        req.session.user = user; // Store user info in session
        res.redirect('/'); // Redirect to home page
    } else {
        res.send('Invalid credentials');
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Route to create a new user (admin only)
app.get('/create-user', isAuthenticated, (req, res) => {
    if (req.session.user.username === 'admin') {
        res.render('create-user');
    } else {
        res.redirect('/'); // Redirect to home if not admin
    }
});

app.post('/create-user', isAuthenticated, (req, res) => {
    if (req.session.user.username === 'admin') {
        const { username, password } = req.body;
        accounts.push({ username, password });
        saveAccounts(); // Save updated accounts to JSON file
        res.redirect('/'); // Redirect to home after creating user
    } else {
        res.redirect('/'); // Redirect to home if not admin
    }
});

// Route to delete a user (admin only)
app.post('/delete-user', isAuthenticated, (req, res) => {
    if (req.session.user.username === 'admin') {
        const { username } = req.body;
        accounts = accounts.filter(u => u.username !== username); // Remove user from the array
        saveAccounts(); // Save updated accounts to JSON file
        res.redirect('/'); // Redirect to home after deleting user
    } else {
        res.redirect('/'); // Redirect to home if not admin
    }
});

// Route to create news (admin only)
app.get('/create-news', isAuthenticated, (req, res) => {
    if (req.session.user.username === 'admin') {
        res.render('create-news');
    } else {
        res.redirect('/'); // Redirect to home if not admin
    }
});

app.post('/create-news', isAuthenticated, (req, res) => {
    if (req.session.user.username === 'admin') {
        const { title, content } = req.body;
        newsArticles.push({ title, content });
        saveNewsArticles(); // Save updated news articles to JSON file
        res.redirect('/'); // Redirect to home after creating news
    } else {
        res.redirect('/'); // Redirect to home if not admin
    }
});

// Route to delete news (admin only)
app.post('/delete-news', isAuthenticated, (req, res) => {
    if (req.session.user.username === 'admin') {
        const { title } = req.body;
        newsArticles = newsArticles.filter(article => article.title !== title); // Remove news article from the array
        saveNewsArticles(); // Save updated news articles to JSON file
        res.redirect('/'); // Redirect to home after deleting news
    } else {
        res.redirect('/'); // Redirect to home if not admin
    }
});

// Protected route for viewing news
app.get('/news', isAuthenticated, (req, res) => {
    res.render('news', { news: newsArticles, user: req.session.user });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});