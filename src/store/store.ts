import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { scryfallApi } from '@/api/scryfallApi';
import { edhrecApi, edhrecDeckApi } from '@/api/edhrecApi';
import decksReducer from './slices/decksSlice';
import searchReducer from './slices/searchSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    decks: decksReducer,
    search: searchReducer,
    ui: uiReducer,
    [scryfallApi.reducerPath]: scryfallApi.reducer,
    [edhrecApi.reducerPath]: edhrecApi.reducer,
    [edhrecDeckApi.reducerPath]: edhrecDeckApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(scryfallApi.middleware, edhrecApi.middleware, edhrecDeckApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
