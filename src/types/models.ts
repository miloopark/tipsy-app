export interface User {
  id: string;
  email: string;
  nickname: string;
  createdAt: number;
  /** Lowercase mirror used for case-insensitive lookups. */
  nicknameLower?: string;
  // Firebase auth fields
  firebaseUid?: string;
  phone?: string;
  phoneHash?: string;
  photoURL?: string;
  // Stats for leaderboard
  gamesPlayed?: number;
  gamesWon?: number;
  totalPoints?: number;
}

export interface FriendRequest {
  id: string;
  fromUser: string;
  toUser: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface Room {
  id: string;
  name: string;
  createdBy: string;
  members: string[];
  localPlayers?: { name: string }[];
  createdAt: number;
  isPublic?: boolean;
  status?: 'open' | 'in-progress' | 'finished';
  maxPlayers?: number;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  createdAt: number;
  expiresAt?: number;
}

export interface GameState {
  id: string;
  roomId: string;
  phase: 'idle' | 'playing';
  turnUser?: string;
  category?: string;
  payload?: any;
  updatedAt: number;
}
