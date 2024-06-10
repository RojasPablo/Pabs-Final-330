const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
    milestone: { type: String, required: true },
    exercise: { type: String, required: true },
    timeElapsed: { type: Number, required: true },
    isCompleted: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    points: { type: Number, required: true },
});

module.exports = mongoose.model("milestones", milestoneSchema);