const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  roles: { type: [String], required: true },
  completedMilestones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'milestones' }],
  points: { type: Number, default: 0 },
  level: { type: String, default: 'Noob' },
});

userSchema.methods.updateLevel = function () {
  if (this.points === 0) {
    this.level = "Noob";
  } else if (this.points >= 20) {
    this.level = "Gym Bro";
  } else if (this.points >= 30) {
    this.level = "Swol Bro";
  } else if (this.points >= 40) {
    this.level = "Gym Rat";
  } else if (this.points >= 50) {
    this.level = "Greek God";
  }
};

module.exports = mongoose.model("users", userSchema);
