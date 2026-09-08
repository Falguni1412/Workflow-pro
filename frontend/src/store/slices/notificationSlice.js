import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../utils/api';
import { createAsyncThunk } from '@reduxjs/toolkit';

const workflowBaseURL = import.meta.env.VITE_WORKFLOW_SERVICE_URL || 'http://localhost:8000';
const wfApi = axios.create({ baseURL: workflowBaseURL, timeout: 30000 });
wfApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (userId, { rejectWithValue }) => {
  try {
    const { data } = await wfApi.get(`/api/notifications/${userId}`);
    return data;
  } catch (err) {
    // Fallback if workflow service is down
    return rejectWithValue('Notification service unavailable');
  }
});

export const markNotificationRead = createAsyncThunk('notifications/markRead', async (notifId) => {
  await wfApi.patch(`/api/notifications/${notifId}/read`);
  return notifId;
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async (userId) => {
  await wfApi.patch(`/api/notifications/user/${userId}/read-all`);
  return userId;
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {
    addNotification(state, { payload }) {
      state.items.unshift(payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload;
      })
      .addCase(fetchNotifications.rejected, (state) => { state.loading = false; })
      .addCase(markNotificationRead.fulfilled, (state, { payload }) => {
        const n = state.items.find(n => n.id === payload);
        if (n) n.is_read = true;
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.items.forEach(n => n.is_read = true);
      });
  }
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
