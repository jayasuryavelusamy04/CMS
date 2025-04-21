import React, { useState } from 'react';
import { Card, Select, List, Drawer, Button } from 'antd';
import { MenuOutlined, CalendarOutlined } from '@ant-design/icons';
import { TimetableSlot } from '../types/timetable.types';
import TimetableCalendar from './TimetableCalendar';
import dayjs from 'dayjs';

const { Option } = Select;

interface Props {
    slots: TimetableSlot[];
    onSlotClick?: (slot: TimetableSlot) => void;
    loading?: boolean;
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

const ResponsiveTimetable: React.FC<Props> = ({ slots, onSlotClick, loading }) => {
    const [selectedDay, setSelectedDay] = useState(weekDays[0]);
    const [showFullTimetable, setShowFullTimetable] = useState(false);

    // Group slots by day
    const slotsByDay = weekDays.reduce((acc, day) => {
        const dayIndex = weekDays.indexOf(day);
        acc[day] = slots.filter(slot => slot.period?.day_of_week === dayIndex)
            .sort((a, b) => {
                const timeA = dayjs(a.period?.start_time, 'HH:mm:ss');
                const timeB = dayjs(b.period?.start_time, 'HH:mm:ss');
                return timeA.isBefore(timeB) ? -1 : 1;
            });
        return acc;
    }, {} as { [key: string]: TimetableSlot[] });

    const renderMobileView = () => (
        <div>
            <div className="mb-4 flex justify-between items-center">
                <Select
                    value={selectedDay}
                    onChange={setSelectedDay}
                    style={{ width: 120 }}
                >
                    {weekDays.map(day => (
                        <Option key={day} value={day}>{day}</Option>
                    ))}
                </Select>
                <Button
                    icon={<CalendarOutlined />}
                    onClick={() => setShowFullTimetable(true)}
                >
                    Full View
                </Button>
            </div>

            <List
                dataSource={slotsByDay[selectedDay]}
                loading={loading}
                renderItem={slot => (
                    <List.Item
                        onClick={() => onSlotClick?.(slot)}
                        className="cursor-pointer hover:bg-gray-50"
                    >
                        <List.Item.Meta
                            title={
                                <div className="flex justify-between">
                                    <span>
                                        {dayjs(slot.period?.start_time, 'HH:mm:ss').format('HH:mm')} - 
                                        {dayjs(slot.period?.end_time, 'HH:mm:ss').format('HH:mm')}
                                    </span>
                                    <span className="text-gray-500">{slot.room}</span>
                                </div>
                            }
                            description={
                                <div>
                                    <div className="font-medium">{slot.subject?.name}</div>
                                    <div className="text-gray-600">
                                        {slot.teacher?.first_name} {slot.teacher?.last_name}
                                    </div>
                                </div>
                            }
                        />
                    </List.Item>
                )}
                bordered
                className="bg-white"
            />
        </div>
    );

    return (
        <Card className="timetable-container">
            {/* Mobile View */}
            <div className="block md:hidden">
                {renderMobileView()}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <TimetableCalendar
                    slots={slots}
                    onSlotClick={onSlotClick}
                />
            </div>

            {/* Full Timetable Drawer for Mobile */}
            <Drawer
                title="Full Timetable"
                placement="right"
                width="100%"
                onClose={() => setShowFullTimetable(false)}
                open={showFullTimetable}
                className="md:hidden"
            >
                <TimetableCalendar
                    slots={slots}
                    onSlotClick={onSlotClick}
                />
            </Drawer>
        </Card>
    );
};

export default ResponsiveTimetable;
