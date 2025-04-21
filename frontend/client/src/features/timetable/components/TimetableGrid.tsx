import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Button, Space, Modal, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTimetableSlots, validateTimetable } from '../../../store/slices/timetableSlice';
import type { Period, TimetableSlot, WeeklyTimetable } from '../types/timetable.types';
import dayjs from 'dayjs';
import { AppDispatch } from '../../../store';

interface Props {
    classSectionId: number;
    onSlotClick?: (slot: TimetableSlot) => void;
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

const TimetableGrid: React.FC<Props> = ({ classSectionId, onSlotClick }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { timetableSlots, periods, loading, validationResult } = useSelector((state: any) => state.timetable);
    const [weeklyTimetable, setWeeklyTimetable] = useState<WeeklyTimetable>({});

    useEffect(() => {
        dispatch(fetchTimetableSlots(classSectionId));
    }, [dispatch, classSectionId]);

    useEffect(() => {
        organizeTimetable();
    }, [timetableSlots, periods]);

    const organizeTimetable = () => {
        const organized: WeeklyTimetable = {};
        
        // Initialize structure
        weekDays.forEach(day => {
            organized[day.value] = {};
            periods.forEach((period: Period) => {
                if (period.day_of_week === day.value) {
                    organized[day.value][period.id] = {
                        periodId: period.id,
                        dayOfWeek: day.value,
                        startTime: period.start_time,
                        endTime: period.end_time
                    };
                }
            });
        });

        // Fill in slot information
        timetableSlots.forEach((slot: TimetableSlot) => {
            const period = periods.find((p: Period) => p.id === slot.period_id);
            if (period) {
                organized[period.day_of_week][period.id] = {
                    ...organized[period.day_of_week][period.id],
                    subject: slot.subject?.name,
                    teacher: slot.teacher ? `${slot.teacher.first_name} ${slot.teacher.last_name}` : '',
                    room: slot.room
                };
            }
        });

        setWeeklyTimetable(organized);
    };

    const handleValidate = async () => {
        try {
            await dispatch(validateTimetable(classSectionId)).unwrap();
            if (validationResult?.is_valid) {
                message.success('Timetable validation successful');
            } else {
                Modal.warning({
                    title: 'Timetable Validation Issues',
                    content: (
                        <div>
                            {validationResult?.errors.map((error: string, index: number) => (
                                <p key={index} className="text-red-500">{error}</p>
                            ))}
                            {validationResult?.warnings.map((warning: string, index: number) => (
                                <p key={index} className="text-yellow-500">{warning}</p>
                            ))}
                        </div>
                    )
                });
            }
        } catch (error) {
            message.error('Failed to validate timetable');
        }
    };

    const columns = periods
        .filter((period: Period) => period.is_active)
        .sort((a: Period, b: Period) => dayjs(a.start_time).diff(dayjs(b.start_time)))
        .map((period: Period) => ({
            title: (
                <div className="text-center">
                    <div>{period.name}</div>
                    <div className="text-xs text-gray-500">
                        {`${dayjs(period.start_time, 'HH:mm:ss').format('HH:mm')} - ${dayjs(period.end_time, 'HH:mm:ss').format('HH:mm')}`}
                    </div>
                </div>
            ),
            dataIndex: ['periods', period.id],
            key: period.id,
            render: (_: any, record: any) => {
                const slot = weeklyTimetable[record.day]?.[period.id];
                if (!slot) return null;

                return (
                    <div
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => onSlotClick?.(slot)}
                    >
                        {slot.subject && (
                            <div>
                                <div className="font-medium">{slot.subject}</div>
                                {slot.teacher && (
                                    <div className="text-sm text-gray-600">{slot.teacher}</div>
                                )}
                                {slot.room && (
                                    <Tag color="blue">{slot.room}</Tag>
                                )}
                            </div>
                        )}
                    </div>
                );
            }
        }));

    const dataSource = weekDays.map(day => ({
        key: day.value,
        day: day.value,
        dayName: day.label,
        periods: weeklyTimetable[day.value] || {}
    }));

    return (
        <Card
            title="Class Timetable"
            extra={
                <Space>
                    <Button onClick={handleValidate} loading={loading}>
                        Validate Timetable
                    </Button>
                </Space>
            }
        >
            <Table
                dataSource={dataSource}
                columns={[
                    {
                        title: 'Day',
                        dataIndex: 'dayName',
                        key: 'dayName',
                        fixed: 'left',
                        width: 100
                    },
                    ...columns
                ]}
                pagination={false}
                scroll={{ x: true }}
                loading={loading}
            />
        </Card>
    );
};

export default TimetableGrid;
