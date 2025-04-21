import React from 'react';
import { Card, Row, Col, Progress, Statistic, Table } from 'antd';
import { 
    CheckCircleOutlined, 
    CloseCircleOutlined, 
    ClockCircleOutlined, 
    ExclamationCircleOutlined 
} from '@ant-design/icons';
import { AttendanceReport } from '../types/timetable.types';

interface Props {
    data: AttendanceReport[];
    dateRange: [string, string];
}

const AttendanceStats: React.FC<Props> = ({ data, dateRange }) => {
    const calculateOverallStats = () => {
        if (!data.length) return { present: 0, absent: 0, late: 0, excused: 0 };

        const totals = data.reduce(
            (acc, curr) => ({
                present: acc.present + curr.present_days,
                absent: acc.absent_days + curr.absent_days,
                late: acc.late_days + curr.late_days,
                excused: acc.excused + curr.excused_days
            }),
            { present: 0, absent: 0, late: 0, excused: 0 }
        );

        const total = Object.values(totals).reduce((a, b) => a + b, 0);
        return {
            present: (totals.present / total) * 100,
            absent: (totals.absent / total) * 100,
            late: (totals.late / total) * 100,
            excused: (totals.excused / total) * 100
        };
    };

    const stats = calculateOverallStats();

    const columns = [
        {
            title: 'Student',
            dataIndex: 'student_name',
            key: 'student_name',
            sorter: (a: any, b: any) => a.student_name.localeCompare(b.student_name)
        },
        {
            title: 'Present',
            dataIndex: 'present_days',
            key: 'present_days',
            sorter: (a: any, b: any) => a.present_days - b.present_days
        },
        {
            title: 'Absent',
            dataIndex: 'absent_days',
            key: 'absent_days',
            sorter: (a: any, b: any) => a.absent_days - b.absent_days
        },
        {
            title: 'Late',
            dataIndex: 'late_days',
            key: 'late_days',
            sorter: (a: any, b: any) => a.late_days - b.late_days
        },
        {
            title: 'Excused',
            dataIndex: 'excused_days',
            key: 'excused_days',
            sorter: (a: any, b: any) => a.excused_days - b.excused_days
        },
        {
            title: 'Attendance %',
            dataIndex: 'attendance_percentage',
            key: 'attendance_percentage',
            render: (value: number) => (
                <Progress 
                    percent={value} 
                    size="small" 
                    status={value < 75 ? 'exception' : 'success'}
                />
            ),
            sorter: (a: any, b: any) => a.attendance_percentage - b.attendance_percentage
        }
    ];

    const tableData = data.map(item => ({
        key: item.student_id,
        student_name: `${item.student?.first_name} ${item.student?.last_name}`,
        present_days: item.present_days,
        absent_days: item.absent_days,
        late_days: item.late_days,
        excused_days: item.excused_days,
        attendance_percentage: item.attendance_percentage
    }));

    return (
        <div>
            <Card className="mb-4">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="Present"
                            value={stats.present}
                            precision={1}
                            prefix={<CheckCircleOutlined className="text-green-500" />}
                            suffix="%"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="Absent"
                            value={stats.absent}
                            precision={1}
                            prefix={<CloseCircleOutlined className="text-red-500" />}
                            suffix="%"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="Late"
                            value={stats.late}
                            precision={1}
                            prefix={<ClockCircleOutlined className="text-yellow-500" />}
                            suffix="%"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="Excused"
                            value={stats.excused}
                            precision={1}
                            prefix={<ExclamationCircleOutlined className="text-blue-500" />}
                            suffix="%"
                        />
                    </Col>
                </Row>
            </Card>

            <Card 
                title="Student-wise Attendance" 
                extra={`${dateRange[0]} to ${dateRange[1]}`}
            >
                <Table
                    columns={columns}
                    dataSource={tableData}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Total ${total} students`
                    }}
                    scroll={{ x: 800 }}
                />
            </Card>
        </div>
    );
};

export default AttendanceStats;
