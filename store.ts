import { create } from 'zustand';
import { UserProfile, Room } from './types';

interface AppState {
  user: UserProfile | null;
  isLoading: boolean;
  currentRoom: Room | null;
  setUser: (user: UserProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
  setCurrentRoom: (room: Room | null) => void;
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  isLoading: true,
  currentRoom: null,
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setCurrentRoom: (currentRoom) => set({ currentRoom }),
  isSettingsOpen: false,
  setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen })
}));
