import React, { useState } from 'react';
import { Table, Select, Button, Space, Tooltip, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { AttendanceStatus } from '../types/timetable.types';

const { Option } = Select;

interface Student {
    id: number;
    roll_number: string;
    first_name: string;
    last_name: string;
}

interface AttendanceData {
    [key: number]: {
        status: AttendanceStatus;
        note?: string;
    };
}

interface Props {
    students: Student[];
    onSubmit: (data: { student_id: number; status: AttendanceStatus; note?: string }[]) => Promise<void>;
    loading?: boolean;
}

const statusIcons = {
    present: <CheckCircleOutlined className="text-green-500" />,
    absent: <CloseCircleOutlined className="text-red-500" />,
    late: <ClockCircleOutlined className="text-yellow-500" />,
    excused: <ExclamationCircleOutlined className="text-blue-500" />
};

const BulkAttendanceMarking: React.FC<Props> = ({ students, onSubmit, loading }) => {
    const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
    const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>('present');

    const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status }
        }));
    };

    const handleNoteChange = (studentId: number, note: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], note }
        }));
    };

    const handleMarkAll = (status: AttendanceStatus) => {
        const newData = students.reduce((acc, student) => ({
            ...acc,
            [student.id]: { status, note: attendanceData[student.id]?.note }
        }), {});
        setAttendanceData(newData);
        setSelectedStatus(status);
    };

    const handleSubmit = async () => {
        const missingStudents = students.filter(student => !attendanceData[student.id]);
        if (missingStudents.length > 0) {
            message.warning('Please mark attendance for all students');
            return;
        }

        const data = students.map(student => ({
            student_id: student.id,
            status: attendanceData[student.id]?.status || 'present',
            note: attendanceData[student.id]?.note
        }));

        try {
            await onSubmit(data);
            message.success('Attendance marked successfully');
        } catch (error) {
            message.error('Failed to mark attendance');
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
            key: 'name',
            render: (_: any, record: Student) => `${record.first_name} ${record.last_name}`
        },
        {
            title: 'Status',
            key: 'status',
            width: 200,
            render: (_: any, record: Student) => (
                <Select
                    value={attendanceData[record.id]?.status || selectedStatus}
                    onChange={(value) => handleStatusChange(record.id, value as AttendanceStatus)}
                    style={{ width: '100%' }}
                >
                    <Option value="present">
                        <Space>
                            {statusIcons.present} Present
                        </Space>
                    </Option>
                    <Option value="absent">
                        <Space>
                            {statusIcons.absent} Absent
                        </Space>
                    </Option>
                    <Option value="late">
                        <Space>
                            {statusIcons.late} Late
                        </Space>
                    </Option>
                    <Option value="excused">
                        <Space>
                            {statusIcons.excused} Excused
                        </Space>
                    </Option>
                </Select>
            )
        }
    ];

    return (
        <div>
            <div className="mb-4 flex justify-between items-center">
                <Space>
                    <span className="font-medium">Quick Actions:</span>
                    <Tooltip title="Mark all students as present">
                        <Button
                            icon={statusIcons.present}
                            onClick={() => handleMarkAll('present')}
                        >
                            All Present
                        </Button>
                    </Tooltip>
                    <Tooltip title="Mark all students as absent">
                        <Button
                            icon={statusIcons.absent}
                            onClick={() => handleMarkAll('absent')}
                        >
                            All Absent
                        </Button>
                    </Tooltip>
                </Space>

                <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={loading}
                >
                    Submit Attendance
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={students}
                rowKey="id"
                pagination={false}
                loading={loading}
                bordered
                size="small"
                rowClassName={(record) => {
                    const status = attendanceData[record.id]?.status || selectedStatus;
                    return {
                        'bg-green-50': status === 'present',
                        'bg-red-50': status === 'absent',
                        'bg-yellow-50': status === 'late',
                        'bg-blue-50': status === 'excused'
                    }[`bg-${status}-50`] || '';
                }}
            />
        </div>
    );
};

export default BulkAttendanceMarking;
