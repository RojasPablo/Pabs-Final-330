//TODO: USER DAO
const bcrypt = require('bcrypt');
const User = require('../models/user');

module.exports = {};

//TODO: CREATE
module.exports.createUser = async (userObj) => {
    
    try {
        const { username, email, password, roles } = userObj;
        
        const user = new User({ username, email, password, roles });
        await user.save();
        
        return user;
    } catch (error) {
        throw new Error('Error occured when creating user');
    }

}

//TODO: GET
module.exports.getUser = async (email) => {
    try {
        const user = await User.findOne({ email });
        return user; 

    } catch (error) {
        throw new Error('User could not be found, please try again')
    }

}

//TODO: UPDATE
module.exports.updateUserPassword = async (userId, newPassword) => {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { password: hashedPassword },
            { new: true }
        );
        // if no user is found and updated return false
        if (!updatedUser) {
            return false;
        }
        // update was succesful return true
        return true;

    } catch (error) {
        console.error('Error occured when attempting to update password field');
        return false; // shows that update failed due to an error
    }
}