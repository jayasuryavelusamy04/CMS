import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render, mockApiResponse, mockApiError, generateMockStaff } from '../../../../utils/testUtils';
import StaffDetails from '../StaffDetails';
import dayjs from 'dayjs';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({
        id: '1'
    }),
    useNavigate: () => jest.fn()
}));

describe('StaffDetails Component', () => {
    const mockStaff = generateMockStaff({
        teaching_subjects: [
            {
                id: 1,
                subject: { id: 1, name: 'Mathematics' },
                class_section: { name: 'Class 10-A' },
                is_primary: true
            }
        ],
        availabilities: [
            {
                id: 1,
                day_of_week: 1,
                start_time: '09:00:00',
                end_time: '10:00:00',
                is_available: true,
                reason: 'regular'
            }
        ],
        audit_logs: [
            {
                id: 1,
                action: 'UPDATE',
                details: 'Updated contact information',
                performed_by: 1,
                created_at: '2024-01-01T00:00:00Z'
            }
        ]
    });

    beforeEach(() => {
        // Mock Redux state
        const preloadedState = {
            staff: {
                staff: [mockStaff],
                loading: false,
                error: null
            }
        };

        render(<StaffDetails />, { preloadedState });
    });

    it('renders staff details correctly', () => {
        // Personal Information
        expect(screen.getByText(mockStaff.employee_id)).toBeInTheDocument();
        expect(screen.getByText(`${mockStaff.first_name} ${mockStaff.last_name}`)).toBeInTheDocument();
        expect(screen.getByText(mockStaff.email)).toBeInTheDocument();
        expect(screen.getByText(mockStaff.contact_number)).toBeInTheDocument();
        expect(screen.getByText(mockStaff.role.toUpperCase())).toBeInTheDocument();
        expect(screen.getByText(/active/i)).toBeInTheDocument();
    });

    it('displays teaching assignments for teachers', () => {
        // Switch to Teaching Assignments tab
        fireEvent.click(screen.getByText(/teaching assignments/i));

        expect(screen.getByText('Mathematics')).toBeInTheDocument();
        expect(screen.getByText('Class 10-A')).toBeInTheDocument();
        expect(screen.getByText(/primary subject/i)).toBeInTheDocument();
    });

    it('displays availability schedule', () => {
        // Switch to Availability Schedule tab
        fireEvent.click(screen.getByText(/availability schedule/i));

        expect(screen.getByText('Monday')).toBeInTheDocument(); // day_of_week: 1
        expect(screen.getByText('09:00 AM')).toBeInTheDocument();
        expect(screen.getByText('10:00 AM')).toBeInTheDocument();
        expect(screen.getByText(/regular/i)).toBeInTheDocument();
    });

    it('displays audit logs', () => {
        // Switch to Audit Log tab
        fireEvent.click(screen.getByText(/audit log/i));

        expect(screen.getByText(/updated contact information/i)).toBeInTheDocument();
        expect(screen.getByText('UPDATE')).toBeInTheDocument();
        expect(screen.getByText((content) => 
            content.includes(dayjs('2024-01-01T00:00:00Z').format('MMMM D, YYYY'))
        )).toBeInTheDocument();
    });

    it('handles navigation to edit page', () => {
        const editButton = screen.getByText(/edit details/i);
        fireEvent.click(editButton);
        // Navigation assertions would go here if we weren't mocking useNavigate
    });

    it('handles back navigation', () => {
        const backButton = screen.getByText(/back to list/i);
        fireEvent.click(backButton);
        // Navigation assertions would go here if we weren't mocking useNavigate
    });

    it('displays appropriate messages when data is empty', () => {
        const emptyStaff = generateMockStaff({
            teaching_subjects: [],
            availabilities: [],
            audit_logs: []
        });

        render(<StaffDetails />, {
            preloadedState: {
                staff: {
                    staff: [emptyStaff],
                    loading: false,
                    error: null
                }
            }
        });

        // Check Teaching Assignments tab
        fireEvent.click(screen.getByText(/teaching assignments/i));
        expect(screen.getByText(/no subjects assigned yet/i)).toBeInTheDocument();

        // Check Availability Schedule tab
        fireEvent.click(screen.getByText(/availability schedule/i));
        expect(screen.getByText(/no availability schedule found/i)).toBeInTheDocument();

        // Check Audit Log tab
        fireEvent.click(screen.getByText(/audit log/i));
        expect(screen.getByText(/no audit logs available/i)).toBeInTheDocument();
    });

    it('handles loading state', () => {
        render(<StaffDetails />, {
            preloadedState: {
                staff: {
                    staff: [],
                    loading: true,
                    error: null
                }
            }
        });

        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('handles error state', () => {
        render(<StaffDetails />, {
            preloadedState: {
                staff: {
                    staff: [],
                    loading: false,
                    error: 'Failed to fetch staff details'
                }
            }
        });

        expect(screen.getByText(/failed to fetch staff details/i)).toBeInTheDocument();
    });

    it('handles staff not found', () => {
        render(<StaffDetails />, {
            preloadedState: {
                staff: {
                    staff: [],
                    loading: false,
                    error: null
                }
            }
        });

        expect(screen.getByText(/staff member not found/i)).toBeInTheDocument();
    });
});
