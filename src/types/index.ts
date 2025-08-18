// Shared types for the showcase
export interface User {
  id: string;
  name: string;
  email: string;
  isOnline: boolean;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  timestamp: Date;
}

export interface AppState {
  users: User[];
  todos: Todo[];
  loading: boolean;
  error: string | null;
}