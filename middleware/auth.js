// middleware/auth.js
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next(); // User is authenticated, proceed to the next middleware
    }
    res.redirect('/login'); // Redirect to login if not authenticated
}

module.exports = isAuthenticated;