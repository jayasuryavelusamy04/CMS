import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Card, Space, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createCourse, updateCourse } from '../../../store/slices/courseSlice';
import { AppDispatch } from '../../../store';
import type { Course } from '../types/course.types';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const CourseForm: React.FC = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { id } = useParams();

    const { courses, loading } = useSelector((state: any) => state.course);
    const { classSections } = useSelector((state: any) => state.classSection);
    const { subjects } = useSelector((state: any) => state.subject);

    useEffect(() => {
        if (id) {
            const currentCourse = courses.find((c: Course) => c.id === parseInt(id));
            if (currentCourse) {
                form.setFieldsValue({
                    ...currentCourse,
                    duration: [
                        dayjs(currentCourse.start_date),
                        dayjs(currentCourse.end_date)
                    ]
                });
            }
        }
    }, [id, courses, form]);

    const onFinish = async (values: any) => {
        try {
            const courseData = {
                ...values,
                start_date: values.duration[0].format('YYYY-MM-DD'),
                end_date: values.duration[1].format('YYYY-MM-DD')
            };
            delete courseData.duration;

            if (id) {
                await dispatch(updateCourse({ id: parseInt(id), data: courseData })).unwrap();
                message.success('Course updated successfully');
            } else {
                await dispatch(createCourse(courseData)).unwrap();
                message.success('Course created successfully');
            }
            navigate('/courses');
        } catch (error) {
            message.error('Failed to save course');
        }
    };

    return (
        <div className="p-6">
            <Card title={id ? 'Edit Course' : 'Add New Course'}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            name="name"
                            label="Course Name"
                            rules={[{ required: true, message: 'Please enter course name' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="code"
                            label="Course Code"
                            rules={[{ required: true, message: 'Please enter course code' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="class_section_id"
                            label="Class & Section"
                            rules={[{ required: true, message: 'Please select class and section' }]}
                        >
                            <Select>
                                {classSections?.map((cs: any) => (
                                    <Option key={cs.id} value={cs.id}>
                                        {`${cs.class_name} - ${cs.section}`}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="subject_id"
                            label="Subject"
                            rules={[{ required: true, message: 'Please select subject' }]}
                        >
                            <Select>
                                {subjects?.map((subject: any) => (
                                    <Option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="duration"
                            label="Course Duration"
                            rules={[{ required: true, message: 'Please select course duration' }]}
                        >
                            <RangePicker 
                                style={{ width: '100%' }}
                                format="YYYY-MM-DD"
                            />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {id ? 'Update Course' : 'Create Course'}
                            </Button>
                            <Button onClick={() => navigate('/courses')}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CourseForm;
