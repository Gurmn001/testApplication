const express = require('express');
const router = express.Router();
const Assignment = require('../models/assignment'); // Adjust the path to your Assignment model file

// GET route to fetch assignments
router.get('/', async (req, res) => {
    try {
        // Assuming each assignment is linked to a user
        const assignments = await Assignment.find({ user: req.user._id });
        res.render('assignments', { assignments });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).send('Error fetching assignments');
    }
});

// POST handler for adding a new assignment
router.post('/add', async (req, res) => {
    try {
        // Retrieve form values
        const { title, description, dueDate } = req.body;

        // Create a new assignment instance
        const newAssignment = new Assignment({
            title,
            description,
            dueDate,
            user: req.user._id // Assuming you have user sessions set up
        });

        // Save the new assignment
        await newAssignment.save();

        // Redirect to the assignments list or display a success message
        res.redirect('/assignments');
    } catch (error) {
        console.error('Error adding assignment:', error);
        res.status(500).render('addAssignment', {
            message: 'An error occurred while adding the assignment.'
        });
    }
});

// GET route to display the edit form for an assignment
router.get('/edit/:id', async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).send('Assignment not found');
        }
        res.render('editAssignment', { assignment });
    } catch (error) {
        console.error('Error fetching assignment:', error);
        res.status(500).send('Error fetching assignment details');
    }
});

// POST route to submit the edited assignment
router.post('/edit/:id', async (req, res) => {
    try {
        const { title, description, dueDate } = req.body;
        const assignment = await Assignment.findByIdAndUpdate(req.params.id, {
            title,
            description,
            dueDate
        }, { new: true });

        res.redirect('/assignments');
    } catch (error) {
        console.error('Error updating assignment:', error);
        res.status(500).send('Error updating assignment');
    }
});
router.post('/delete/:id', async (req, res) => {
    try {
        await Assignment.findByIdAndDelete(req.params.id);
        res.redirect('/assignments');
    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).send('Error deleting assignment');
    }
});

router.get('/dashboard', async (req, res) => {
    try {
        const upcomingAssignments = await Assignment.find({
            user: req.user._id,
            completed: false,
            dueDate: { $gte: new Date() }
        }).sort({ dueDate: 1 });

        const completedAssignments = await Assignment.find({
            user: req.user._id,
            completed: true
        });

        const overdueAssignments = await Assignment.find({
            user: req.user._id,
            completed: false,
            dueDate: { $lt: new Date() }
        });

        res.render('dashboard', {
            upcomingAssignments,
            completedAssignments,
            overdueAssignments
        });
    } catch (error) {
        console.error('Error fetching assignments for dashboard:', error);
        res.status(500).send('Error fetching assignments');
    }
});


module.exports = router;
