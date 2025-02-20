const Salary = require('../models/Salary');
const FulltimeCaptain = require('../models/FulltimeCaptain');
const Admin = require('../models/Admin');
const asyncHandler = require('express-async-handler');

// Get all Salaries
exports.getAllSalaries = asyncHandler(async (req, res) => {
    try {
        const salaries = await Salary.find().lean(); // Fetch all salaries
        const salaryIds = salaries.map(salary => salary._id); // Get all salary IDs

        // Find captains and admins linked to these salaries
        const captains = await FulltimeCaptain.find({ salaryId: { $in: salaryIds } })
            .select('name salaryId')
            .lean();

        const admins = await Admin.find({ salaryId: { $in: salaryIds } })
            .select('name salaryId')
            .lean();

        // Map captain/admin names to salaries
        const salariesWithNames = salaries.map(salary => {
            const captain = captains.find(captain =>
                captain.salaryId?.toString() === salary._id.toString()
            );

            const admin = admins.find(admin =>
                admin.salaryId?.toString() === salary._id.toString()
            );

            return {
                ...salary,
                assignedTo: captain ? captain.name : admin ? admin.name : 'Unknown'
            };
        });

        res.status(200).json(salariesWithNames);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Update a salary by ID
exports.updateSalary = asyncHandler(async (req, res) => {
    const salaryId = req.params.id;
    const updates = req.body;

    try {
        const salary = await Salary.findByIdAndUpdate(salaryId, updates, { new: true });
        if (!salary) return res.status(404).json({ error: 'Salary not found' });
        res.status(200).json({ message: 'Salary updated successfully', salary });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});