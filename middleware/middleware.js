const jwt = require('jsonwebtoken');
const secretKey = 'my super secret';

//TODO: isAuthorized Middleware
const isAuthorized = async (req, res, next) => {
    // should verify the JWT provided in the req.headers.authorization~
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No Token Provided'})
    }
    const token = req.headers.authorization.split(' ')[1]
    try {
        // verify the token
        const decoded = jwt.verify(token, secretKey);
        // Put the decoded value on the 'req' object
        req.user = decoded;
        // move to the next middleware
        next()
    } catch (e) {
        res.status(401).json({ message: 'Token is invalid'});
    }
}

//TODO: isAdmin Middleware
const isAdmin = async (req, res, next) => {
    if (req.user.roles.includes('admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Need admin permission' });
    }
};

module.exports = { isAuthorized, isAdmin };
