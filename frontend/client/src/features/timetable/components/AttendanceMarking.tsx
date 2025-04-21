import React, { useEffect, useState } from 'react';
import { Table, Select, Input, Button, Card, Space, message, Tag, DatePicker } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { markBulkAttendance, fetchAttendance } from '../../../store/slices/timetableSlice';
import type { Attendance, AttendanceStatus } from '../types/timetable.types';
import dayjs from 'dayjs';
import { AppDispatch } from '../../../store';

const { Option } = Select;
const { TextArea } = Input;

interface Props {
    classSectionId: number;
    timetableSlotId: number;
    students: Array<{
        id: number;
        first_name: string;
        last_name: string;
        roll_number: string;
    }>;
}

interface StudentAttendance {
    student_id: number;
    status: AttendanceStatus;
    note?: string;
}

const AttendanceMarking: React.FC<Props> = ({ classSectionId, timetableSlotId, students }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: any) => state.timetable);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [attendanceData, setAttendanceData] = useState<{ [key: number]: StudentAttendance }>({});

    useEffect(() => {
        // Initialize attendance data for all students
        const initialData = students.reduce((acc, student) => {
            acc[student.id] = {
                student_id: student.id,
                status: 'present',
                note: ''
            };
            return acc;
        }, {} as { [key: number]: StudentAttendance });
        setAttendanceData(initialData);
    }, [students]);

    const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                status
            }
        }));
    };

    const handleNoteChange = (studentId: number, note: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                note
            }
        }));
    };

    const handleSubmit = async () => {
        try {
            const attendanceRecords = Object.values(attendanceData).map(record => ({
                ...record,
                timetable_slot_id: timetableSlotId,
                date: selectedDate.format('YYYY-MM-DD')
            }));

            await dispatch(markBulkAttendance(attendanceRecords)).unwrap();
            message.success('Attendance marked successfully');
        } catch (error) {
            message.error('Failed to mark attendance');
        }
    };

    const handleQuickMark = (status: AttendanceStatus) => {
        const updatedData = Object.keys(attendanceData).reduce((acc, studentId) => {
            acc[studentId] = {
                ...attendanceData[parseInt(studentId)],
                status
            };
            return acc;
        }, {} as { [key: number]: StudentAttendance });
        setAttendanceData(updatedData);
    };

    const columns = [
        {
            title: 'Roll No',
            dataIndex: 'roll_number',
            key: 'roll_number',
            width: 100
        },
        {
            title: 'Student Name',
            key: 'name',
            render: (_: any, record: any) => `${record.first_name} ${record.last_name}`
        },
        {
            title: 'Status',
            key: 'status',
            width: 150,
            render: (_: any, record: any) => (
                <Select
                    value={attendanceData[record.id]?.status || 'present'}
                    onChange={(value) => handleStatusChange(record.id, value)}
                    style={{ width: '100%' }}
                >
                    <Option value="present">
                        <Tag color="green">Present</Tag>
                    </Option>
                    <Option value="absent">
                        <Tag color="red">Absent</Tag>
                    </Option>
                    <Option value="late">
                        <Tag color="orange">Late</Tag>
                    </Option>
                    <Option value="excused">
                        <Tag color="blue">Excused</Tag>
                    </Option>
                </Select>
            )
        },
        {
            title: 'Note',
            key: 'note',
            render: (_: any, record: any) => (
                <Input
                    placeholder="Add note"
                    value={attendanceData[record.id]?.note || ''}
                    onChange={(e) => handleNoteChange(record.id, e.target.value)}
                />
            )
        }
    ];

    return (
        <Card title="Mark Attendance">
            <Space direction="vertical" className="w-full">
                <div className="flex justify-between items-center mb-4">
                    <DatePicker
                        value={selectedDate}
                        onChange={(date) => date && setSelectedDate(date)}
                        className="w-48"
                    />
                    <Space>
                        <Button onClick={() => handleQuickMark('present')}>
                            Mark All Present
                        </Button>
                        <Button danger onClick={() => handleQuickMark('absent')}>
                            Mark All Absent
                        </Button>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={students}
                    rowKey="id"
                    pagination={false}
                    loading={loading}
                />

                <div className="flex justify-end mt-4">
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={loading}
                    >
                        Submit Attendance
                    </Button>
                </div>
            </Space>
        </Card>
    );
};

export default AttendanceMarking;
