//TODO: MILESTONE DAO

const Milestone = require('../models/milestone');
// const User = require('../models/user');

module.exports = {};

//TODO: CREATE milestone / admin only
module.exports.createMilestone = async (milestoneObj) => {
    try {
        const milestone = new Milestone(milestoneObj)
        await milestone.save();
        return milestone;
    } catch (error) {
        throw new Error('Failed to create a new milestone for users');
    }
}

//TODO: READ all milestones / all users
module.exports.getAllMilestones = async () => {
    try {
        const allMilestones = await Milestone.find({});
        return allMilestones;
    } catch (error) {
        throw new Error('Failed to retrieve all milestones');
    }
}

//TODO: READ milestone by ID / all users
module.exports.getMilestoneById = async (milestoneId) => {
    try {
        const milestone = await Milestone.findById(milestoneId);
        if (!milestone) {
            return null;
        }
        return milestone;
    } catch (error) {
        throw new Error('Unable to find the milestone you were looking for');
    }
}

//TODO: UPDATE milestone by ID / admin only
module.exports.updateMilestone = async (milestoneId, newData, userRole) => {
    try {
        // Define what can be updated based on the user's role
        let updateData = {};

        // Admins can update any part of a milestone
        if (userRole === 'admin') {
            updateData = newData; 
        } 
        // Regular users can only update the isCompleted field
        else if (userRole === 'user' && newData.hasOwnProperty('isCompleted') && Object.keys(newData).length === 1) {
            updateData = { isCompleted: newData.isCompleted };
        } else {
            throw new Error('Unauthorized to update this milestone');
        }

        // Perform the update directly in the database
        const updatedMilestone = await Milestone.findByIdAndUpdate(milestoneId, updateData, { new: true, runValidators: true });
        if (!updatedMilestone) {
            throw new Error('Milestone not found or no update performed');
        }

        return updatedMilestone;
    } catch (error) {
        throw new Error('Error updating milestone: ' + error.message);
    }
};
//TODO: DELETE milestone by ID / admin only
module.exports.deleteMilestone = async (milestoneId) => {
    try {
        const milestone = await Milestone.findByIdAndDelete(milestoneId);
        if (!milestone) {
            return null;
        }
        return { message: 'Deleted the following milestone:', milestone};
    } catch (error) {
        console.error('Error deleting specified milestone');
    }
}
