//TODO: MIDDLEWARE / isAuthorized / isAdmin
const jwt = require('jsonwebtoken');
const secretKey = 'my super secret';

//TODO: isAuthoized
const isAuthorized = async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid Token provided' })
    }
    const token = req.headers.authorization.split(' ')[1];
    try {
        // verify the decoded token
        const decoded = jwt.verify(token, secretKey);
        // Put the decoded value of the 'req' object
        req.user = decoded;
        // move to the next middelware
        next() 
    } catch (e) {
        res.status(401).json({ message: 'Token is invalid' });
    }
}

//TODO: isAdmin
const isAdmin = async (req, res, next) => {
    if (req.user.roles.includes('admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Need admin permission' });
    }

}

module.exports = { isAuthorized, isAdmin };