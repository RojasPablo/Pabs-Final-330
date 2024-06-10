//TODO: WOROUT DAO
const { query } = require('express');
const Workout = require('../models/workout');
const { search } = require('../routes/workout');

module.exports = {};

//TODO: CREATE Workout log / all users
module.exports.createWorkoutLog = async (workoutObj, userId) => {
    try {
        const workout = new Workout({...workoutObj, user: userId });
        await workout.save();
        return workout;
    } catch (error) {
        throw new Error('Failed to create a workout log for your session.')
    }
}
//TODO: READ All workout logs
module.exports.getAllWorkoutLogs = async (userId, query) => {
    try {
        let workouts;
        if (query) {
            // Perform text search if query is provided
            workouts = await Workout.find({ user: userId, $text: { $search: query } }).sort({ datePerformed: -1 }).exec();
        } else {
            // Fetch all workouts if no query is provided in order of newest first
            workouts = await Workout.find({ user: userId }).sort({ datePerformed: -1 }).exec();
        }
        return workouts;
    } catch (error) {
        throw new Error('Failed to retrieve workout sessions');
    }
};

//TODO: READ workout log by id
module.exports.getWorkoutLogById = async (workoutId) => {
    try {
        const workout = await Workout.findById(workoutId);
        if (!workout) {
            return null;
        }
        return workout;
    } catch (error) {
        throw new Error('Failed to retrieve your requested workout session');
    }
}


//TODO: UPDATE Workout log / all users
module.exports.updateWorkoutLog = async (logId, newLogData) => {
    try {
        // check if new data is present
        if (!newLogData) {
            throw new Error('No new workout details provided');
        }
        // update an item by its _id with newLogData
        const updatedSession = await Workout.findByIdAndUpdate(logId, newLogData, { new: true });
        // checks if there was an item to update 
        if (!updatedSession) {
            return null;
        }
        return updatedSession;
    } catch (error) {
        throw new Error('Error updating session');
    }
}

//TODO: DELETE workout log by id
module.exports.deleteWorkoutLog = async (workoutId) => {
    try {
        const workout = await Workout.findOneAndDelete({ _id: workoutId});
        if (!workout) {
            return null;
        }
        return { message: 'deleted the following data:', workout };
    } catch (e) {
        console.error('Error deleting workout log');
    }
}
