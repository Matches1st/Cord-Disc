import { Timestamp } from 'firebase/firestore';

export type ThemeColor = 'white' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'indigo' | 'violet' | 'gray' | 'black';

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string; // "User" or custom
  photoURL: string | null;
  theme: ThemeColor;
  joinedRooms: string[];
  createdAt: Timestamp;
  isGuest: boolean;
}

export interface Room {
  id: string; // This is the 6-char code
  name: string;
  createdAt: Timestamp;
  createdBy: string;
  memberIds: string[]; // Array of UIDs for security rules/querying
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto: string | null;
  createdAt: Timestamp;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
}

export interface ThemeDefinition {
  bg: string;
  text: string;
  hover: string;
  border: string;
  muted: string;
  input: string;
  bubbleSelf: string;
  bubbleOther: string;
}
