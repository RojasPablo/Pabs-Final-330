const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    exercise: { type: String, required: true },
    sets: { type: Number, required: false },
    reps: { type: Number, required: false },
    weight: { type: Number, required: false },
    timeElapsed: { type: Number, required: true },
    datePerformed: { type: Date, required: true, default: Date.now },
});

workoutSchema.index({ exercise: 'text' });

module.exports = mongoose.model("workouts", workoutSchema);
