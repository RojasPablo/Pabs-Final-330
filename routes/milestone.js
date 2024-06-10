const { Router } = require('express');
const router = Router({ mergeParams: true });

const User = require('../models/user');
const milestoneDao = require('../daos/milestone');
const { isAdmin, isAuthorized } = require('../middleware/middleware');

//TODO: POST / Create a new milestone
router.post("/", isAuthorized, isAdmin, async (req, res, next) => {
    try {
        const milestone = req.body;
        milestone.user = req.user._id; // Add the authenticated user's ID
        const createdMilestone = await milestoneDao.createMilestone(milestone);
        res.status(200).json({ message: 'Milestone Created Successfully', createdMilestone });
    } catch (e) {
        return res.status(403).json({ message: 'Failed to create a new milestone for users' });
    }
});

//TODO: GET / Get all milestones
router.get("/", isAuthorized, async (req, res, next) => {
    try {
        const milestones = await milestoneDao.getAllMilestones();
        const userId = req.user._id;
        const user = await User.findById(userId).populate('completedMilestones');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const response = {
            milestones,
            completedMilestones: user.completedMilestones
        };

        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({ message: 'Failed to find milestones' });
    }
});


//TODO: GET by ID / Get milestone by ID
router.get("/:id", isAuthorized, async (req, res, next) => {
    try {
        const milestoneId = req.params.id;
        const milestone = await milestoneDao.getMilestoneById(milestoneId);

        if (!milestone) {
            return res.status(404).json({ message: 'Unable to find milestone' });
        }
        return res.status(200).json(milestone);
    } catch (e) {
        return res.status(404).json({ message: 'Failed to retrieve milestone' });
    }
});

//TODO: PUT / Update milestone by ID
router.put("/:id", isAuthorized, async (req, res, next) => {
    try {
        const milestoneId = req.params.id;
        const newData = req.body;
        const { _id: userId, roles } = req.user;
        const userRole = roles.includes('admin') ? 'admin' : 'user';

        const updatedMilestone = await milestoneDao.updateMilestone(milestoneId, newData, userRole);

        if (newData.isCompleted === true && userRole === 'user') {
            const updatedUser = await User.findByIdAndUpdate(userId, { $addToSet: { completedMilestones: milestoneId } });
            if (!updatedUser) {
                throw new Error('Failed to append milestone to the user');
            }
            // Update user's points and level
            updatedUser.points += updatedMilestone.points;
            updatedUser.updateLevel();
            await updatedUser.save();
        }
        res.status(200).json(updatedMilestone);
    } catch (e) {
        if (e.message.includes('Unauthorized to update this milestone')) {
            res.status(403).json({ message: e.message });
        } else {
            console.error('Error in PUT /milestones/:id route:', e.message);
            res.status(500).json({ message: 'Unable to update milestone' });
        }
    }
});


//TODO: DELETE / Delete milestone by ID
router.delete("/:milestoneId", isAuthorized, isAdmin, async (req, res, next) => {
    const { milestoneId } = req.params;

    try {
        const result = await milestoneDao.deleteMilestone(milestoneId);
        if (!result) {
            return res.status(404).json({ message: 'Milestone not found' });
        }
        res.status(200).json({ message: 'Milestone successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting milestone' });
    }
});



module.exports = router;