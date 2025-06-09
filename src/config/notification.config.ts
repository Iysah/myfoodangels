// Notification configuration: user preference templates
export default {
    templates: {
      newFollower: '{{userName}} started following you.',
      newMessage: 'You have a new message from {{senderName}}.',
      trialUpdate: 'Your trial application status has been updated to {{status}}.',
      // Add more templates as needed
    },
    userPreferences: {
      pushEnabled: true,
      inAppEnabled: true,
      emailEnabled: false, // Example preference
    },
  };