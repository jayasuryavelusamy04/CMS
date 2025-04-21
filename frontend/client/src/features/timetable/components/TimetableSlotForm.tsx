import React, { useEffect, useState } from 'react';
import { Form, Select, Input, Button, Card, message, Drawer } from 'antd';
import { useDispatch } from 'react-redux';
import { createTimetableSlot, updateTimetableSlot } from '../../../store/slices/timetableSlice';
import { AppDispatch } from '../../../store';
import { api } from '../../../utils/api';
import type { TimetableSlot } from '../types/timetable.types';
import TeacherScheduleViewer from './TeacherScheduleViewer';

const { Option } = Select;

interface Props {
    periodId: number;
    periodInfo: {
        day_of_week: number;
        start_time: string;
        end_time: string;
    };
    initialData?: TimetableSlot;
    onSuccess?: () => void;
    onCancel?: () => void;
}

interface Subject {
    id: number;
    name: string;
}

interface Teacher {
    id: number;
    first_name: string;
    last_name: string;
}

const TimetableSlotForm: React.FC<Props> = ({
    periodId,
    periodInfo,
    initialData,
    onSuccess,
    onCancel
}) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [showSchedule, setShowSchedule] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);

    useEffect(() => {
        fetchSubjectsAndTeachers();
        if (initialData) {
            form.setFieldsValue({
                subject_id: initialData.subject_id,
                teacher_id: initialData.teacher_id,
                room: initialData.room
            });
            setSelectedTeacher(initialData.teacher_id);
        }
    }, [initialData]);

    const fetchSubjectsAndTeachers = async () => {
        try {
            const [subjectsRes, teachersRes] = await Promise.all([
                api.get('/subjects/'),
                api.get('/staff/?role=teacher')
            ]);
            setSubjects(subjectsRes.data.items);
            setTeachers(teachersRes.data.items);
        } catch (error) {
            console.error('Failed to fetch form data:', error);
            message.error('Failed to load required data');
        }
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const slotData = {
                ...values,
                period_id: periodId,
            };

            if (initialData) {
                await dispatch(updateTimetableSlot({
                    id: initialData.id,
                    ...slotData
                })).unwrap();
                message.success('Timetable slot updated successfully');
            } else {
                await dispatch(createTimetableSlot(slotData)).unwrap();
                message.success('Timetable slot created successfully');
            }

            onSuccess?.();
            form.resetFields();
        } catch (error: any) {
            message.error('Failed to save timetable slot: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTeacherChange = (teacherId: number) => {
        setSelectedTeacher(teacherId);
        setShowSchedule(true);
    };

    return (
        <>
            <Card title={initialData ? "Edit Timetable Slot" : "Add New Timetable Slot"}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        subject_id: initialData?.subject_id,
                        teacher_id: initialData?.teacher_id,
                        room: initialData?.room
                    }}
                >
                    <Form.Item
                        name="subject_id"
                        label="Subject"
                        rules={[{ required: true, message: 'Please select a subject' }]}
                    >
                        <Select placeholder="Select subject">
                            {subjects.map(subject => (
                                <Option key={subject.id} value={subject.id}>
                                    {subject.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="teacher_id"
                        label="Teacher"
                        rules={[{ required: true, message: 'Please select a teacher' }]}
                        extra={selectedTeacher && (
                            <Button 
                                type="link" 
                                onClick={() => setShowSchedule(true)}
                                className="p-0"
                            >
                                View teacher's schedule
                            </Button>
                        )}
                    >
                        <Select 
                            placeholder="Select teacher"
                            showSearch
                            optionFilterProp="children"
                            onChange={handleTeacherChange}
                        >
                            {teachers.map(teacher => (
                                <Option key={teacher.id} value={teacher.id}>
                                    {`${teacher.first_name} ${teacher.last_name}`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="room"
                        label="Room"
                        rules={[{ required: true, message: 'Please enter room number/name' }]}
                    >
                        <Input placeholder="Enter room number/name" />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <div className="flex justify-end space-x-2">
                            <Button onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {initialData ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>

            <Drawer
                title="Teacher's Schedule"
                placement="right"
                width={720}
                onClose={() => setShowSchedule(false)}
                open={showSchedule}
            >
                {selectedTeacher && (
                    <TeacherScheduleViewer
                        teacherId={selectedTeacher}
                        excludeSlotId={initialData?.id}
                        highlightConflicts={true}
                        currentPeriod={periodInfo}
                    />
                )}
            </Drawer>
        </>
    );
};

export default TimetableSlotForm;
