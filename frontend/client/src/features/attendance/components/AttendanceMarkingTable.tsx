import React, { useEffect, useState } from 'react';
import { Table, Button, Select, Badge, Tooltip, Space, message } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { indexedDBService } from '../../../services/indexedDB';
import dayjs from 'dayjs';

import { AttendanceRequest, AttendanceRecord } from '../types/attendance.types';

interface Student {
    id: number;
    name: string;
    roll_number: string;
}

interface Props {
    classId: number;
    date: string;
    period: number;
    subjectId: number;
    onSubmit: (records: AttendanceRequest[]) => Promise<void>;
}

const statusColors = {
    PRESENT: 'green',
    ABSENT: 'red',
    LATE: 'orange',
    ON_LEAVE: 'blue'
};

export const AttendanceMarkingTable: React.FC<Props> = ({
    classId,
    date,
    period,
    subjectId,
    onSubmit
}) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<Record<number, AttendanceRequest>>({});
    const [loading, setLoading] = useState(false);
    const [offline, setOffline] = useState(!navigator.onLine);

    useEffect(() => {
        // Handle online/offline status
        const handleOnline = () => setOffline(false);
        const handleOffline = () => setOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Load students from class
        fetchStudents();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [classId]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            // TODO: Implement API call to fetch students
            const response = await fetch(`/api/v1/students?class_id=${classId}`);
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            message.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId: number, status: AttendanceRecord['status']) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [studentId]: {
                student_id: studentId,
                status
            }
        }));
    };

    const storeOfflineAttendance = async (data: Record<number, AttendanceRequest>) => {
        try {
            // Convert attendance records to QRAttendanceData format
            const attendanceData = Object.values(data).map(record => ({
                student_id: record.student_id,
                class_id: classId,
                subject_id: subjectId,
                teacher_id: 0, // Will be set from the server side
                date,
                period,
                qr_code: '', // Manual attendance doesn't use QR codes
                device_info: {
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                }
            }));

            // Store each attendance record
            for (const record of attendanceData) {
                await indexedDBService.storeAttendanceRecord(record);
            }

            message.success('Attendance saved offline. Will sync when online.');
        } catch (error) {
            message.error('Failed to store offline data');
            throw error;
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const records = Object.values(attendanceRecords);

            if (!navigator.onLine) {
                await storeOfflineAttendance(attendanceRecords);
            } else {
                await onSubmit(records);
                message.success('Attendance marked successfully');
            }
        } catch (error) {
            message.error('Failed to save attendance');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Roll No',
            dataIndex: 'roll_number',
            key: 'roll_number',
            width: 100
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Status',
            key: 'status',
            width: 200,
            render: (text: string, student: Student) => (
                <Select
                    value={attendanceRecords[student.id]?.status || 'ABSENT'}
                    onChange={(value) => handleStatusChange(student.id, value)}
                    style={{ width: '100%' }}
                >
                    <Select.Option value="PRESENT">
                        <Badge color={statusColors.PRESENT} text="Present" />
                    </Select.Option>
                    <Select.Option value="ABSENT">
                        <Badge color={statusColors.ABSENT} text="Absent" />
                    </Select.Option>
                    <Select.Option value="LATE">
                        <Badge color={statusColors.LATE} text="Late" />
                    </Select.Option>
                    <Select.Option value="ON_LEAVE">
                        <Badge color={statusColors.ON_LEAVE} text="On Leave" />
                    </Select.Option>
                </Select>
            )
        }
    ];

    return (
        <div>
            {offline && (
                <div style={{ marginBottom: 16, padding: 8, background: '#fffbe6', border: '1px solid #ffe58f' }}>
                    You are currently offline. Attendance will be saved locally and synced when online.
                </div>
            )}

            <Table
                dataSource={students}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={false}
                size="small"
            />

            <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Space>
                    <Button onClick={() => setAttendanceRecords({})}>
                        Reset
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={loading}
                    >
                        {offline ? 'Save Offline' : 'Submit Attendance'}
                    </Button>
                </Space>
            </div>
        </div>
    );
};
