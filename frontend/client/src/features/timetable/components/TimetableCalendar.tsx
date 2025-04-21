import React from 'react';
import { Table, Tag, Tooltip } from 'antd';
import { TimetableSlot } from '../types/timetable.types';
import dayjs from 'dayjs';

interface Props {
    slots: TimetableSlot[];
    onSlotClick?: (slot: TimetableSlot) => void;
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

const TimetableCalendar: React.FC<Props> = ({ slots, onSlotClick }) => {
    // Group slots by time to create periods
    const timeSlots = Array.from(new Set(slots.map(slot => 
        `${slot.period?.start_time}-${slot.period?.end_time}`
    ))).sort();

    // Organize slots into a grid
    const slotGrid: { [key: string]: { [key: string]: TimetableSlot } } = {};
    weekDays.forEach(day => {
        slotGrid[day] = {};
        timeSlots.forEach(time => {
            const slot = slots.find(s => 
                weekDays[s.period?.day_of_week || 0] === day && 
                `${s.period?.start_time}-${s.period?.end_time}` === time
            );
            if (slot) {
                slotGrid[day][time] = slot;
            }
        });
    });

    const columns = [
        {
            title: 'Time / Day',
            dataIndex: 'time',
            key: 'time',
            fixed: 'left',
            width: 120,
            render: (time: string) => {
                const [start, end] = time.split('-');
                return (
                    <div className="text-xs">
                        <div>{dayjs(start, 'HH:mm:ss').format('HH:mm')}</div>
                        <div>{dayjs(end, 'HH:mm:ss').format('HH:mm')}</div>
                    </div>
                );
            }
        },
        ...weekDays.map(day => ({
            title: day,
            dataIndex: day,
            key: day,
            width: 180,
            render: (_: any, record: any) => {
                const slot = slotGrid[day][record.time];
                if (!slot) return null;

                return (
                    <Tooltip
                        title={
                            <div>
                                <p>Subject: {slot.subject?.name}</p>
                                <p>Teacher: {`${slot.teacher?.first_name} ${slot.teacher?.last_name}`}</p>
                                <p>Room: {slot.room}</p>
                            </div>
                        }
                    >
                        <div
                            className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                            onClick={() => onSlotClick?.(slot)}
                        >
                            <div className="font-medium text-sm">{slot.subject?.name}</div>
                            <div className="text-xs text-gray-600">
                                {`${slot.teacher?.first_name} ${slot.teacher?.last_name}`}
                            </div>
                            <Tag size="small" color="blue">{slot.room}</Tag>
                        </div>
                    </Tooltip>
                );
            }
        }))
    ];

    const dataSource = timeSlots.map(time => ({
        key: time,
        time,
        ...weekDays.reduce((acc, day) => ({
            ...acc,
            [day]: slotGrid[day][time]
        }), {})
    }));

    return (
        <div className="overflow-x-auto">
            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                scroll={{ x: 1200 }}
                bordered
                size="small"
                className="timetable-calendar"
            />
        </div>
    );
};

export default TimetableCalendar;
