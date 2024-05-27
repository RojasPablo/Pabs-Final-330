const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    exercise: { type: String, required: true },
    timeElapsed: { type: Number, required: true },
    datePerformed: { type: Date, required: true, default: Date.now }, //default to current date upon log submission
})

module.exports = mongoose.model("workouts", workoutSchema);