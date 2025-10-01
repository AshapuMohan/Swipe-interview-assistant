import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import interviewReducer from './slices/interviewSlice';
import candidateReducer from './slices/candidateSlice';

const persistConfig = {
  key: 'crisp-interview-assistant',
  storage,
  whitelist: ['interview', 'candidates'], // Only persist these reducers
};

const rootReducer = combineReducers({
  interview: interviewReducer,
  candidates: candidateReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

// Export the root reducer type for proper typing
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
