//TODO: ROUTE FOR AUTH
const { Router } = require('express');
const router = Router({ mergeParams: true });

const userDao = require('../daos/user');
const { isAuthorized } = require('../middleware/middleware');

const bcrypt = require('bcrypt');
const secretKey = 'my super secret';
const jwt = require('jsonwebtoken');

//TODO: POST / SIGNUP
router.post("/signup", async (req, res) => {
    let { email, password, roles } = req.body;

    // Early return if required fields are missing
    if (!email || !password) {
        return res.status(400).json({ message: "Email and Password fields are required for signup" });
    }

    // Set default role if none provided
    if (!roles) {
        roles = ['user'];
    }

    try {
        const existingUser = await userDao.getUser(email);
        if (existingUser) {
            return res.status(409).json({ message: 'E-mail is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userDao.createUser({
            email,
            password: hashedPassword,
            roles
        });

        // Correctly mentioning what is being returned
        res.status(200).json({ message: 'Signup completed successfully. Welcome!', userId: newUser._id });
    } catch (e) {
        console.error(e); // Logging the error can help in debugging
        res.status(500).json({ message: 'Failed to create account' });
    }
});

//TODO: POST / LOGIN
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // should return 400 when password isn't provided
        if (!password || password.trim() === "") {
            return res.status(400).json({ message: 'Password input is required before login' });
        }
        const user = await userDao.getUser( email );
        if (!user) {
            return res.status(401).json({ message: 'User not found with email provided' });
        }
        
        // should not store token on user
        
        // should return 401 when password doesn't match
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Password entered is Invalid'})
        }
        // should return a JWT with user email, _id, and roles inside, but not password
        const token = jwt.sign(
            { email: user.email, _id: user._id, roles: user.roles },
            secretKey,
            { expiresIn: '1h'}
        )
        // should return 200 and a token when password matches
        return res.status(200).json({ token });
    } catch (e) {
        next (e);
    }
})

// //TODO: PUT / UPDATE PASSWORD
router.put("/password", isAuthorized, async (req, res, next) => {
    // should reject bodus token
    const { password } = req.body;
    // should reject empty or no password
if (!password || password.trim() === "") {
    return res.status(400).json({ message: 'Password required' });
}

    try {
        const userId = req.user._id;
        // should change password for user
        const successfulyChangedPassword = await userDao.updateUserPassword(userId, password);

        if (successfulyChangedPassword) {
            res.sendStatus(200);
        } else {
            res.status(404).json({ meesage: 'User not found or password could not be updated'})
        }

    } catch (e) {
        res.status(500).json({ message: 'Failed to update password'})
    }
})

module.exports = router;
