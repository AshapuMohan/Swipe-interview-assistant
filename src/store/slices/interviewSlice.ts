import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InterviewSession, Question, Answer } from '../../types';

interface InterviewState {
  currentSession: InterviewSession | null;
  isLoading: boolean;
  error: string | null;
  hasUnfinishedSession: boolean;
}

const initialState: InterviewState = {
  currentSession: null,
  isLoading: false,
  error: null,
  hasUnfinishedSession: false,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    startInterview: (state, action: PayloadAction<{ candidateId: string; questions: Question[] }>) => {
      const { candidateId, questions } = action.payload;
      state.currentSession = {
        id: `session-${Date.now()}`,
        candidateId,
        questions,
        currentQuestionIndex: 0,
        answers: [],
        startTime: new Date().toISOString(),
        isComplete: false,
        isPaused: false,
      };
      state.hasUnfinishedSession = true;
      state.error = null;
    },

    submitAnswer: (state, action: PayloadAction<Answer>) => {
      if (state.currentSession) {
        state.currentSession.answers.push(action.payload);
        state.currentSession.currentQuestionIndex += 1;

        // Check if interview is complete
        if (state.currentSession.currentQuestionIndex >= state.currentSession.questions.length) {
          state.currentSession.isComplete = true;
          state.currentSession.endTime = new Date().toISOString();
          state.hasUnfinishedSession = false;
        }
      }
    },

    pauseInterview: (state) => {
      if (state.currentSession) {
        state.currentSession.isPaused = true;
      }
    },

    resumeInterview: (state) => {
      if (state.currentSession) {
        state.currentSession.isPaused = false;
      }
    },

    completeInterview: (state, action: PayloadAction<{ totalScore: number; aiSummary: string }>) => {
      if (state.currentSession) {
        state.currentSession.isComplete = true;
        state.currentSession.endTime = new Date().toISOString();
        state.currentSession.totalScore = action.payload.totalScore;
        state.currentSession.aiSummary = action.payload.aiSummary;
        state.hasUnfinishedSession = false;
      }
    },

    clearSession: (state) => {
      state.currentSession = null;
      state.hasUnfinishedSession = false;
      state.error = null;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    updateCurrentQuestionIndex: (state, action: PayloadAction<number>) => {
      if (state.currentSession) {
        state.currentSession.currentQuestionIndex = action.payload;
      }
    },
  },
});

export const {
  startInterview,
  submitAnswer,
  pauseInterview,
  resumeInterview,
  completeInterview,
  clearSession,
  setLoading,
  setError,
  updateCurrentQuestionIndex,
} = interviewSlice.actions;

export default interviewSlice.reducer;
