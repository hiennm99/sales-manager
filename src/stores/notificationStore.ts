import { create } from 'zustand';
import type { Notification } from '@types';

interface NotificationState {
  notifications: Notification[];
  add: (notification: Notification) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  
  add: (notification) => set((state) => ({
    notifications: [...state.notifications, notification]
  })),
  
  remove: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clear: () => set({ notifications: [] })
}));
