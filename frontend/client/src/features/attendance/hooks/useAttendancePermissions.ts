import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { validatePermissions } from '../utils/validations';
import { PermissionStatus } from '../types/attendance.types';

interface UseAttendancePermissionsResult {
    permissions: PermissionStatus;
    isOnline: boolean;
    isLoading: boolean;
    error: string | null;
    checkPermissions: () => Promise<void>;
    requestPermissions: () => Promise<void>;
}

export const useAttendancePermissions = (): UseAttendancePermissionsResult => {
    const [permissions, setPermissions] = useState<PermissionStatus>({
        camera: false,
        geolocation: false
    });
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const checkPermissions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const cameraResult = await navigator.permissions.query({ name: 'camera' as PermissionName });
            const locationResult = await navigator.permissions.query({ name: 'geolocation' });

            setPermissions({
                camera: cameraResult.state === 'granted',
                geolocation: locationResult.state === 'granted'
            });

            // Set up permission change listeners
            cameraResult.addEventListener('change', () => {
                setPermissions(prev => ({
                    ...prev,
                    camera: cameraResult.state === 'granted'
                }));
            });

            locationResult.addEventListener('change', () => {
                setPermissions(prev => ({
                    ...prev,
                    geolocation: locationResult.state === 'granted'
                }));
            });

        } catch (err) {
            setError('Failed to check permissions');
            console.error('Permission check error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const requestPermissions = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Request camera permission
            if (!permissions.camera) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    stream.getTracks().forEach(track => track.stop());
                    message.success('Camera permission granted');
                } catch (err) {
                    message.error('Camera permission denied');
                    throw new Error('Camera permission required for QR scanning');
                }
            }

            // Request geolocation permission
            if (!permissions.geolocation) {
                try {
                    await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });
                    message.success('Location permission granted');
                } catch (err) {
                    message.error('Location permission denied');
                    throw new Error('Location permission required for attendance marking');
                }
            }

            // Re-check permissions after requests
            await checkPermissions();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to request permissions');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [permissions, checkPermissions]);

    // Handle online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial permission check
        checkPermissions();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [checkPermissions]);

    return {
        permissions,
        isOnline,
        isLoading,
        error,
        checkPermissions,
        requestPermissions
    };
};
