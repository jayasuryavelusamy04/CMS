import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render, mockApiResponse, mockApiError, generateMockStaff } from '../../../../utils/testUtils';
import StaffForm from '../StaffForm';
import { createStaff, updateStaff } from '../../../../store/slices/staffSlice';
import dayjs from 'dayjs';

// Mock the redux actions
jest.mock('../../../../store/slices/staffSlice', () => ({
    createStaff: jest.fn(),
    updateStaff: jest.fn()
}));

// Mock react-router-dom's useParams
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({
        id: undefined
    }),
    useNavigate: () => jest.fn()
}));

describe('StaffForm Component', () => {
    const mockStaff = generateMockStaff();
    const mockFormData = {
        employee_id: 'EMP123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        contact_number: '+1234567890',
        role: 'teacher',
        joining_date: dayjs('2024-01-01'),
        address: '123 Main St',
        qualifications: 'B.Ed',
        is_active: true
    };

    beforeEach(() => {
        (createStaff as jest.Mock).mockResolvedValue({ payload: mockStaff });
        (updateStaff as jest.Mock).mockResolvedValue({ payload: mockStaff });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders form fields correctly', () => {
        render(<StaffForm />);

        expect(screen.getByLabelText(/employee id/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/contact number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/joining date/i)).toBeInTheDocument();
    });

    it('handles form submission for new staff', async () => {
        render(<StaffForm />);

        // Fill form fields
        fireEvent.change(screen.getByLabelText(/employee id/i), { target: { value: mockFormData.employee_id } });
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: mockFormData.first_name } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: mockFormData.last_name } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: mockFormData.email } });
        fireEvent.change(screen.getByLabelText(/contact number/i), { target: { value: mockFormData.contact_number } });
        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: mockFormData.role } });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /create/i }));

        await waitFor(() => {
            expect(createStaff).toHaveBeenCalledWith(expect.objectContaining({
                employee_id: mockFormData.employee_id,
                first_name: mockFormData.first_name,
                email: mockFormData.email
            }));
        });

        expect(screen.getByText(/staff created successfully/i)).toBeInTheDocument();
    });

    it('validates required fields', async () => {
        render(<StaffForm />);

        // Submit form without filling required fields
        fireEvent.click(screen.getByRole('button', { name: /create/i }));

        await waitFor(() => {
            expect(screen.getByText(/employee id is required/i)).toBeInTheDocument();
            expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        });

        expect(createStaff).not.toHaveBeenCalled();
    });

    it('validates email format', async () => {
        render(<StaffForm />);

        // Enter invalid email
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
        fireEvent.click(screen.getByRole('button', { name: /create/i }));

        await waitFor(() => {
            expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
        });
    });

    it('validates phone number format', async () => {
        render(<StaffForm />);

        // Enter invalid phone number
        fireEvent.change(screen.getByLabelText(/contact number/i), { target: { value: '123' } });
        fireEvent.click(screen.getByRole('button', { name: /create/i }));

        await waitFor(() => {
            expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument();
        });
    });

    it('handles API errors', async () => {
        const errorMessage = 'Employee ID already exists';
        (createStaff as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        render(<StaffForm />);

        // Fill and submit form
        fireEvent.change(screen.getByLabelText(/employee id/i), { target: { value: mockFormData.employee_id } });
        fireEvent.click(screen.getByRole('button', { name: /create/i }));

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    it('handles form cancellation', () => {
        render(<StaffForm />);

        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
        // Add assertions for navigation if needed
    });
});
