const { query } = require('../config/db');

// Get all notifications for a user
const getNotifications = async (req, res) => {
  try {
    const userId = req.auth.sub; // Get user ID from Auth0 token
    const queryStr = `
      SELECT 
        n.id,
        n.type,
        n.message,
        n.created_at,
        n.read,
        n.action_type,
        n.action_data
      FROM notifications n
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
    `;
    
    const results = await query(queryStr, [userId]);
    
    // Transform results to match frontend format
    const notifications = results.map(n => ({
      id: n.id,
      icon: getIconForType(n.type),
      message: n.message,
      time: formatTime(n.created_at),
      read: n.read === 1,
      actionLabel: getActionLabel(n.action_type),
      actionType: n.action_type,
      actionData: n.action_data ? JSON.parse(n.action_data) : undefined
    }));

    res.json(notifications);
  } catch (err) {
    console.error('Error in getNotifications:', err);
    res.status(500).json({ 
      error: 'Error fetching notifications',
      details: err.message 
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.sub;
    
    const queryStr = 'UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?';
    const result = await query(queryStr, [id, userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error in markAsRead:', err);
    res.status(500).json({ 
      error: 'Error marking notification as read',
      details: err.message 
    });
  }
};

// Helper functions
function getIconForType(type) {
  const icons = {
    'employee_joined': '👤',
    'report_ready': '📈',
    'meeting_scheduled': '📅',
    'default': '📫'
  };
  return icons[type] || icons.default;
}

function formatTime(date) {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 48) return 'Yesterday';
  return notificationDate.toLocaleDateString();
}

function getActionLabel(actionType) {
  const labels = {
    'profile': 'View Profile',
    'report': 'View Report',
    'meeting': 'View Meeting'
  };
  return labels[actionType];
}

module.exports = {
  getNotifications,
  markAsRead
};
