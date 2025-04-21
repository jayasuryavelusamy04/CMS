import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Card, message, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createStaff, updateStaff } from '../../../store/slices/staffSlice';
import { AppDispatch } from '../../../store';
import dayjs from 'dayjs';
import type { Staff } from '../types/staff.types';

const { Option } = Select;
const { TextArea } = Input;

const StaffForm: React.FC = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { id } = useParams();
    const { staff, loading } = useSelector((state: any) => state.staff);

    useEffect(() => {
        if (id) {
            const currentStaff = staff.find((s: Staff) => s.id === parseInt(id));
            if (currentStaff) {
                form.setFieldsValue({
                    ...currentStaff,
                    joining_date: dayjs(currentStaff.joining_date)
                });
            }
        }
    }, [id, staff, form]);

    const onFinish = async (values: any) => {
        try {
            const staffData = {
                ...values,
                joining_date: values.joining_date.format('YYYY-MM-DD')
            };

            if (id) {
                await dispatch(updateStaff({ id: parseInt(id), data: staffData })).unwrap();
                message.success('Staff member updated successfully');
            } else {
                await dispatch(createStaff(staffData)).unwrap();
                message.success('Staff member created successfully');
            }
            navigate('/staff');
        } catch (error) {
            message.error('Failed to save staff data');
        }
    };

    return (
        <div className="p-6">
            <Card title={id ? 'Edit Staff Member' : 'Add New Staff Member'}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        is_active: true
                    }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            name="employee_id"
                            label="Employee ID"
                            rules={[{ required: true, message: 'Employee ID is required' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="role"
                            label="Role"
                            rules={[{ required: true, message: 'Role is required' }]}
                        >
                            <Select>
                                <Option value="teacher">Teacher</Option>
                                <Option value="admin">Admin</Option>
                                <Option value="non_teaching">Non Teaching</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="first_name"
                            label="First Name"
                            rules={[{ required: true, message: 'First name is required' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="last_name"
                            label="Last Name"
                            rules={[{ required: true, message: 'Last name is required' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Email is required' },
                                { type: 'email', message: 'Invalid email format' }
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="contact_number"
                            label="Contact Number"
                            rules={[
                                { required: true, message: 'Contact number is required' },
                                { pattern: /^\+?[1-9]\d{9,14}$/, message: 'Invalid contact number' }
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="joining_date"
                            label="Joining Date"
                            rules={[{ required: true, message: 'Joining date is required' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="is_active"
                            label="Status"
                            rules={[{ required: true }]}
                        >
                            <Select>
                                <Option value={true}>Active</Option>
                                <Option value={false}>Inactive</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="address"
                        label="Address"
                        rules={[{ required: true, message: 'Address is required' }]}
                    >
                        <TextArea rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="qualifications"
                        label="Qualifications"
                    >
                        <TextArea rows={3} />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {id ? 'Update' : 'Create'}
                            </Button>
                            <Button onClick={() => navigate('/staff')}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default StaffForm;
