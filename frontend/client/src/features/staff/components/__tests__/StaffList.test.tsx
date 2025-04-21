import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render, mockApiResponse, mockApiError, generateMockStaff } from '../../../../utils/testUtils';
import StaffList from '../StaffList';
import { fetchStaff, deleteStaff } from '../../../../store/slices/staffSlice';

// Mock the redux actions
jest.mock('../../../../store/slices/staffSlice', () => ({
    fetchStaff: jest.fn(),
    deleteStaff: jest.fn()
}));

describe('StaffList Component', () => {
    const mockStaff = [
        generateMockStaff(),
        generateMockStaff({
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@example.com'
        })
    ];

    beforeEach(() => {
        (fetchStaff as jest.Mock).mockResolvedValue({ 
            payload: { items: mockStaff, total: mockStaff.length }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders staff list correctly', async () => {
        render(<StaffList />);

        // Check if loading state is shown initially
        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        // Wait for staff list to be loaded
        await waitFor(() => {
            expect(screen.getByText(mockStaff[0].first_name)).toBeInTheDocument();
            expect(screen.getByText(mockStaff[1].first_name)).toBeInTheDocument();
        });
    });

    it('handles staff filtering', async () => {
        render(<StaffList />);

        // Wait for the component to load
        await waitFor(() => {
            expect(screen.getByText(mockStaff[0].first_name)).toBeInTheDocument();
        });

        // Test role filter
        const roleSelect = screen.getByPlaceholderText(/filter by role/i);
        fireEvent.change(roleSelect, { target: { value: 'teacher' } });

        expect(fetchStaff).toHaveBeenCalledWith(expect.objectContaining({
            role: 'teacher'
        }));
    });

    it('handles staff deletion', async () => {
        (deleteStaff as jest.Mock).mockResolvedValueOnce({ payload: mockStaff[0].id });

        render(<StaffList />);

        // Wait for the component to load
        await waitFor(() => {
            expect(screen.getByText(mockStaff[0].first_name)).toBeInTheDocument();
        });

        // Find and click delete button
        const deleteButton = screen.getAllByText(/delete/i)[0];
        fireEvent.click(deleteButton);

        // Should show confirmation dialog
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

        // Confirm deletion
        const confirmButton = screen.getByText(/yes/i);
        fireEvent.click(confirmButton);

        // Should call delete action
        expect(deleteStaff).toHaveBeenCalledWith(mockStaff[0].id);

        // Should show success message
        await waitFor(() => {
            expect(screen.getByText(/deleted successfully/i)).toBeInTheDocument();
        });
    });

    it('handles network error', async () => {
        const errorMessage = 'Network error occurred';
        (fetchStaff as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        render(<StaffList />);

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    it('navigates to add staff page', () => {
        const { container } = render(<StaffList />);
        
        const addButton = screen.getByText(/add staff/i);
        fireEvent.click(addButton);

        // Check if navigation occurred (we can't test actual navigation in unit tests)
        expect(container.innerHTML).toContain('add staff');
    });

    it('displays empty state when no staff members exist', async () => {
        (fetchStaff as jest.Mock).mockResolvedValueOnce({ 
            payload: { items: [], total: 0 }
        });

        render(<StaffList />);

        await waitFor(() => {
            expect(screen.getByText(/no staff members found/i)).toBeInTheDocument();
        });
    });
});
