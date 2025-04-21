import React, { useState, useEffect } from 'react';
import { Card, Form, Select, TimePicker, Button, Table, Space, message } from 'antd';
import { useDispatch } from 'react-redux';
import { setAvailability } from '../../../store/slices/staffSlice';
import { AppDispatch } from '../../../store';
import type { StaffAvailability as StaffAvailabilityType } from '../types/staff.types';
import dayjs from 'dayjs';

const { Option } = Select;

interface Props {
    staffId: number;
    availabilities?: StaffAvailabilityType[];
}

const weekDays = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' },
];

const StaffAvailability: React.FC<Props> = ({ staffId, availabilities = [] }) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);

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
            title: 'Status',
            dataIndex: 'is_available',
            key: 'is_available',
            render: (available: boolean) => (
                <span className={available ? 'text-green-600' : 'text-red-600'}>
                    {available ? 'Available' : 'Unavailable'}
                </span>
            )
        },
        {
            title: 'Reason',
            dataIndex: 'reason',
            key: 'reason'
        }
    ];

    const onFinish = async (values: any) => {
        try {
            setLoading(true);
            const data = {
                staff_id: staffId,
                day_of_week: values.day_of_week,
                start_time: values.time[0].format('HH:mm:ss'),
                end_time: values.time[1].format('HH:mm:ss'),
                is_available: values.is_available,
                reason: values.reason
            };

            await dispatch(setAvailability(data)).unwrap();
            message.success('Availability set successfully');
            form.resetFields();
        } catch (error) {
            message.error('Failed to set availability');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card title="Set Availability">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            name="day_of_week"
                            label="Day of Week"
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
                            label="Time Range"
                            rules={[{ required: true, message: 'Please select time range' }]}
                        >
                            <TimePicker.RangePicker 
                                format="HH:mm"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="is_available"
                            label="Availability Status"
                            initialValue={true}
                        >
                            <Select>
                                <Option value={true}>Available</Option>
                                <Option value={false}>Unavailable</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="reason"
                            label="Reason"
                        >
                            <Select>
                                <Option value="regular">Regular Schedule</Option>
                                <Option value="leave">On Leave</Option>
                                <Option value="meeting">Meeting</Option>
                                <Option value="other">Other</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Set Availability
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="Current Availability Schedule">
                <Table
                    columns={columns}
                    dataSource={availabilities}
                    rowKey="id"
                    pagination={false}
                />
            </Card>
        </div>
    );
};

export default StaffAvailability;
