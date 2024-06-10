const Milestone = require('../models/milestone');
const User = require('../models/user');

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
        let updateData = {};

        if (userRole === 'admin') {
            updateData = newData; 
        } else if (userRole === 'user' && newData.hasOwnProperty('isCompleted') && Object.keys(newData).length === 1) {
            updateData = { isCompleted: newData.isCompleted };
        } else {
            const error = new Error('Unauthorized to update this milestone');
            error.status = 403;
            throw error;
        }

        const updatedMilestone = await Milestone.findByIdAndUpdate(milestoneId, updateData, { new: true, runValidators: true });
        if (!updatedMilestone) {
            throw new Error('Milestone not found or no update performed');
        }

        return updatedMilestone;
    } catch (error) {
        if (error.status !== 403) {
            console.error('Unexpected error updating milestone:', error.message);
        }
        throw error;
    }
};



//TODO: DELETE milestone by ID / admin only
module.exports.deleteMilestone = async (milestoneId) => {
    try {
        const milestone = await Milestone.findByIdAndDelete(milestoneId);
        if (!milestone) {
            throw new Error('Milestone not found');
        }
        return { message: 'Deleted the following milestone:', milestone };
    } catch (error) {
        throw new Error('Error deleting specified milestone: ' + error.message);
    }
}