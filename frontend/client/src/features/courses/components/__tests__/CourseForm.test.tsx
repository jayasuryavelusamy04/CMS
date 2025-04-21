import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render, mockApiResponse, mockApiError, generateMockCourse } from '../../../../utils/testUtils';
import CourseForm from '../CourseForm';
import { createCourse, updateCourse } from '../../../../store/slices/courseSlice';
import dayjs from 'dayjs';

// Mock the redux actions
jest.mock('../../../../store/slices/courseSlice', () => ({
    createCourse: jest.fn(),
    updateCourse: jest.fn()
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ id: undefined }),
    useNavigate: () => jest.fn()
}));

describe('CourseForm Component', () => {
    const mockCourse = generateMockCourse();
    const mockFormData = {
        name: 'Advanced Mathematics',
        code: 'MATH301',
        class_section_id: 1,
        subject_id: 1,
        duration: [dayjs('2024-01-01'), dayjs('2024-12-31')],
        description: 'Advanced level mathematics course'
    };

    beforeEach(() => {
        (createCourse as jest.Mock).mockResolvedValue({ payload: mockCourse });
        (updateCourse as jest.Mock).mockResolvedValue({ payload: mockCourse });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders form fields correctly', () => {
        render(<CourseForm />);

        expect(screen.getByLabelText(/course name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/course code/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/class & section/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/course duration/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('handles form submission for new course', async () => {
        render(<CourseForm />);

        // Fill form fields
        fireEvent.change(screen.getByLabelText(/course name/i), 
            { target: { value: mockFormData.name } });
        fireEvent.change(screen.getByLabelText(/course code/i), 
            { target: { value: mockFormData.code } });
        fireEvent.change(screen.getByLabelText(/class & section/i), 
            { target: { value: mockFormData.class_section_id } });
        fireEvent.change(screen.getByLabelText(/subject/i), 
            { target: { value: mockFormData.subject_id } });
        fireEvent.change(screen.getByLabelText(/description/i), 
            { target: { value: mockFormData.description } });

        // Set date range
        const dateRangePicker = screen.getByLabelText(/course duration/i);
        fireEvent.change(dateRangePicker, {
            target: { value: mockFormData.duration }
        });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /create/i }));

        await waitFor(() => {
            expect(createCourse).toHaveBeenCalledWith(expect.objectContaining({
                name: mockFormData.name,
                code: mockFormData.code,
                class_section_id: mockFormData.class_section_id,
                subject_id: mockFormData.subject_id,
                start_date: mockFormData.duration[0].format('YYYY-MM-DD'),
                end_date: mockFormData.duration[1].format('YYYY-MM-DD'),
                description: mockFormData.description
            }));
        });

        expect(screen.getByText(/course created successfully/i)).toBeInTheDocument();
    });

    it('validates required fields', async () => {
        render(<CourseForm />);

        // Submit form without filling required fields
        fireEvent.click(screen.getByRole('button', { name: /create/i }));

        await waitFor(() => {
            expect(screen.getByText(/course name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/course code is required/i)).toBeInTheDocument();
            expect(screen.getByText(/please select class and section/i)).toBeInTheDocument();
            expect(screen.getByText(/please select subject/i)).toBeInTheDocument();
            expect(screen.getByText(/please select course duration/i)).toBeInTheDocument();
        });

        expect(createCourse).not.toHaveBeenCalled();
    });

    it('validates course code format', async () => {
        render(<CourseForm />);

        // Enter invalid course code
        fireEvent.change(screen.getByLabelText(/course code/i), 
            { target: { value: '123' } });
        fireEvent.click(screen.getByRole('button', { name: /create/i }));

        await waitFor(() => {
            expect(screen.getByText(/invalid course code format/i)).toBeInTheDocument();
        });
    });

    it('handles API errors', async () => {
        const errorMessage = 'Course code already exists';
        (createCourse as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        render(<CourseForm />);

        // Fill and submit form
        fireEvent.change(screen.getByLabelText(/course code/i), 
            { target: { value: mockFormData.code } });
        fireEvent.click(screen.getByRole('button', { name: /create/i }));

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    it('validates date range', async () => {
        render(<CourseForm />);

        // Set invalid date range (end date before start date)
        const dateRangePicker = screen.getByLabelText(/course duration/i);
        fireEvent.change(dateRangePicker, {
            target: { value: [dayjs('2024-12-31'), dayjs('2024-01-01')] }
        });

        fireEvent.click(screen.getByRole('button', { name: /create/i }));

        await waitFor(() => {
            expect(screen.getByText(/end date must be after start date/i)).toBeInTheDocument();
        });
    });

    it('handles form cancellation', () => {
        render(<CourseForm />);

        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
        // Navigation assertions would go here
    });

    it('loads existing course data for editing', async () => {
        // Mock useParams to return an ID
        jest.spyOn(require('react-router-dom'), 'useParams')
            .mockReturnValue({ id: '1' });

        const existingCourse = generateMockCourse(mockFormData);

        render(<CourseForm />, {
            preloadedState: {
                course: {
                    courses: [existingCourse],
                    loading: false,
                    error: null
                }
            }
        });

        await waitFor(() => {
            expect(screen.getByLabelText(/course name/i)).toHaveValue(existingCourse.name);
            expect(screen.getByLabelText(/course code/i)).toHaveValue(existingCourse.code);
        });
    });
});
