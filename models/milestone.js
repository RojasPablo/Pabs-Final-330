const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
    milestone: { type: String, required: true },
    timeElapsed: { type: Number, required: true },
    isCompleted: { type: Boolean, default: false }
});

module.exports = mongoose.model("milestones", milestoneSchema);


