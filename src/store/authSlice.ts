import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types/index';
import api from '../services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const loadUserFromStorage = (): User | null => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk<User, LoginPayload, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post('/login', credentials);
      const { access_token } = res.data;
      if (access_token) {
        localStorage.setItem('token', access_token);
        const meRes = await api.get('/me');
        const user: User = meRes.data;
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }
      return rejectWithValue('No access token received');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Login failed. Please check your credentials.';
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk<User, RegisterPayload, { rejectValue: string }>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post('/register', userData);
      const { access_token, data } = res.data;
      if (access_token) {
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(data));
        return data as User;
      }
      return rejectWithValue('Registration failed');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Registration failed. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (err: unknown) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Logout failed';
      return rejectWithValue(message);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const initialState: AuthState = {
  user: loadUserFromStorage(),
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    // ── Login ──────────────────────────────────────────────
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = localStorage.getItem('token');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Login failed';
      });

    // ── Register ───────────────────────────────────────────
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = localStorage.getItem('token');
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Registration failed';
      });

    // ── Logout ─────────────────────────────────────────────
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
