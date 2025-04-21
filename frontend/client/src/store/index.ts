import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import admissionReducer from './slices/admissionSlice';
import studentProfileReducer from './slices/studentProfileSlice';
import feeReducer from './slices/feeSlice';
import staffReducer from './slices/staffSlice';
import courseReducer from './slices/courseSlice';
import timetableReducer from './slices/timetableSlice';
import attendanceReducer from './slices/attendanceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admission: admissionReducer,
    studentProfile: studentProfileReducer,
    fees: feeReducer,
    staff: staffReducer,
    course: courseReducer,
    timetable: timetableReducer,
    attendance: attendanceReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
