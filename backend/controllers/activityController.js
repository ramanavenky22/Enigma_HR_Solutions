const db = require('../config/db');

// Get all activities
exports.getActivities = async (req, res) => {
  try {
    const activities = await db.query(
      `SELECT * FROM activities ORDER BY timestamp DESC LIMIT 10`
    );
    
    // Map timestamps to ISO strings for proper JSON serialization
    const formattedActivities = activities.map(activity => ({
      ...activity,
      timestamp: activity.timestamp.toISOString()
    }));
    
    res.json(formattedActivities);
  } catch (err) {
    console.error('❌ Error fetching activities:', err);
    res.status(500).json({ message: 'Internal error' });
  }
};

// Create a new activity
exports.createActivity = async (req, res) => {
  const { title, description, icon, created_by } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO activities (title, description, icon, created_by, timestamp) 
       VALUES (?, ?, ?, ?, NOW())`,
      [title, description, icon, created_by]
    );

    const activity = await db.query(
      'SELECT * FROM activities WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(activity[0]);
  } catch (err) {
    console.error('❌ Error creating activity:', err);
    res.status(500).json({ message: 'Internal error' });
  }
};

// Delete an activity
exports.deleteActivity = async (req, res) => {
  const { id } = req.params;

  try {
    // First check if activity exists
    const activity = await db.query('SELECT id FROM activities WHERE id = ?', [id]);
    
    if (activity.length === 0) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Delete the activity
    await db.query('DELETE FROM activities WHERE id = ?', [id]);
    
    res.status(200).json({ message: 'Activity deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting activity:', err);
    res.status(500).json({ message: 'Internal error' });
  }
};
