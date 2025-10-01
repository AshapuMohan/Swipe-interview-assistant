import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Candidate } from '../../types';

interface CandidateState {
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CandidateState = {
  candidates: [],
  selectedCandidate: null,
  isLoading: false,
  error: null,
};

const candidateSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action: PayloadAction<Candidate>) => {
      state.candidates.push(action.payload);
      state.error = null;
    },

    updateCandidate: (state, action: PayloadAction<Candidate>) => {
      const index = state.candidates.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.candidates[index] = action.payload;
      }
    },

    deleteCandidate: (state, action: PayloadAction<string>) => {
      state.candidates = state.candidates.filter(c => c.id !== action.payload);
      if (state.selectedCandidate?.id === action.payload) {
        state.selectedCandidate = null;
      }
    },

    selectCandidate: (state, action: PayloadAction<string>) => {
      const candidate = state.candidates.find(c => c.id === action.payload);
      state.selectedCandidate = candidate || null;
    },

    clearSelectedCandidate: (state) => {
      state.selectedCandidate = null;
    },

    setCandidates: (state, action: PayloadAction<Candidate[]>) => {
      state.candidates = action.payload;
      state.error = null;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    updateCandidateStatus: (state, action: PayloadAction<{ id: string; status: Candidate['status'] }>) => {
      const candidate = state.candidates.find(c => c.id === action.payload.id);
      if (candidate) {
        candidate.status = action.payload.status;
        candidate.updatedAt = new Date().toISOString();
      }
    },

    updateCandidateScore: (state, action: PayloadAction<{ id: string; score: number; aiSummary?: string }>) => {
      const candidate = state.candidates.find(c => c.id === action.payload.id);
      if (candidate) {
        candidate.score = action.payload.score;
        if (action.payload.aiSummary) {
          candidate.aiSummary = action.payload.aiSummary;
        }
        candidate.updatedAt = new Date().toISOString();
      }
    },
  },
});

export const {
  addCandidate,
  updateCandidate,
  deleteCandidate,
  selectCandidate,
  clearSelectedCandidate,
  setCandidates,
  setLoading,
  setError,
  updateCandidateStatus,
  updateCandidateScore,
} = candidateSlice.actions;

export default candidateSlice.reducer;
