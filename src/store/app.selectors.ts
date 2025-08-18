import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AppState } from '../types';

export const selectAppState = createFeatureSelector<AppState>('app');

export const selectUsers = createSelector(
  selectAppState,
  (state) => state.users
);

export const selectOnlineUsers = createSelector(
  selectUsers,
  (users) => users.filter(user => user.isOnline)
);

export const selectTodos = createSelector(
  selectAppState,
  (state) => state.todos
);

export const selectCompletedTodos = createSelector(
  selectTodos,
  (todos) => todos.filter(todo => todo.completed)
);

export const selectTodosByUser = (userId: string) => createSelector(
  selectTodos,
  (todos) => todos.filter(todo => todo.userId === userId)
);

export const selectLoading = createSelector(
  selectAppState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectAppState,
  (state) => state.error
);