const { Router } = require("express");
const router = Router();

const authRoutes = require('./auth');
const milestoneRoutes = require('./milestone');
const workoutRoutes = require('./workout');

router.use('/auth', authRoutes);
router.use('/milestones', milestoneRoutes);
router.use('/workouts', workoutRoutes);

module.exports = router;