const mongoose = require('mongoose');

const userScehma = new mongoose.Schema({
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    roles: { type: [String], required: true },
    completedMilestones: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'milestones'
    }]
});

module.exports = mongoose.model("users", userScehma);