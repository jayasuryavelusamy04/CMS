import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { message } from 'antd';
import { QRCodeScanner } from '../components/QRCodeScanner';
import { configureStore } from '@reduxjs/toolkit';
import attendanceReducer from '../../../store/slices/attendanceSlice';

// Mock the html5-qrcode library
jest.mock('html5-qrcode', () => ({
    Html5QrcodeScanner: jest.fn().mockImplementation(() => ({
        render: jest.fn(),
        clear: jest.fn()
    }))
}));

// Mock IndexedDB service
jest.mock('../../../services/indexedDB', () => ({
    indexedDBService: {
        storeAttendanceRecord: jest.fn(),
        getPendingAttendanceRecords: jest.fn().mockResolvedValue([]),
        updateRecordSyncStatus: jest.fn(),
        clearSyncedRecords: jest.fn()
    }
}));

// Mock antd message
jest.mock('antd', () => ({
    ...jest.requireActual('antd'),
    message: {
        success: jest.fn(),
        error: jest.fn(),
        warning: jest.fn()
    }
}));

describe('QRCodeScanner', () => {
    const mockStore = configureStore({
        reducer: {
            attendance: attendanceReducer
        }
    });

    const defaultProps = {
        studentId: 123,
        onSuccess: jest.fn(),
        onError: jest.fn()
    };

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    it('renders correctly with camera permission', () => {
        Object.defineProperty(navigator, 'permissions', {
            value: {
                query: jest.fn().mockResolvedValue({ state: 'granted' })
            }
        });

        render(
            <Provider store={mockStore}>
                <QRCodeScanner {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText('Scan QR Code')).toBeInTheDocument();
    });

    it('shows camera permission request when permission is denied', async () => {
        Object.defineProperty(navigator, 'permissions', {
            value: {
                query: jest.fn().mockResolvedValue({ state: 'denied' })
            }
        });

        render(
            <Provider store={mockStore}>
                <QRCodeScanner {...defaultProps} />
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('Camera permission is required to scan QR codes.')).toBeInTheDocument();
        });
    });

    it('handles offline mode correctly', () => {
        Object.defineProperty(navigator, 'onLine', {
            value: false,
            writable: true
        });

        render(
            <Provider store={mockStore}>
                <QRCodeScanner {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText(/You are currently offline/)).toBeInTheDocument();
    });

    it('handles successful QR code scan', async () => {
        const mockQRData = {
            id: 'test-qr',
            classId: 1,
            subjectId: 1,
            teacherId: 1,
            date: '2025-04-21',
            period: 1,
            timestamp: new Date().toISOString()
        };

        // Mock successful online submission
        Object.defineProperty(navigator, 'onLine', { value: true });
        const { onSuccess } = defaultProps;

        render(
            <Provider store={mockStore}>
                <QRCodeScanner {...defaultProps} />
            </Provider>
        );

        // Simulate QR code scan
        const scanButton = screen.getByText('Scan QR Code');
        fireEvent.click(scanButton);

        // Simulate successful scan
        const html5QrcodeScanner = require('html5-qrcode').Html5QrcodeScanner;
        const scanSuccessCallback = html5QrcodeScanner.mock.calls[0][2];
        await scanSuccessCallback(JSON.stringify(mockQRData));

        expect(onSuccess).toHaveBeenCalled();
        expect(message.success).toHaveBeenCalledWith('Attendance marked successfully');
    });

    it('handles QR code scan errors', async () => {
        const mockError = new Error('Invalid QR code');
        const { onError } = defaultProps;

        render(
            <Provider store={mockStore}>
                <QRCodeScanner {...defaultProps} />
            </Provider>
        );

        const scanButton = screen.getByText('Scan QR Code');
        fireEvent.click(scanButton);

        // Simulate scan error
        const html5QrcodeScanner = require('html5-qrcode').Html5QrcodeScanner;
        const scanSuccessCallback = html5QrcodeScanner.mock.calls[0][2];
        await scanSuccessCallback('invalid-json');

        expect(onError).toHaveBeenCalled();
        expect(message.error).toHaveBeenCalled();
    });

    it('stores attendance offline when not connected', async () => {
        const mockQRData = {
            id: 'test-qr',
            classId: 1,
            subjectId: 1,
            teacherId: 1,
            date: '2025-04-21',
            period: 1,
            timestamp: new Date().toISOString()
        };

        // Mock offline mode
        Object.defineProperty(navigator, 'onLine', { value: false });

        render(
            <Provider store={mockStore}>
                <QRCodeScanner {...defaultProps} />
            </Provider>
        );

        const scanButton = screen.getByText('Scan QR Code');
        fireEvent.click(scanButton);

        // Simulate successful scan
        const html5QrcodeScanner = require('html5-qrcode').Html5QrcodeScanner;
        const scanSuccessCallback = html5QrcodeScanner.mock.calls[0][2];
        await scanSuccessCallback(JSON.stringify(mockQRData));

        expect(message.success).toHaveBeenCalledWith(expect.stringContaining('stored offline'));
        expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    });
});
