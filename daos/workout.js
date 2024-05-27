//TODO: WOROUT DAO
const Workout = require('../models/workout');

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
module.exports.getAllWorkoutLogs = async () => {
    try {
        const workouts = await Workout.find({});
        return workouts;
    } catch (error) {
        console.error('Error retrieving workout logs:', error);
        throw new Error('Failed to retrieve workout sessions');
    }
}

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
            throw new Error('No new updates were made to workout log');
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