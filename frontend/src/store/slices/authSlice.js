import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('authToken', data.token);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('authToken', data.token);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Request failed');
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/reset-password', payload);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Reset failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('authToken'),
    loading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('authToken'),
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('authToken');
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(loginUser.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.user = payload;
      state.token = payload.token;
      state.isAuthenticated = true;
    });
    builder.addCase(loginUser.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    });

    // Register
    builder.addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(registerUser.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.user = payload;
      state.token = payload.token;
      state.isAuthenticated = true;
    });
    builder.addCase(registerUser.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    });

    // Fetch Me
    builder.addCase(fetchMe.fulfilled, (state, { payload }) => {
      state.user = { ...state.user, ...payload };
    });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
