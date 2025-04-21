import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Table, Button, Form, Select, TimePicker, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { createTimetableSlot, updateTimetableSlot, deleteTimetableSlot, fetchTimetableSlots } from '../../../store/slices/timetableSlice';
import { AppDispatch } from '../../../store';
import type { TimetableSlot } from '../types/course.types';
import dayjs from 'dayjs';

const { Option } = Select;

const weekDays = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' },
];

const TimetableForm: React.FC = () => {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [form] = Form.useForm();

    const { timetableSlots, loading } = useSelector((state: any) => state.timetable);
    const { teachers } = useSelector((state: any) => state.staff);

    useEffect(() => {
        if (courseId) {
            dispatch(fetchTimetableSlots(parseInt(courseId)));
        }
    }, [dispatch, courseId]);

    const columns = [
        {
            title: 'Day',
            dataIndex: 'day_of_week',
            key: 'day_of_week',
            render: (day: number) => weekDays.find(d => d.value === day)?.label
        },
        {
            title: 'Start Time',
            dataIndex: 'start_time',
            key: 'start_time',
            render: (time: string) => dayjs(time, 'HH:mm:ss').format('hh:mm A')
        },
        {
            title: 'End Time',
            dataIndex: 'end_time',
            key: 'end_time',
            render: (time: string) => dayjs(time, 'HH:mm:ss').format('hh:mm A')
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher',
            key: 'teacher',
            render: (teacher: any) => teacher ? `${teacher.first_name} ${teacher.last_name}` : '-'
        },
        {
            title: 'Room',
            dataIndex: 'room',
            key: 'room'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: TimetableSlot) => (
                <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record.id)}
                >
                    Delete
                </Button>
            )
        }
    ];

    const handleSubmit = async (values: any) => {
        try {
            const slotData = {
                course_id: parseInt(courseId!),
                ...values,
                start_time: values.time[0].format('HH:mm:ss'),
                end_time: values.time[1].format('HH:mm:ss')
            };
            delete slotData.time;

            await dispatch(createTimetableSlot(slotData)).unwrap();
            message.success('Timetable slot added successfully');
            form.resetFields();
        } catch (error) {
            message.error('Failed to add timetable slot');
        }
    };

    const handleDelete = async (slotId: number) => {
        try {
            await dispatch(deleteTimetableSlot(slotId)).unwrap();
            message.success('Timetable slot deleted successfully');
        } catch (error) {
            message.error('Failed to delete timetable slot');
        }
    };

    return (
        <div className="p-6">
            <Card
                title="Course Timetable"
                extra={
                    <Button onClick={() => navigate('/courses')}>
                        Back to Courses
                    </Button>
                }
            >
                <div className="mb-6">
                    <Card title="Add Timetable Slot">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Form.Item
                                    name="day_of_week"
                                    label="Day"
                                    rules={[{ required: true, message: 'Please select a day' }]}
                                >
                                    <Select>
                                        {weekDays.map(day => (
                                            <Option key={day.value} value={day.value}>
                                                {day.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="time"
                                    label="Time"
                                    rules={[{ required: true, message: 'Please select time' }]}
                                >
                                    <TimePicker.RangePicker
                                        format="HH:mm"
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="teacher_id"
                                    label="Teacher"
                                    rules={[{ required: true, message: 'Please select a teacher' }]}
                                >
                                    <Select>
                                        {teachers?.map((teacher: any) => (
                                            <Option key={teacher.id} value={teacher.id}>
                                                {`${teacher.first_name} ${teacher.last_name}`}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="room"
                                    label="Room"
                                >
                                    <Select>
                                        <Option value="Room 101">Room 101</Option>
                                        <Option value="Room 102">Room 102</Option>
                                        <Option value="Room 103">Room 103</Option>
                                        <Option value="Lab 1">Lab 1</Option>
                                        <Option value="Lab 2">Lab 2</Option>
                                    </Select>
                                </Form.Item>
                            </div>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<PlusOutlined />}
                                    loading={loading}
                                >
                                    Add Slot
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </div>

                <Table
                    columns={columns}
                    dataSource={timetableSlots}
                    rowKey="id"
                    loading={loading}
                />
            </Card>
        </div>
    );
};

export default TimetableForm;
