import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { message } from 'antd';
import { indexedDBService } from '../../../services/indexedDB';
import { syncOfflineAttendance } from '../../../store/slices/attendanceSlice';
import { AppDispatch } from '../../../store';

interface UseAttendanceSyncResult {
    isSyncing: boolean;
    pendingRecords: number;
    lastSyncTime: Date | null;
    syncError: string | null;
    triggerSync: () => Promise<void>;
}

export const useAttendanceSync = (autoSync = true): UseAttendanceSyncResult => {
    const dispatch = useDispatch<AppDispatch>();
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingRecords, setPendingRecords] = useState(0);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [syncError, setSyncError] = useState<string | null>(null);

    const checkPendingRecords = useCallback(async () => {
        try {
            const records = await indexedDBService.getPendingAttendanceRecords();
            setPendingRecords(records.length);
        } catch (error) {
            console.error('Failed to check pending records:', error);
        }
    }, []);

    const getDeviceId = useCallback((): string => {
        const storageKey = 'device_id';
        let deviceId = localStorage.getItem(storageKey);

        if (!deviceId) {
            deviceId = 'device-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(storageKey, deviceId);
        }

        return deviceId;
    }, []);

    const triggerSync = useCallback(async () => {
        if (isSyncing || !navigator.onLine) {
            return;
        }

        setIsSyncing(true);
        setSyncError(null);

        try {
            const records = await indexedDBService.getPendingAttendanceRecords();

            if (records.length === 0) {
                return;
            }

            const deviceId = getDeviceId();
            const syncData = records.map(record => record.data);

            await dispatch(syncOfflineAttendance({
                device_id: deviceId,
                sync_data: syncData
            })).unwrap();

            // Mark records as synced
            for (const record of records) {
                if (record.id) {
                    await indexedDBService.updateRecordSyncStatus(record.id, 'SYNCED');
                }
            }

            // Clear synced records and update state
            await indexedDBService.clearSyncedRecords();
            await checkPendingRecords();
            setLastSyncTime(new Date());
            message.success('Attendance records synchronized successfully');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to sync attendance records';
            setSyncError(errorMessage);
            message.error(errorMessage);

            // Mark records as failed
            const records = await indexedDBService.getPendingAttendanceRecords();
            for (const record of records) {
                if (record.id) {
                    await indexedDBService.updateRecordSyncStatus(
                        record.id,
                        'FAILED',
                        errorMessage
                    );
                }
            }
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, dispatch, getDeviceId, checkPendingRecords]);

    // Automatically check for pending records when online status changes
    useEffect(() => {
        const handleOnline = async () => {
            await checkPendingRecords();
            if (autoSync) {
                await triggerSync();
            }
        };

        const handleOffline = () => {
            // Optional: Update UI to show offline status
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        checkPendingRecords();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [checkPendingRecords, triggerSync, autoSync]);

    // Periodic check for pending records
    useEffect(() => {
        const interval = setInterval(checkPendingRecords, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [checkPendingRecords]);

    return {
        isSyncing,
        pendingRecords,
        lastSyncTime,
        syncError,
        triggerSync
    };
};
