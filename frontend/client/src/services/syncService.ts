import { indexedDBService } from './indexedDB';
import { store } from '../store';
import { syncOfflineAttendance } from '../store/slices/attendanceSlice';

class SyncService {
    private syncInProgress = false;
    private retryCount = 0;
    private maxRetries = 3;
    private retryDelay = 5000; // 5 seconds

    async syncPendingRecords(): Promise<void> {
        if (this.syncInProgress) {
            console.log('Sync already in progress');
            return;
        }

        this.syncInProgress = true;
        try {
            const pendingRecords = await indexedDBService.getPendingAttendanceRecords();

            if (pendingRecords.length === 0) {
                console.log('No pending records to sync');
                return;
            }

            const deviceId = await this.getDeviceId();
            const syncData = pendingRecords.map(record => record.data);

            const result = await store.dispatch(
                syncOfflineAttendance({
                    device_id: deviceId,
                    sync_data: syncData
                })
            ).unwrap();

            // Update sync status for each record
            for (const record of pendingRecords) {
                await indexedDBService.updateRecordSyncStatus(
                    record.id!,
                    'SYNCED'
                );
            }

            // Clear synced records
            await indexedDBService.clearSyncedRecords();

            this.retryCount = 0;
            console.log('Sync completed successfully');

        } catch (error) {
            console.error('Sync failed:', error);

            // Mark records as failed
            const pendingRecords = await indexedDBService.getPendingAttendanceRecords();
            for (const record of pendingRecords) {
                await indexedDBService.updateRecordSyncStatus(
                    record.id!,
                    'FAILED',
                    error instanceof Error ? error.message : 'Unknown error'
                );
            }

            // Retry if not exceeded max retries
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                setTimeout(
                    () => this.syncPendingRecords(),
                    this.retryDelay * this.retryCount
                );
            }
        } finally {
            this.syncInProgress = false;
        }
    }

    private async getDeviceId(): Promise<string> {
        // Generate a semi-permanent device ID
        const storageKey = 'device_id';
        let deviceId = localStorage.getItem(storageKey);

        if (!deviceId) {
            deviceId = 'device-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(storageKey, deviceId);
        }

        return deviceId;
    }

    // Initialize sync when coming back online
    initialize() {
        window.addEventListener('online', () => {
            console.log('Device is online. Starting sync...');
            this.syncPendingRecords();
        });

        // Initial sync check if online
        if (navigator.onLine) {
            this.syncPendingRecords();
        }
    }

    // Manual sync trigger
    async triggerSync(): Promise<void> {
        if (!navigator.onLine) {
            throw new Error('Device is offline');
        }
        return this.syncPendingRecords();
    }
}

export const syncService = new SyncService();

// Initialize the sync service
syncService.initialize();
