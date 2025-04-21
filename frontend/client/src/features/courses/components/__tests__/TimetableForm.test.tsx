import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render, mockApiResponse, mockApiError, generateMockTimetableSlot } from '../../../../utils/testUtils';
import TimetableForm from '../TimetableForm';
import { createTimetableSlot, updateTimetableSlot, deleteTimetableSlot, fetchTimetableSlots } from '../../../../store/slices/courseSlice';
import dayjs from 'dayjs';

// Mock the redux actions
jest.mock('../../../../store/slices/courseSlice', () => ({
    createTimetableSlot: jest.fn(),
    updateTimetableSlot: jest.fn(),
    deleteTimetableSlot: jest.fn(),
    fetchTimetableSlots: jest.fn()
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ id: '1' }),
    useNavigate: () => jest.fn()
}));

describe('TimetableForm Component', () => {
    const mockSlot = generateMockTimetableSlot();
    const mockSlots = [mockSlot];
    const mockTeachers = [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, first_name: 'Jane', last_name: 'Smith' }
    ];

    beforeEach(() => {
        (fetchTimetableSlots as jest.Mock).mockResolvedValue({ payload: { items: mockSlots }});
        (createTimetableSlot as jest.Mock).mockResolvedValue({ payload: mockSlot });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders timetable form and slots correctly', async () => {
        render(<TimetableForm />);

        // Check form elements
        expect(screen.getByLabelText(/day of week/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/time range/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/teacher/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/room/i)).toBeInTheDocument();

        // Wait for timetable slots to load
        await waitFor(() => {
            expect(screen.getByText('09:00 AM')).toBeInTheDocument();
            expect(screen.getByText('10:00 AM')).toBeInTheDocument();
        });
    });

    it('handles slot creation', async () => {
        render(<TimetableForm />);

        // Fill form
        fireEvent.change(screen.getByLabelText(/day of week/i), { target: { value: '1' }});
        fireEvent.change(screen.getByLabelText(/teacher/i), { target: { value: '1' }});
        fireEvent.change(screen.getByLabelText(/room/i), { target: { value: 'Room 101' }});

        // Set time range
        const timeRange = screen.getByLabelText(/time range/i);
        fireEvent.change(timeRange, {
            target: { value: ['09:00', '10:00'] }
        });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /add slot/i }));

        await waitFor(() => {
            expect(createTimetableSlot).toHaveBeenCalledWith(expect.objectContaining({
                course_id: 1,
                teacher_id: 1,
                day_of_week: 1,
                room: 'Room 101'
            }));
        });

        expect(screen.getByText(/slot added successfully/i)).toBeInTheDocument();
    });

    it('validates required fields', async () => {
        render(<TimetableForm />);

        // Submit form without filling required fields
        fireEvent.click(screen.getByRole('button', { name: /add slot/i }));

        await waitFor(() => {
            expect(screen.getByText(/please select a day/i)).toBeInTheDocument();
            expect(screen.getByText(/please select time/i)).toBeInTheDocument();
            expect(screen.getByText(/please select a teacher/i)).toBeInTheDocument();
        });

        expect(createTimetableSlot).not.toHaveBeenCalled();
    });

    it('handles time conflict validation', async () => {
        (createTimetableSlot as jest.Mock).mockRejectedValueOnce(
            new Error('Time slot conflicts with existing schedule')
        );

        render(<TimetableForm />);

        // Fill form with conflicting time
        fireEvent.change(screen.getByLabelText(/day of week/i), { target: { value: '1' }});
        fireEvent.change(screen.getByLabelText(/teacher/i), { target: { value: '1' }});
        
        const timeRange = screen.getByLabelText(/time range/i);
        fireEvent.change(timeRange, {
            target: { value: ['09:00', '10:00'] }
        });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /add slot/i }));

        await waitFor(() => {
            expect(screen.getByText(/conflicts with existing schedule/i)).toBeInTheDocument();
        });
    });

    it('handles slot deletion', async () => {
        (deleteTimetableSlot as jest.Mock).mockResolvedValueOnce({ payload: mockSlot.id });

        render(<TimetableForm />);

        // Wait for slots to load
        await waitFor(() => {
            expect(screen.getByText('09:00 AM')).toBeInTheDocument();
        });

        // Click delete button
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteButton);

        // Confirm deletion
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
        fireEvent.click(screen.getByText(/yes/i));

        await waitFor(() => {
            expect(deleteTimetableSlot).toHaveBeenCalledWith(mockSlot.id);
            expect(screen.getByText(/deleted successfully/i)).toBeInTheDocument();
        });
    });

    it('validates time range', async () => {
        render(<TimetableForm />);

        // Set invalid time range (end time before start time)
        const timeRange = screen.getByLabelText(/time range/i);
        fireEvent.change(timeRange, {
            target: { value: ['10:00', '09:00'] }
        });

        fireEvent.click(screen.getByRole('button', { name: /add slot/i }));

        await waitFor(() => {
            expect(screen.getByText(/end time must be after start time/i)).toBeInTheDocument();
        });
    });

    it('handles navigation back to course list', () => {
        render(<TimetableForm />);

        fireEvent.click(screen.getByText(/back to courses/i));
        // Navigation assertions would go here
    });

    it('displays empty state when no slots exist', async () => {
        (fetchTimetableSlots as jest.Mock).mockResolvedValueOnce({ 
            payload: { items: [] }
        });

        render(<TimetableForm />);

        await waitFor(() => {
            expect(screen.getByText(/no timetable slots found/i)).toBeInTheDocument();
        });
    });

    it('displays teacher names correctly in slot list', async () => {
        const slotWithTeacher = {
            ...mockSlot,
            teacher: mockTeachers[0]
        };

        (fetchTimetableSlots as jest.Mock).mockResolvedValueOnce({ 
            payload: { items: [slotWithTeacher] }
        });

        render(<TimetableForm />);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });
    });
});
