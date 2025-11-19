import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../../stores/notificationStore';
import { NotificationType } from '../../types';

const NotificationContainer: React.FC = () => {
  const { notifications, remove } = useNotificationStore();

  const getNotificationStyles = (type: NotificationType) => {
    const baseStyles = 'px-4 py-2 rounded-md mb-2 shadow-lg text-white flex items-center justify-between';
    
    switch (type) {
      case NotificationType.SUCCESS:
        return `${baseStyles} bg-green-500`;
      case NotificationType.ERROR:
        return `${baseStyles} bg-red-500`;
      case NotificationType.WARNING:
        return `${baseStyles} bg-yellow-500`;
      default:
        return `${baseStyles} bg-blue-500`;
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return '✅';
      case NotificationType.ERROR:
        return '❌';
      case NotificationType.WARNING:
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className={getNotificationStyles(notification.type)}
          >
            <div className="flex items-center">
              <span className="mr-2">{getNotificationIcon(notification.type)}</span>
              <span>{notification.message}</span>
            </div>
            <button 
              onClick={() => remove(notification.id)}
              className="ml-2 text-white hover:opacity-75"
            >
              ✖
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationContainer;
