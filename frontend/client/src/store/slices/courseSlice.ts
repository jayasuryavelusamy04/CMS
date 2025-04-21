import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface ClassSection {
    id: number;
    name: string;
    grade: string;
    section: string;
    academic_year: string;
}

export interface Course {
    id: number;
    name: string;
    code: string;
    class_section_id: number;
    subject_id: number;
    start_date: string;
    end_date: string;
    description?: string;
    class_section?: ClassSection;
    subject?: {
        id: number;
        name: string;
    };
}

export interface CourseState {
    courses: Course[];
    totalCourses: number;
    classSections: ClassSection[];
    loading: boolean;
    error: string | null;
}

const initialState: CourseState = {
    courses: [],
    totalCourses: 0,
    classSections: [],
    loading: false,
    error: null
};

export const fetchCourses = createAsyncThunk(
    'course/fetchCourses',
    async (filters: any) => {
        const { search, class_section_id, subject_id, page, pageSize } = filters;
        const params = new URLSearchParams({
            skip: (page * pageSize).toString(),
            limit: pageSize.toString(),
            ...(search && { search }),
            ...(class_section_id && { class_section_id: class_section_id.toString() }),
            ...(subject_id && { subject_id: subject_id.toString() })
        });
        const response = await api.get(`/courses/?${params}`);
        return response.data;
    }
);

export const createCourse = createAsyncThunk(
    'course/createCourse',
    async (courseData: Omit<Course, 'id'>) => {
        const response = await api.post('/courses/', courseData);
        return response.data;
    }
);

export const updateCourse = createAsyncThunk(
    'course/updateCourse',
    async ({ id, data }: { id: number; data: Partial<Course> }) => {
        const response = await api.put(`/courses/${id}`, data);
        return response.data;
    }
);

export const deleteCourse = createAsyncThunk(
    'course/deleteCourse',
    async (id: number) => {
        await api.delete(`/courses/${id}`);
        return id;
    }
);

export const fetchClassSections = createAsyncThunk(
    'course/fetchClassSections',
    async () => {
        const response = await api.get('/class-sections/');
        return response.data;
    }
);

export const createClassSection = createAsyncThunk(
    'course/createClassSection',
    async (classSection: Omit<ClassSection, 'id'>) => {
        const response = await api.post('/class-sections/', classSection);
        return response.data;
    }
);

const courseSlice = createSlice({
    name: 'course',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Courses
            .addCase(fetchCourses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCourses.fulfilled, (state, action) => {
                state.courses = action.payload.items;
                state.totalCourses = action.payload.total;
                state.loading = false;
            })
            .addCase(fetchCourses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch courses';
            })
            // Create Course
            .addCase(createCourse.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCourse.fulfilled, (state, action) => {
                state.courses.push(action.payload);
                state.totalCourses += 1;
                state.loading = false;
            })
            .addCase(createCourse.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create course';
            })
            // Update Course
            .addCase(updateCourse.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCourse.fulfilled, (state, action) => {
                const index = state.courses.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.courses[index] = action.payload;
                }
                state.loading = false;
            })
            .addCase(updateCourse.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update course';
            })
            // Delete Course
            .addCase(deleteCourse.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCourse.fulfilled, (state, action) => {
                state.courses = state.courses.filter(c => c.id !== action.payload);
                state.totalCourses -= 1;
                state.loading = false;
            })
            .addCase(deleteCourse.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete course';
            })
            // Fetch Class Sections
            .addCase(fetchClassSections.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClassSections.fulfilled, (state, action) => {
                state.classSections = action.payload;
                state.loading = false;
            })
            .addCase(fetchClassSections.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch class sections';
            })
            // Create Class Section
            .addCase(createClassSection.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createClassSection.fulfilled, (state, action) => {
                state.classSections.push(action.payload);
                state.loading = false;
            })
            .addCase(createClassSection.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create class section';
            });
    }
});

export default courseSlice.reducer;
