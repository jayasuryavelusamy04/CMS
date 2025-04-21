import { QRAttendanceData } from '../features/attendance/types/attendance.types';

const DB_NAME = 'SchoolCMS';
const DB_VERSION = 1;

interface AttendanceRecord {
    id?: number;
    data: QRAttendanceData;
    timestamp: string;
    syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
    error?: string;
}

interface DBSchema {
    attendance: AttendanceRecord;
}

class IndexedDBService {
    private db: IDBDatabase | null = null;

    async initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('attendance')) {
                    db.createObjectStore('attendance', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    async storeAttendanceRecord(data: QRAttendanceData): Promise<string> {
        if (!this.db) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['attendance'], 'readwrite');
            const store = transaction.objectStore('attendance');

            const record = {
                data,
                timestamp: new Date().toISOString(),
                syncStatus: 'PENDING' as const
            };

            const request = store.add(record);
            request.onsuccess = () => resolve(request.result as string);
            request.onerror = () => reject(request.error);
        });
    }

    async getPendingAttendanceRecords(): Promise<Array<AttendanceRecord>> {
        if (!this.db) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['attendance'], 'readonly');
            const store = transaction.objectStore('attendance');
            const request = store.getAll();

            request.onsuccess = () => {
                const records = request.result.filter(
                    record => record.syncStatus === 'PENDING'
                );
                resolve(records);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async updateRecordSyncStatus(
        id: number,
        status: 'SYNCED' | 'FAILED',
        error?: string
    ): Promise<void> {
        if (!this.db) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['attendance'], 'readwrite');
            const store = transaction.objectStore('attendance');
            const request = store.get(id);

            request.onsuccess = () => {
                const record = request.result;
                if (record) {
                    record.syncStatus = status;
                    if (error) {
                        record.error = error;
                    }
                    store.put(record);
                    resolve();
                } else {
                    reject(new Error('Record not found'));
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async clearSyncedRecords(): Promise<void> {
        if (!this.db) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['attendance'], 'readwrite');
            const store = transaction.objectStore('attendance');
            const request = store.getAll();

            request.onsuccess = () => {
                const records = request.result;
                const syncedRecords = records.filter(
                    record => record.syncStatus === 'SYNCED'
                );

                syncedRecords.forEach(record => {
                    store.delete(record.id);
                });

                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }
}

export const indexedDBService = new IndexedDBService();
