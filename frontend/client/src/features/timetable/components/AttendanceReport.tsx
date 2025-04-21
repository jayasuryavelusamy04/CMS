import React, { useEffect, useState } from 'react';
import { Card, DatePicker, Select, Table, Space, Button, Statistic, Row, Col } from 'antd';
import { DownloadOutlined, PieChartOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { generateAttendanceReport } from '../../../store/slices/timetableSlice';
import type { AttendanceReport as IAttendanceReport } from '../types/timetable.types';
import dayjs from 'dayjs';
import { AppDispatch } from '../../../store';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Props {
    classSectionId: number;
}

const AttendanceReport: React.FC<Props> = ({ classSectionId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { reports, loading } = useSelector((state: any) => state.timetable);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().startOf('month'),
        dayjs().endOf('month')
    ]);
    const [reportType, setReportType] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

    useEffect(() => {
        fetchReport();
    }, [dateRange, reportType]);

    const fetchReport = async () => {
        try {
            await dispatch(generateAttendanceReport({
                start_date: dateRange[0].format('YYYY-MM-DD'),
                end_date: dateRange[1].format('YYYY-MM-DD'),
                class_section_id: classSectionId,
                report_type: reportType
            })).unwrap();
        } catch (error) {
            console.error('Failed to fetch attendance report:', error);
        }
    };

    const columns = [
        {
            title: 'Student',
            key: 'student',
            render: (_: any, record: IAttendanceReport) => (
                <span>{`${record.student?.first_name} ${record.student?.last_name}`}</span>
            )
        },
        {
            title: 'Total Days',
            dataIndex: 'total_days',
            key: 'total_days'
        },
        {
            title: 'Present',
            dataIndex: 'present_days',
            key: 'present_days'
        },
        {
            title: 'Absent',
            dataIndex: 'absent_days',
            key: 'absent_days'
        },
        {
            title: 'Late',
            dataIndex: 'late_days',
            key: 'late_days'
        },
        {
            title: 'Excused',
            dataIndex: 'excused_days',
            key: 'excused_days'
        },
        {
            title: 'Attendance %',
            dataIndex: 'attendance_percentage',
            key: 'attendance_percentage',
            render: (value: number) => `${value.toFixed(2)}%`,
            sorter: (a: IAttendanceReport, b: IAttendanceReport) => 
                a.attendance_percentage - b.attendance_percentage
        }
    ];

    const calculateClassStats = () => {
        if (!reports.length) return { avg: 0, highest: 0, lowest: 0 };

        const percentages = reports.map(r => r.attendance_percentage);
        return {
            avg: percentages.reduce((a, b) => a + b, 0) / percentages.length,
            highest: Math.max(...percentages),
            lowest: Math.min(...percentages)
        };
    };

    const stats = calculateClassStats();

    const exportToExcel = () => {
        // Implement Excel export functionality
        console.log('Export to Excel');
    };

    return (
        <Card
            title="Attendance Report"
            extra={
                <Button
                    icon={<DownloadOutlined />}
                    onClick={exportToExcel}
                >
                    Export to Excel
                </Button>
            }
        >
            <Space direction="vertical" className="w-full">
                <div className="flex justify-between items-center mb-6">
                    <Space>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => dates && setDateRange(dates)}
                        />
                        <Select
                            value={reportType}
                            onChange={setReportType}
                            style={{ width: 120 }}
                        >
                            <Option value="daily">Daily</Option>
                            <Option value="monthly">Monthly</Option>
                            <Option value="yearly">Yearly</Option>
                        </Select>
                    </Space>
                </div>

                <Row gutter={16} className="mb-6">
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Class Average Attendance"
                                value={stats.avg}
                                precision={2}
                                suffix="%"
                                prefix={<PieChartOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Highest Attendance"
                                value={stats.highest}
                                precision={2}
                                suffix="%"
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Lowest Attendance"
                                value={stats.lowest}
                                precision={2}
                                suffix="%"
                                valueStyle={{ color: '#cf1322' }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={reports}
                    rowKey="student_id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} students`
                    }}
                />
            </Space>
        </Card>
    );
};

export default AttendanceReport;
