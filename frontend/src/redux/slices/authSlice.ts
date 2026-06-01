import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/types'
import { currentUser } from '@/mocks/data'

interface AuthState {
  user: User | null
  // Access token kept in memory only (per security guidance — never localStorage).
  accessToken: string | null
  status: 'authenticated' | 'unauthenticated'
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: 'unauthenticated',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Mock sign-in: any credentials resolve to the demo customer.
    signIn: (state, action: PayloadAction<{ token: string; user?: User } | undefined>) => {
      state.user = action.payload?.user ?? currentUser
      state.accessToken = action.payload?.token ?? 'mock.jwt.token'
      state.status = 'authenticated'
    },
    signOut: (state) => {
      state.user = null
      state.accessToken = null
      state.status = 'unauthenticated'
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) state.user = { ...state.user, ...action.payload }
    },
  },
})

export const { signIn, signOut, updateProfile } = authSlice.actions
export default authSlice.reducer
