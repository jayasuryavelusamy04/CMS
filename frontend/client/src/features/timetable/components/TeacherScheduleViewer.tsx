import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Alert, Spin } from 'antd';
import { api } from '../../../utils/api';
import { TimetableSlot } from '../types/timetable.types';
import dayjs from 'dayjs';

interface Props {
    teacherId: number;
    excludeSlotId?: number;
    highlightConflicts?: boolean;
    currentPeriod?: {
        day_of_week: number;
        start_time: string;
        end_time: string;
    };
}

const weekDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
];

const TeacherScheduleViewer: React.FC<Props> = ({
    teacherId,
    excludeSlotId,
    highlightConflicts = false,
    currentPeriod
}) => {
    const [loading, setLoading] = useState(false);
    const [schedule, setSchedule] = useState<TimetableSlot[]>([]);
    const [conflicts, setConflicts] = useState<boolean>(false);

    useEffect(() => {
        if (teacherId) {
            fetchSchedule();
        }
    }, [teacherId]);

    useEffect(() => {
        if (highlightConflicts && currentPeriod) {
            checkConflicts();
        }
    }, [schedule, currentPeriod]);

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/timetable/slots/?teacher_id=${teacherId}`);
            const slots = response.data.items.filter((slot: TimetableSlot) => 
                slot.id !== excludeSlotId
            );
            setSchedule(slots);
        } catch (error) {
            console.error('Failed to fetch teacher schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkConflicts = () => {
        if (!currentPeriod) return;

        const hasConflict = schedule.some(slot => {
            if (!slot.period) return false;

            return slot.period.day_of_week === currentPeriod.day_of_week &&
                ((dayjs(slot.period.start_time, 'HH:mm:ss').isBefore(dayjs(currentPeriod.end_time, 'HH:mm:ss')) &&
                    dayjs(slot.period.end_time, 'HH:mm:ss').isAfter(dayjs(currentPeriod.start_time, 'HH:mm:ss')))
            );
        });

        setConflicts(hasConflict);
    };

    const columns = [
        {
            title: 'Day',
            dataIndex: ['period', 'day_of_week'],
            key: 'day',
            render: (day: number) => weekDays[day],
            filters: weekDays.map((day, index) => ({ text: day, value: index })),
            onFilter: (value: number, record: TimetableSlot) => 
                record.period?.day_of_week === value
        },
        {
            title: 'Time',
            key: 'time',
            render: (text: string, record: TimetableSlot) => (
                <span>
                    {dayjs(record.period?.start_time, 'HH:mm:ss').format('HH:mm')} - 
                    {dayjs(record.period?.end_time, 'HH:mm:ss').format('HH:mm')}
                </span>
            )
        },
        {
            title: 'Subject',
            dataIndex: ['subject', 'name'],
            key: 'subject'
        },
        {
            title: 'Class',
            key: 'class',
            render: (text: string, record: TimetableSlot) => (
                <span>
                    {record.period?.class_section?.class_name} - 
                    {record.period?.class_section?.section}
                </span>
            )
        },
        {
            title: 'Room',
            dataIndex: 'room',
            key: 'room',
            render: (room: string) => <Tag color="blue">{room}</Tag>
        }
    ];

    return (
        <Card title="Teacher's Schedule">
            {loading ? (
                <div className="text-center py-8">
                    <Spin tip="Loading schedule..." />
                </div>
            ) : (
                <>
                    {highlightConflicts && conflicts && (
                        <Alert
                            type="error"
                            message="Schedule Conflict"
                            description="This teacher already has a class scheduled during this time slot."
                            className="mb-4"
                            showIcon
                        />
                    )}

                    {schedule.length === 0 ? (
                        <Alert
                            type="info"
                            message="No classes scheduled"
                            description="This teacher currently has no scheduled classes."
                            showIcon
                        />
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={schedule}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            rowClassName={(record) => {
                                if (highlightConflicts && currentPeriod && record.period) {
                                    const isConflict = 
                                        record.period.day_of_week === currentPeriod.day_of_week &&
                                        dayjs(record.period.start_time, 'HH:mm:ss').isBefore(dayjs(currentPeriod.end_time, 'HH:mm:ss')) &&
                                        dayjs(record.period.end_time, 'HH:mm:ss').isAfter(dayjs(currentPeriod.start_time, 'HH:mm:ss'));
                                    return isConflict ? 'bg-red-50' : '';
                                }
                                return '';
                            }}
                        />
                    )}
                </>
            )}
        </Card>
    );
};

export default TeacherScheduleViewer;
