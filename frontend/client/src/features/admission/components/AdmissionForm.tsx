import React, { useEffect } from 'react';
import { Form, Input, DatePicker, Select, Button, Space, Card, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { AppDispatch } from '../../../store';
import { createStudent, updateStudent, fetchStudentById } from '../../../store/slices/admissionSlice';
import dayjs from 'dayjs';
import { Student } from '../types/admission.types';

const { Option } = Select;

const AdmissionForm: React.FC = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            dispatch(fetchStudentById(Number(id)))
                .unwrap()
                .then((student) => {
                    const formData = {
                        ...student,
                        date_of_birth: dayjs(student.date_of_birth),
                    };
                    form.setFieldsValue(formData);
                })
                .catch(() => {
                    message.error('Failed to fetch student details');
                    navigate('/admission');
                });
        }
    }, [id, dispatch, form, navigate]);

    const onFinish = async (values: any) => {
        try {
            const studentData: Student = {
                ...values,
                date_of_birth: values.date_of_birth.format('YYYY-MM-DD'),
            };

            if (id) {
                await dispatch(updateStudent({ id: Number(id), data: studentData })).unwrap();
                message.success('Student updated successfully');
            } else {
                await dispatch(createStudent(studentData)).unwrap();
                message.success('Student admitted successfully');
            }
            navigate('/admission');
        } catch (error) {
            message.error('Failed to save student data');
        }
    };

    return (
        <div className="p-6">
            <Card title={id ? 'Edit Student' : 'New Admission'}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        guardians: [{}],
                    }}
                >
                    {/* Personal Information */}
                    <Card title="Personal Information" className="mb-4">
                        <Form.Item
                            name="first_name"
                            label="First Name"
                            rules={[{ required: true, message: 'First name is required' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item name="middle_name" label="Middle Name">
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
                            name="date_of_birth"
                            label="Date of Birth"
                            rules={[{ required: true, message: 'Date of birth is required' }]}
                        >
                            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="gender"
                            label="Gender"
                            rules={[{ required: true, message: 'Gender is required' }]}
                        >
                            <Select>
                                <Option value="male">Male</Option>
                                <Option value="female">Female</Option>
                                <Option value="other">Other</Option>
                            </Select>
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
                            name="email"
                            label="Email"
                            rules={[{ type: 'email', message: 'Invalid email address' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="nationality"
                            label="Nationality"
                            rules={[{ required: true, message: 'Nationality is required' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Card>

                    {/* Address Information */}
                    <Card title="Address Information" className="mb-4">
                        <Form.Item
                            name="permanent_address"
                            label="Permanent Address"
                            rules={[{ required: true, message: 'Permanent address is required' }]}
                        >
                            <Input.TextArea rows={3} />
                        </Form.Item>

                        <Form.Item name="temporary_address" label="Temporary Address">
                            <Input.TextArea rows={3} />
                        </Form.Item>
                    </Card>

                    {/* Guardian Information */}
                    <Card title="Guardian Information" className="mb-4">
                        <Form.List name="guardians">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <div key={key} className="border p-4 mb-4 rounded">
                                            <Space align="baseline" className="w-full justify-between">
                                                <div className="flex-grow">
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'full_name']}
                                                        label="Full Name"
                                                        rules={[{ required: true, message: 'Name is required' }]}
                                                    >
                                                        <Input />
                                                    </Form.Item>

                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'relationship']}
                                                        label="Relationship"
                                                        rules={[{ required: true, message: 'Relationship is required' }]}
                                                    >
                                                        <Input />
                                                    </Form.Item>

                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'contact_number']}
                                                        label="Contact Number"
                                                        rules={[{ required: true, message: 'Contact number is required' }]}
                                                    >
                                                        <Input />
                                                    </Form.Item>

                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'email']}
                                                        label="Email"
                                                    >
                                                        <Input />
                                                    </Form.Item>

                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'occupation']}
                                                        label="Occupation"
                                                    >
                                                        <Input />
                                                    </Form.Item>

                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'address']}
                                                        label="Address"
                                                    >
                                                        <Input.TextArea />
                                                    </Form.Item>
                                                </div>
                                                {fields.length > 1 && (
                                                    <MinusCircleOutlined
                                                        className="text-red-500 text-xl"
                                                        onClick={() => remove(name)}
                                                    />
                                                )}
                                            </Space>
                                        </div>
                                    ))}
                                    <Form.Item>
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                        >
                                            Add Guardian
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Card>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {id ? 'Update' : 'Submit'}
                            </Button>
                            <Button onClick={() => navigate('/admission')}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AdmissionForm;
