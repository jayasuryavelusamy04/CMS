import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render, mockApiResponse, mockApiError, generateMockCourse } from '../../../../utils/testUtils';
import CourseList from '../CourseList';
import { fetchCourses, deleteCourse } from '../../../../store/slices/courseSlice';

// Mock the redux actions
jest.mock('../../../../store/slices/courseSlice', () => ({
    fetchCourses: jest.fn(),
    deleteCourse: jest.fn()
}));

describe('CourseList Component', () => {
    const mockCourses = [
        generateMockCourse(),
        generateMockCourse({
            name: 'Physics',
            code: 'PHY101',
            class_section: {
                id: 2,
                class_name: 'Class 11',
                section: 'B'
            }
        })
    ];

    beforeEach(() => {
        (fetchCourses as jest.Mock).mockResolvedValue({ 
            payload: { items: mockCourses, total: mockCourses.length }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders course list correctly', async () => {
        render(<CourseList />);

        // Check loading state
        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        // Wait for courses to load
        await waitFor(() => {
            expect(screen.getByText(mockCourses[0].name)).toBeInTheDocument();
            expect(screen.getByText(mockCourses[1].name)).toBeInTheDocument();
        });

        // Check course details
        expect(screen.getByText(mockCourses[0].code)).toBeInTheDocument();
        expect(screen.getByText('Class 11-B')).toBeInTheDocument();
    });

    it('handles course filtering', async () => {
        render(<CourseList />);

        // Wait for component to load
        await waitFor(() => {
            expect(screen.getByText(mockCourses[0].name)).toBeInTheDocument();
        });

        // Test search
        const searchInput = screen.getByPlaceholderText(/search courses/i);
        fireEvent.change(searchInput, { target: { value: 'Physics' } });

        expect(fetchCourses).toHaveBeenCalledWith(expect.objectContaining({
            search: 'Physics'
        }));
    });

    it('handles course deletion', async () => {
        (deleteCourse as jest.Mock).mockResolvedValueOnce({ payload: mockCourses[0].id });

        render(<CourseList />);

        // Wait for component to load
        await waitFor(() => {
            expect(screen.getByText(mockCourses[0].name)).toBeInTheDocument();
        });

        // Find and click delete button
        const deleteButton = screen.getAllByText(/delete/i)[0];
        fireEvent.click(deleteButton);

        // Check confirmation dialog
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

        // Confirm deletion
        const confirmButton = screen.getByText(/yes/i);
        fireEvent.click(confirmButton);

        expect(deleteCourse).toHaveBeenCalledWith(mockCourses[0].id);
        await waitFor(() => {
            expect(screen.getByText(/deleted successfully/i)).toBeInTheDocument();
        });
    });

    it('handles network error', async () => {
        const errorMessage = 'Network error occurred';
        (fetchCourses as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        render(<CourseList />);

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    it('handles empty course list', async () => {
        (fetchCourses as jest.Mock).mockResolvedValueOnce({ 
            payload: { items: [], total: 0 }
        });

        render(<CourseList />);

        await waitFor(() => {
            expect(screen.getByText(/no courses found/i)).toBeInTheDocument();
        });
    });

    it('navigates to add course page', () => {
        render(<CourseList />);
        
        const addButton = screen.getByText(/add course/i);
        fireEvent.click(addButton);
        // Navigation assertions would go here
    });

    it('navigates to timetable page', async () => {
        render(<CourseList />);

        // Wait for courses to load
        await waitFor(() => {
            expect(screen.getByText(mockCourses[0].name)).toBeInTheDocument();
        });

        const viewTimetableButton = screen.getAllByText(/view timetable/i)[0];
        fireEvent.click(viewTimetableButton);
        // Navigation assertions would go here
    });

    it('filters courses by class section', async () => {
        render(<CourseList />);

        // Wait for component to load
        await waitFor(() => {
            expect(screen.getByText(mockCourses[0].name)).toBeInTheDocument();
        });

        const classFilter = screen.getByPlaceholderText(/filter by class/i);
        fireEvent.change(classFilter, { target: { value: '2' } }); // Class section ID

        expect(fetchCourses).toHaveBeenCalledWith(expect.objectContaining({
            class_section_id: '2'
        }));
    });

    it('filters courses by subject', async () => {
        render(<CourseList />);

        // Wait for component to load
        await waitFor(() => {
            expect(screen.getByText(mockCourses[0].name)).toBeInTheDocument();
        });

        const subjectFilter = screen.getByPlaceholderText(/filter by subject/i);
        fireEvent.change(subjectFilter, { target: { value: '1' } }); // Subject ID

        expect(fetchCourses).toHaveBeenCalledWith(expect.objectContaining({
            subject_id: '1'
        }));
    });
});
