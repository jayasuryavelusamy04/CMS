import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render, mockApiResponse, mockApiError } from '../../../../utils/testUtils';
import StaffAvailability from '../StaffAvailability';
import { setAvailability } from '../../../../store/slices/staffSlice';
import dayjs from 'dayjs';

// Mock the redux actions
jest.mock('../../../../store/slices/staffSlice', () => ({
    setAvailability: jest.fn()
}));

describe('StaffAvailability Component', () => {
    const mockStaffId = 1;
    const mockAvailabilities = [
        {
            id: 1,
            staff_id: mockStaffId,
            day_of_week: 1,
            start_time: '09:00:00',
            end_time: '10:00:00',
            is_available: true,
            reason: 'regular'
        },
        {
            id: 2,
            staff_id: mockStaffId,
            day_of_week: 2,
            start_time: '11:00:00',
            end_time: '12:00:00',
            is_available: true,
            reason: 'regular'
        }
    ];

    beforeEach(() => {
        (setAvailability as jest.Mock).mockResolvedValue({ 
            payload: mockAvailabilities[0] 
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders availability form and schedule correctly', () => {
        render(
            <StaffAvailability 
                staffId={mockStaffId} 
                availabilities={mockAvailabilities} 
            />
        );

        // Check form elements
        expect(screen.getByLabelText(/day of week/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/time range/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/availability status/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /set availability/i })).toBeInTheDocument();

        // Check schedule display
        expect(screen.getByText('Tuesday')).toBeInTheDocument(); // Day 1
        expect(screen.getByText('Wednesday')).toBeInTheDocument(); // Day 2
        expect(screen.getByText('09:00 AM')).toBeInTheDocument();
        expect(screen.getByText('10:00 AM')).toBeInTheDocument();
    });

    it('handles availability submission correctly', async () => {
        render(<StaffAvailability staffId={mockStaffId} />);

        // Fill form
        fireEvent.change(screen.getByLabelText(/day of week/i), { target: { value: '1' } });
        
        // Set time range (mocking TimePicker.RangePicker behavior)
        const timeRange = screen.getByLabelText(/time range/i);
        fireEvent.change(timeRange, {
            target: { value: ['09:00', '10:00'] }
        });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /set availability/i }));

        await waitFor(() => {
            expect(setAvailability).toHaveBeenCalledWith(expect.objectContaining({
                staff_id: mockStaffId,
                day_of_week: 1,
                is_available: true
            }));
        });

        expect(screen.getByText(/availability set successfully/i)).toBeInTheDocument();
    });

    it('validates time range', async () => {
        render(<StaffAvailability staffId={mockStaffId} />);

        // Set invalid time range (end time before start time)
        const timeRange = screen.getByLabelText(/time range/i);
        fireEvent.change(timeRange, {
            target: { value: ['10:00', '09:00'] }
        });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /set availability/i }));

        await waitFor(() => {
            expect(screen.getByText(/end time must be after start time/i)).toBeInTheDocument();
        });

        expect(setAvailability).not.toHaveBeenCalled();
    });

    it('handles schedule conflicts', async () => {
        (setAvailability as jest.Mock).mockRejectedValueOnce(
            new Error('Time slot conflicts with existing availability')
        );

        render(
            <StaffAvailability 
                staffId={mockStaffId} 
                availabilities={mockAvailabilities} 
            />
        );

        // Fill form with conflicting time
        fireEvent.change(screen.getByLabelText(/day of week/i), { target: { value: '1' } });
        const timeRange = screen.getByLabelText(/time range/i);
        fireEvent.change(timeRange, {
            target: { value: ['09:00', '10:00'] }
        });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /set availability/i }));

        await waitFor(() => {
            expect(screen.getByText(/time slot conflicts/i)).toBeInTheDocument();
        });
    });

    it('handles API errors', async () => {
        const errorMessage = 'Failed to set availability';
        (setAvailability as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        render(<StaffAvailability staffId={mockStaffId} />);

        // Fill and submit form
        fireEvent.change(screen.getByLabelText(/day of week/i), { target: { value: '1' } });
        fireEvent.click(screen.getByRole('button', { name: /set availability/i }));

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    it('displays empty state when no availabilities exist', () => {
        render(<StaffAvailability staffId={mockStaffId} availabilities={[]} />);
        expect(screen.getByText(/no availability schedule found/i)).toBeInTheDocument();
    });

    it('handles reason selection', async () => {
        render(<StaffAvailability staffId={mockStaffId} />);

        // Select reason
        fireEvent.change(screen.getByLabelText(/reason/i), { target: { value: 'leave' } });
        
        // Set availability status to unavailable
        fireEvent.change(screen.getByLabelText(/availability status/i), { target: { value: 'false' } });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /set availability/i }));

        await waitFor(() => {
            expect(setAvailability).toHaveBeenCalledWith(expect.objectContaining({
                is_available: false,
                reason: 'leave'
            }));
        });
    });
});
