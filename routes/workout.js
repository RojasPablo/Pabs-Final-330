const { Router } = require('express');
const router = Router({ mergeParams: true });
const { isAuthorized } = require('../middleware/middleware');
const workoutDao = require('../daos/workout');

//TODO: POST / createWorkoutLog()
router.post("/", isAuthorized, async (req, res, next) => {
    try{
        const workout = req.body;
        const userId = req.user._id
        const createdWorkout = await workoutDao.createWorkoutLog(workout, userId);
        // should send 200 to user and store workout log
        res.status(200).json(createdWorkout);
    } catch (e) {
        // failed to create workout log
        return res.status(403).json({ message: 'Failed to create workout log'});
    }
})

//TODO: GET / getAllWorkoutLogs()
router.get("/", isAuthorized, async (req, res, next) => {
    try {
        const workouts = await workoutDao.getAllWorkoutLogs();
        workouts = workouts.map(workout => {
            const workoutObject = workout.toObject();
            if (workoutObject.datePerformed) {
                workoutObject.datePerformed = workoutObject.datePerformed.toDateString()
            }
            return workoutObject;
        })

        return res.status(200).json(workouts);
    } catch (error) {
        return res.status(500).json({ message: "Failed to find workouts" });
    }
})

//TODO: GET / getWorkoutById()
router.get("/:id", async (req, res, next) => {
    try {

        const workoutId = req.params.id;
        const workout = await workoutDao.getWorkoutLogById(workoutId);
        
        if (!workout) {
            return res.status(404).json({ message: 'Workout log not found' });
        }
        if (workout) {
            workout.datePerformed = workout.datePerformed.toDateString();
        }
        return res.status(200).json(workout);
    } catch (error) {
        return res.status(404).json({ message: 'failed to retrieve workout'});
    }
});


//TODO: PUT / updateWorkoutLog
router.put("/:id", async (req, res, next) => {
    try {
        const workoutId = req.params.id;
        const newWorkoutData = req.body;

        if (!newWorkoutData) {
            return res.status(400).json({ message: 'New workout data required'});
        }
        const updatedLog = await workoutDao.updateWorkoutLog(workoutId, newWorkoutData);

        return res.status(200).json({ message: 'Update Succesful', workout: updatedLog})

    } catch (error) {
        return res.status(500).json({ message: 'failed to update workout log'});
    }
})


//TODO: DELETE / deleteWorkoutLog()
router.delete("/:workoutId", async (req, res, next) => {
    try {
        const { workoutId } = req.params;
        const deletedWorkout = await workoutDao.deleteWorkoutLog(workoutId);

        if (deletedWorkout) {
            res.status(200).json({ message: 'Workout deleted' });
        } else {
            res.status(404).json({ message: 'Workout not found with provided ID'});
        }
    } catch (e) {
        next (e);
    }
})

module.exports = router;