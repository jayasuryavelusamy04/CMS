import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, DatePicker, Select, message, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { AttendanceMarkingTable } from '../components/AttendanceMarkingTable';
import { QRCodeAttendance } from '../components/QRCodeAttendance';
import { QRCodeScanner } from '../components/QRCodeScanner';
import { AttendanceStats } from '../components/AttendanceStats';
import {
    syncOfflineAttendance,
    markAttendance,
    markQRAttendance
} from '../../../store/slices/attendanceSlice';
import { AttendanceRecord, AttendanceRequest } from '../types/attendance.types';
import { QRAttendanceData } from '../types/attendance.types';
import dayjs from 'dayjs';

const { TabPane } = Tabs;

export const AttendancePage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, syncing } = useSelector((state: RootState) => state.attendance);
    const { user } = useSelector((state: RootState) => state.auth);

    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<number | null>(null);

    // Check and sync offline data when coming online
    useEffect(() => {
        const handleOnline = async () => {
            try {
                // Get offline data from IndexedDB
                const offlineData = await getOfflineData();
                if (offlineData && offlineData.length > 0) {
                    // Get unique device ID or generate one
                    const deviceId = await getDeviceId();

                    await dispatch(syncOfflineAttendance({
                        device_id: deviceId,
                        sync_data: offlineData
                    })).unwrap();

                    // Clear synced offline data
                    await clearOfflineData();
                    message.success('Offline attendance records synced successfully');
                }
            } catch (error) {
                message.error('Failed to sync offline attendance records');
            }
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [dispatch]);

    const getDeviceId = async (): Promise<string> => {
        // TODO: Implement device ID generation/retrieval
        return 'device-' + Math.random().toString(36).substr(2, 9);
    };

    const getOfflineData = async () => {
        // TODO: Implement IndexedDB data retrieval
        return [];
    };

    const clearOfflineData = async () => {
        // TODO: Implement IndexedDB data clearing
    };

    const handleManualAttendance = async (records: AttendanceRequest[]) => {
        try {
            await dispatch(markAttendance(records)).unwrap();
            message.success('Attendance marked successfully');
        } catch (error) {
            message.error('Failed to mark attendance');
            throw error;
        }
    };

    const handleQRAttendance = async (data: QRAttendanceData) => {
        try {
            await dispatch(markQRAttendance(data)).unwrap();
            message.success('QR attendance marked successfully');
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to mark QR attendance';
            message.error(errorMessage);
            throw error;
        }
    };

    const handleError = (error: string) => {
        message.error(error || 'Failed to mark attendance');
    };

    const isTeacher = user?.role === 'TEACHER';
    const isStudent = user?.role === 'STUDENT';

    return (
        <div style={{ padding: 24 }}>
            <Card title="Attendance Management">
                <Tabs defaultActiveKey="manual">
                    {isTeacher && (
                        <TabPane tab="Manual Attendance" key="manual">
                            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                                <DatePicker
                                    value={selectedDate}
                                    onChange={(date) => date && setSelectedDate(date)}
                                    style={{ width: 200 }}
                                />
                                <Select
                                    placeholder="Select Period"
                                    value={selectedPeriod}
                                    onChange={setSelectedPeriod}
                                    style={{ width: 200 }}
                                >
                                    {Array.from({ length: 8 }, (_, i) => (
                                        <Select.Option key={i + 1} value={i + 1}>
                                            Period {i + 1}
                                        </Select.Option>
                                    ))}
                                </Select>
                                <Select
                                    placeholder="Select Class"
                                    value={selectedClass}
                                    onChange={setSelectedClass}
                                    style={{ width: 200 }}
                                // TODO: Add class options
                                />
                                <Select
                                    placeholder="Select Subject"
                                    value={selectedSubject}
                                    onChange={setSelectedSubject}
                                    style={{ width: 200 }}
                                // TODO: Add subject options
                                />
                            </Space>

                            {selectedClass && selectedSubject && (
                                <AttendanceMarkingTable
                                    classId={selectedClass}
                                    date={selectedDate.format('YYYY-MM-DD')}
                                    period={selectedPeriod}
                                    subjectId={selectedSubject}
                                    onSubmit={handleManualAttendance}
                                />
                            )}
                        </TabPane>
                    )}

                    {isTeacher && (
                        <TabPane tab="QR Code Generation" key="qr-generate">
                            {selectedClass && selectedSubject && (
                                <QRCodeAttendance
                                    classId={selectedClass}
                                    subjectId={selectedSubject}
                                    teacherId={user?.id || 0}
                                />
                            )}
                        </TabPane>
                    )}

                    {isStudent && (
                        <>
                            <TabPane tab="Scan QR Code" key="qr-scan">
                                <QRCodeScanner
                                    studentId={user?.id || 0}
                                    onSuccess={handleQRAttendance}
                                    onError={handleError}
                                />
                            </TabPane>
                            <TabPane tab="My Attendance" key="stats">
                                <AttendanceStats studentId={user?.id} />
                            </TabPane>
                        </>
                    )}

                    {isTeacher && selectedClass && selectedSubject && (
                        <TabPane tab="Class Statistics" key="class-stats">
                            <AttendanceStats
                                classId={selectedClass}
                                subjectId={selectedSubject}
                            />
                        </TabPane>
                    )}
                </Tabs>
            </Card>

            {/* Show offline data sync status */}
            {syncing && (
                <Card style={{ marginTop: 16 }}>
                    <Space>
                        <span>Syncing offline attendance records...</span>
                        <Button loading>Syncing</Button>
                    </Space>
                </Card>
            )}
        </div>
    );
};
