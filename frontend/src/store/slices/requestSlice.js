import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchRequests = createAsyncThunk('requests/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/requests', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch requests');
  }
});

export const fetchRequestById = createAsyncThunk('requests/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/requests/${id}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch request');
  }
});

export const createRequest = createAsyncThunk('requests/create', async (requestData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/requests', requestData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create request');
  }
});

export const actionRequest = createAsyncThunk('requests/action', async ({ id, action, comments }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/requests/${id}/action`, { action, comments });
    return { id, ...data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Action failed');
  }
});

export const addComment = createAsyncThunk('requests/addComment', async ({ requestId, commentText }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/requests/${requestId}/comments`, { commentText });
    return { requestId, comment: data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add comment');
  }
});

export const fetchDashboardStats = createAsyncThunk('requests/dashboardStats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/requests/dashboard/stats');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
  }
});

const requestSlice = createSlice({
  name: 'requests',
  initialState: {
    list: [],
    selected: null,
    stats: null,
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearSelected(state) { state.selected = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchRequests.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchRequests.fulfilled, (state, { payload }) => { state.loading = false; state.list = payload; })
      .addCase(fetchRequests.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })

      // Fetch by id
      .addCase(fetchRequestById.pending, (state) => { state.loading = true; })
      .addCase(fetchRequestById.fulfilled, (state, { payload }) => { state.loading = false; state.selected = payload; })
      .addCase(fetchRequestById.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })

      // Create
      .addCase(createRequest.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(createRequest.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        state.list.unshift(payload);
      })
      .addCase(createRequest.rejected, (state, { payload }) => { state.actionLoading = false; state.error = payload; })

      // Action (approve/reject/send back)
      .addCase(actionRequest.pending, (state) => { state.actionLoading = true; })
      .addCase(actionRequest.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        const idx = state.list.findIndex(r => r.id === payload.id);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], status: payload.status };
        if (state.selected?.id === payload.id) state.selected = { ...state.selected, status: payload.status };
      })
      .addCase(actionRequest.rejected, (state, { payload }) => { state.actionLoading = false; state.error = payload; })

      // Stats
      .addCase(fetchDashboardStats.fulfilled, (state, { payload }) => { state.stats = payload; })

      // Comment
      .addCase(addComment.fulfilled, (state, { payload }) => {
        if (state.selected?.id === payload.requestId) {
          state.selected.comments = [...(state.selected.comments || []), payload.comment];
        }
      });
  }
});

export const { clearSelected, clearError } = requestSlice.actions;
export default requestSlice.reducer;
