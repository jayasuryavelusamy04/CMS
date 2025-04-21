import { AttendanceRequest, QRAttendanceData, AttendanceFilterParams } from '../types/attendance.types';
import dayjs from 'dayjs';

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export const validateQRData = (data: QRAttendanceData): void => {
    if (!data.student_id) {
        throw new ValidationError('Student ID is required');
    }
    if (!data.class_id) {
        throw new ValidationError('Class ID is required');
    }
    if (!data.subject_id) {
        throw new ValidationError('Subject ID is required');
    }
    if (!data.date || !dayjs(data.date).isValid()) {
        throw new ValidationError('Valid date is required');
    }
    if (!data.period || data.period < 1 || data.period > 8) {
        throw new ValidationError('Valid period number (1-8) is required');
    }
    if (!data.qr_code) {
        throw new ValidationError('QR code is required');
    }
    if (!data.device_info?.timestamp || !dayjs(data.device_info.timestamp).isValid()) {
        throw new ValidationError('Valid device timestamp is required');
    }
};

export const validateAttendanceRequest = (request: AttendanceRequest): void => {
    if (!request.student_id) {
        throw new ValidationError('Student ID is required');
    }
    if (!['PRESENT', 'ABSENT', 'LATE', 'ON_LEAVE'].includes(request.status)) {
        throw new ValidationError('Invalid attendance status');
    }
};

export const validateAttendanceFilters = (filters: AttendanceFilterParams): void => {
    if (filters.startDate && !dayjs(filters.startDate).isValid()) {
        throw new ValidationError('Invalid start date');
    }
    if (filters.endDate && !dayjs(filters.endDate).isValid()) {
        throw new ValidationError('Invalid end date');
    }
    if (filters.startDate && filters.endDate &&
        dayjs(filters.startDate).isAfter(dayjs(filters.endDate))) {
        throw new ValidationError('Start date cannot be after end date');
    }
    if (filters.classId && typeof filters.classId !== 'number') {
        throw new ValidationError('Invalid class ID');
    }
    if (filters.subjectId && typeof filters.subjectId !== 'number') {
        throw new ValidationError('Invalid subject ID');
    }
    if (filters.studentId && typeof filters.studentId !== 'number') {
        throw new ValidationError('Invalid student ID');
    }
};

export const validateDateRange = (startDate: string | dayjs.Dayjs, endDate: string | dayjs.Dayjs): void => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (!start.isValid()) {
        throw new ValidationError('Invalid start date');
    }
    if (!end.isValid()) {
        throw new ValidationError('Invalid end date');
    }
    if (start.isAfter(end)) {
        throw new ValidationError('Start date cannot be after end date');
    }
    if (end.diff(start, 'days') > 365) {
        throw new ValidationError('Date range cannot exceed one year');
    }
};

export const isValidDeviceInfo = (info: any): boolean => {
    if (!info || typeof info !== 'object') return false;
    if (!info.userAgent || typeof info.userAgent !== 'string') return false;
    if (!info.timestamp || !dayjs(info.timestamp).isValid()) return false;

    if (info.location) {
        if (typeof info.location.latitude !== 'number' ||
            typeof info.location.longitude !== 'number' ||
            typeof info.location.accuracy !== 'number') {
            return false;
        }
    }

    return true;
};

export const validateBulkAttendanceRequests = (
    requests: AttendanceRequest[],
    maxBatchSize = 100
): void => {
    if (!Array.isArray(requests)) {
        throw new ValidationError('Invalid attendance requests array');
    }
    if (requests.length === 0) {
        throw new ValidationError('Empty attendance requests array');
    }
    if (requests.length > maxBatchSize) {
        throw new ValidationError(`Cannot process more than ${maxBatchSize} records at once`);
    }

    requests.forEach(validateAttendanceRequest);
};

export const validatePermissions = async (): Promise<boolean> => {
    try {
        // Check camera permission
        const cameraResult = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (cameraResult.state === 'denied') {
            throw new ValidationError('Camera permission is required for QR scanning');
        }

        // Check geolocation permission
        const locationResult = await navigator.permissions.query({ name: 'geolocation' });
        if (locationResult.state === 'denied') {
            throw new ValidationError('Location permission is required for attendance marking');
        }

        return true;
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new ValidationError('Failed to check permissions');
    }
};
