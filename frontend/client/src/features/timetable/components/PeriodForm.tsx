import React, { useEffect } from 'react';
import { Form, Input, Select, TimePicker, Button, Card, Space, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { createPeriod } from '../../../store/slices/timetableSlice';
import type { PeriodFormData } from '../types/timetable.types';
import { AppDispatch } from '../../../store';
import dayjs from 'dayjs';

const { Option } = Select;

interface Props {
    classSectionId: number;
    onSuccess?: () => void;
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

const PeriodForm: React.FC<Props> = ({ classSectionId, onSuccess }) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((state: any) => state.timetable);

    useEffect(() => {
        if (error) {
            message.error(error);
        }
    }, [error]);

    const handleSubmit = async (values: any) => {
        try {
            const periodData: PeriodFormData = {
                name: values.name,
                day_of_week: values.day_of_week,
                start_time: values.time[0].format('HH:mm:ss'),
                end_time: values.time[1].format('HH:mm:ss'),
                class_section_id: classSectionId,
                is_active: true
            };

            await dispatch(createPeriod(periodData)).unwrap();
            message.success('Period created successfully');
            form.resetFields();
            onSuccess?.();
        } catch (error: any) {
            message.error('Failed to create period: ' + error.message);
        }
    };

    return (
        <Card title="Add New Period">
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                        name="name"
                        label="Period Name"
                        rules={[{ required: true, message: 'Please enter period name' }]}
                    >
                        <Input placeholder="e.g., Period 1" />
                    </Form.Item>

                    <Form.Item
                        name="day_of_week"
                        label="Day of Week"
                        rules={[{ required: true, message: 'Please select day of week' }]}
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
                        rules={[
                            { required: true, message: 'Please select time range' },
                            {
                                validator: async (_, value) => {
                                    if (value && value[0] && value[1]) {
                                        if (value[0].isAfter(value[1])) {
                                            throw new Error('End time must be after start time');
                                        }
                                    }
                                }
                            }
                        ]}
                    >
                        <TimePicker.RangePicker
                            format="HH:mm"
                            minuteStep={5}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </div>

                <Form.Item className="mb-0">
                    <Space>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            Create Period
                        </Button>
                        <Button
                            onClick={() => form.resetFields()}
                        >
                            Reset
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default PeriodForm;
