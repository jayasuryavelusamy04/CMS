import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, DatePicker, Table, Button, Spin, message } from 'antd';
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { AttendanceRecord } from '../types/attendance.types';
import { fetchStudentStats, fetchClassStats } from '../../../store/slices/attendanceSlice';
import { AppDispatch, RootState } from '../../../store';

const { RangePicker } = DatePicker;

interface Props {
    studentId?: number;
    classId?: number;
    subjectId?: number;
}

export const AttendanceStats: React.FC<Props> = ({ studentId, classId, subjectId }) => {
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().startOf('month'),
        dayjs().endOf('month')
    ]);
    const [exporting, setExporting] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const { loading, studentStats, classStats } = useSelector((state: RootState) => state.attendance);

    useEffect(() => {
        fetchStats();
    }, [studentId, classId, subjectId, dateRange, dispatch]);

    const exportToCSV = async () => {
        const data = studentStats?.daily_records || classStats?.student_stats || [];
        if (data.length === 0) {
            message.warning('No data available to export');
            return;
        }

        setExporting(true);
        try {
            let csvContent = '';

            if (studentStats) {
                // Export student's daily records
                csvContent = 'Date,Status\n';
                csvContent += studentStats.daily_records
                    .map(record => `${dayjs(record.date).format('DD/MM/YYYY')},${record.status}`)
                    .join('\n');
            } else if (classStats) {
                // Export class stats
                csvContent = 'Student ID,Total Classes,Present,Absent,Late,Attendance %\n';
                csvContent += classStats.student_stats
                    .map(student => {
                        const stats = student.total_stats;
                        return [
                            student.student_id,
                            stats.total_classes,
                            stats.present,
                            stats.absent,
                            stats.late,
                            `${stats.percentage.toFixed(1)}%`
                        ].join(',');
                    })
                    .join('\n');
            }

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `attendance_report_${dayjs().format('YYYY-MM-DD')}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                message.success('Report exported successfully');
            } else {
                throw new Error('Download functionality not supported by browser');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to export report';
            message.error(errorMessage);
            console.error('Export error:', error);
        } finally {
            setExporting(false);
        }
    };

    const fetchStats = async () => {
        try {
            if (studentId) {
                await dispatch(fetchStudentStats({
                    student_id: studentId,
                    start_date: dateRange[0].format('YYYY-MM-DD'),
                    end_date: dateRange[1].format('YYYY-MM-DD'),
                    subject_id: subjectId
                })).unwrap();
            }
            if (classId) {
                await dispatch(fetchClassStats({
                    class_id: classId,
                    start_date: dateRange[0].format('YYYY-MM-DD'),
                    end_date: dateRange[1].format('YYYY-MM-DD'),
                    subject_id: subjectId
                })).unwrap();
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch attendance stats';
            console.error('Failed to fetch attendance stats:', errorMessage);
            message.error(errorMessage);
        }
    };

    const hasData = studentStats?.daily_records || classStats?.student_stats;

    return (
        <Spin spinning={loading} tip="Loading attendance data...">
            <Card title="Attendance Statistics">
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle" justify="space-between">
                    <Col>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                            style={{ width: '100%' }}
                            disabled={loading}
                        />
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={exporting ? <LoadingOutlined /> : <DownloadOutlined />}
                            onClick={exportToCSV}
                            disabled={!hasData || loading || exporting}
                            loading={exporting}
                        >
                            {exporting ? 'Exporting...' : 'Export Report'}
                        </Button>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Classes"
                                value={studentStats?.total_stats.total_classes || classStats?.total_stats.total_classes || 0}
                                suffix={`/ ${studentStats?.total_stats.total_classes || classStats?.total_stats.total_classes || 0}`}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Present"
                                value={studentStats?.total_stats.present || classStats?.total_stats.present || 0}
                                suffix={`(${(((studentStats?.total_stats.present || classStats?.total_stats.present || 0) /
                                    (studentStats?.total_stats.total_classes || classStats?.total_stats.total_classes || 1)) * 100).toFixed(1)}%)`}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Absent"
                                value={studentStats?.total_stats.absent || classStats?.total_stats.absent || 0}
                                suffix={`(${(((studentStats?.total_stats.absent || classStats?.total_stats.absent || 0) /
                                    (studentStats?.total_stats.total_classes || classStats?.total_stats.total_classes || 1)) * 100).toFixed(1)}%)`}
                                valueStyle={{ color: '#cf1322' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Late"
                                value={studentStats?.total_stats.late || classStats?.total_stats.late || 0}
                                suffix={`(${(((studentStats?.total_stats.late || classStats?.total_stats.late || 0) /
                                    (studentStats?.total_stats.total_classes || classStats?.total_stats.total_classes || 1)) * 100).toFixed(1)}%)`}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Row style={{ marginTop: 24 }}>
                    <Col span={24}>
                        <Card title="Attendance Overview">
                            <Progress
                                percent={studentStats?.total_stats.percentage || classStats?.total_stats.percentage || 0}
                                success={{
                                    percent: (
                                        (studentStats?.total_stats.present || classStats?.total_stats.present || 0) /
                                        (studentStats?.total_stats.total_classes || classStats?.total_stats.total_classes || 1)
                                    ) * 100
                                }}
                                trailColor="#ffccc7"
                                type="circle"
                                format={(percent) => `${percent?.toFixed(1)}%`}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Daily Records Table */}
                {studentStats?.daily_records && (
                    <Card title="Daily Attendance Records" style={{ marginTop: 24 }}>
                        <Table
                            dataSource={studentStats.daily_records}
                            columns={[
                                {
                                    title: 'Date',
                                    dataIndex: 'date',
                                    key: 'date',
                                    render: (date: string) => dayjs(date).format('DD MMM YYYY')
                                },
                                {
                                    title: 'Status',
                                    dataIndex: 'status',
                                    key: 'status',
                                    render: (status: string) => (
                                        <span style={{
                                            color: status === 'PRESENT' ? '#3f8600' :
                                                status === 'ABSENT' ? '#cf1322' :
                                                    status === 'LATE' ? '#faad14' : '#1890ff'
                                        }}>
                                            {status}
                                        </span>
                                    )
                                }
                            ]}
                            pagination={{ pageSize: 10 }}
                            rowKey="date"
                            size="small"
                            loading={loading}
                        />
                    </Card>
                )}

                {/* Class Stats Table */}
                {classStats?.student_stats && (
                    <Card title="Class Attendance Records" style={{ marginTop: 24 }}>
                        <Table
                            dataSource={classStats.student_stats}
                            columns={[
                                {
                                    title: 'Student ID',
                                    dataIndex: 'student_id',
                                    key: 'student_id'
                                },
                                {
                                    title: 'Present',
                                    dataIndex: ['total_stats', 'present'],
                                    key: 'present',
                                    render: (present: number, record: any) => (
                                        `${present} (${((present / record.total_stats.total_classes) * 100).toFixed(1)}%)`
                                    )
                                },
                                {
                                    title: 'Absent',
                                    dataIndex: ['total_stats', 'absent'],
                                    key: 'absent',
                                    render: (absent: number, record: any) => (
                                        `${absent} (${((absent / record.total_stats.total_classes) * 100).toFixed(1)}%)`
                                    )
                                },
                                {
                                    title: 'Late',
                                    dataIndex: ['total_stats', 'late'],
                                    key: 'late',
                                    render: (late: number, record: any) => (
                                        `${late} (${((late / record.total_stats.total_classes) * 100).toFixed(1)}%)`
                                    )
                                },
                                {
                                    title: 'Attendance %',
                                    dataIndex: ['total_stats', 'percentage'],
                                    key: 'percentage',
                                    render: (percentage: number) => `${percentage.toFixed(1)}%`,
                                    sorter: (a, b) => a.total_stats.percentage - b.total_stats.percentage
                                }
                            ]}
                            pagination={{ pageSize: 10 }}
                            rowKey="student_id"
                            size="small"
                            loading={loading}
                        />
                    </Card>
                )}
            </Card>
        </Spin>
    );
};
