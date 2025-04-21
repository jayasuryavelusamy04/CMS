import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Card, Tabs, Table, DatePicker, Space, Select, Tag, Progress } from 'antd';
import { AppDispatch } from '../../../store';
import {
    fetchStudentAttendance,
    fetchStudentMarks,
    getAttendanceStats,
    getSubjectAverage
} from '../../../store/slices/studentProfileSlice';
import dayjs from 'dayjs';
import type { Attendance, Mark } from '../types/student-profile.types';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const StudentProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { selectedProfile, attendances, marks, loading } = useSelector((state: any) => state.studentProfile);
    const [activeTab, setActiveTab] = useState('1');
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(30, 'days'),
        dayjs()
    ]);

    useEffect(() => {
        if (id) {
            // Fetch initial data
            handleAttendanceFilter();
        }
    }, [id]);

    const handleAttendanceFilter = async () => {
        if (id && dateRange) {
            await dispatch(fetchStudentAttendance({
                profileId: parseInt(id),
                filters: {
                    start_date: dateRange[0].format('YYYY-MM-DD'),
                    end_date: dateRange[1].format('YYYY-MM-DD')
                }
            }));
            await dispatch(getAttendanceStats({ profileId: parseInt(id) }));
        }
    };

    const handleSubjectMarks = async (subjectId: number) => {
        if (id) {
            await dispatch(fetchStudentMarks({
                profileId: parseInt(id),
                filters: { subject_id: subjectId }
            }));
            await dispatch(getSubjectAverage({ 
                profileId: parseInt(id),
                subjectId 
            }));
        }
    };

    const attendanceColumns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: 'Subject',
            dataIndex: ['subject', 'name'],
            key: 'subject'
        },
        {
            title: 'Period',
            dataIndex: 'period',
            key: 'period'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={
                    status === 'present' ? 'green' :
                    status === 'absent' ? 'red' : 'orange'
                }>
                    {status.toUpperCase()}
                </Tag>
            )
        }
    ];

    const marksColumns = [
        {
            title: 'Subject',
            dataIndex: ['subject', 'name'],
            key: 'subject'
        },
        {
            title: 'Exam Type',
            dataIndex: 'exam_type',
            key: 'exam_type',
            render: (type: string) => type.replace('_', ' ').toUpperCase()
        },
        {
            title: 'Marks',
            key: 'marks',
            render: (record: Mark) => `${record.marks_obtained}/${record.max_marks}`
        },
        {
            title: 'Percentage',
            key: 'percentage',
            render: (record: Mark) => (
                <Progress
                    percent={Math.round((record.marks_obtained / record.max_marks) * 100)}
                    size="small"
                />
            )
        }
    ];

    return (
        <div className="p-6">
            <Card loading={loading}>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="Personal Details" key="1">
                        {selectedProfile && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-bold mb-2">Student Information</h3>
                                    <p><strong>Name:</strong> {selectedProfile.student.first_name} {selectedProfile.student.last_name}</p>
                                    <p><strong>Roll Number:</strong> {selectedProfile.rollnumber}</p>
                                    <p><strong>Academic Year:</strong> {selectedProfile.academic_year}</p>
                                    <p><strong>Status:</strong> {selectedProfile.is_active ? 'Active' : 'Inactive'}</p>
                                </div>
                                <div>
                                    <h3 className="font-bold mb-2">Class Information</h3>
                                    <p><strong>Class:</strong> {selectedProfile.student.class_section?.class_name}</p>
                                    <p><strong>Section:</strong> {selectedProfile.student.class_section?.section}</p>
                                </div>
                            </div>
                        )}
                    </TabPane>

                    <TabPane tab="Attendance" key="2">
                        <Space direction="vertical" className="w-full">
                            <div className="flex justify-end mb-4">
                                <RangePicker
                                    value={dateRange}
                                    onChange={(dates) => {
                                        if (dates) {
                                            setDateRange([dates[0]!, dates[1]!]);
                                            handleAttendanceFilter();
                                        }
                                    }}
                                />
                            </div>
                            <Table
                                columns={attendanceColumns}
                                dataSource={attendances}
                                rowKey="id"
                                pagination={false}
                            />
                        </Space>
                    </TabPane>

                    <TabPane tab="Marks" key="3">
                        <Table
                            columns={marksColumns}
                            dataSource={marks}
                            rowKey="id"
                            pagination={false}
                        />
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default StudentProfile;
