import React, { useRef } from 'react';
import { Button, Card, Table, Typography, Space } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { TimetableSlot } from '../types/timetable.types';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const { Title, Text } = Typography;

interface Props {
    classSectionId: number;
    classInfo?: {
        class_name: string;
        section: string;
    };
    slots: TimetableSlot[];
    type: 'timetable' | 'attendance';
    attendanceData?: any;
    dateRange?: [string, string];
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

const TimetablePrintView: React.FC<Props> = ({
    classSectionId,
    classInfo,
    slots,
    type,
    attendanceData,
    dateRange
}) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        if (!printRef.current) return;

        try {
            const canvas = await html2canvas(printRef.current);
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${type}_${classInfo?.class_name}_${classInfo?.section}_${dayjs().format('YYYY-MM-DD')}.pdf`);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
        }
    };

    const renderTimetable = () => {
        const timeSlots = Array.from(new Set(slots.map(slot => 
            `${slot.period?.start_time}-${slot.period?.end_time}`
        ))).sort();

        const columns = [
            {
                title: 'Time / Day',
                dataIndex: 'time',
                key: 'time',
                width: 120,
                fixed: 'left',
                render: (time: string) => {
                    const [start, end] = time.split('-');
                    return (
                        <div>
                            {dayjs(start, 'HH:mm:ss').format('HH:mm')} -
                            {dayjs(end, 'HH:mm:ss').format('HH:mm')}
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
                    const slot = slots.find(s => 
                        weekDays[s.period?.day_of_week || 0] === day &&
                        `${s.period?.start_time}-${s.period?.end_time}` === record.time
                    );
                    if (!slot) return null;

                    return (
                        <div className="text-sm">
                            <div className="font-medium">{slot.subject?.name}</div>
                            <div className="text-gray-600">
                                {slot.teacher?.first_name} {slot.teacher?.last_name}
                            </div>
                            <div className="text-gray-500">{slot.room}</div>
                        </div>
                    );
                }
            }))
        ];

        const dataSource = timeSlots.map(time => ({
            key: time,
            time,
        }));

        return (
            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                bordered
                size="small"
            />
        );
    };

    const renderAttendance = () => {
        if (!attendanceData) return null;

        const columns = [
            {
                title: 'Student',
                dataIndex: 'student_name',
                key: 'student_name',
            },
            {
                title: 'Present',
                dataIndex: 'present_days',
                key: 'present_days',
            },
            {
                title: 'Absent',
                dataIndex: 'absent_days',
                key: 'absent_days',
            },
            {
                title: 'Late',
                dataIndex: 'late_days',
                key: 'late_days',
            },
            {
                title: 'Excused',
                dataIndex: 'excused_days',
                key: 'excused_days',
            },
            {
                title: 'Attendance %',
                dataIndex: 'attendance_percentage',
                key: 'attendance_percentage',
                render: (value: number) => `${value.toFixed(2)}%`
            }
        ];

        return (
            <Table
                columns={columns}
                dataSource={attendanceData}
                pagination={false}
                bordered
                size="small"
            />
        );
    };

    return (
        <Card
            title={
                <div className="flex justify-between items-center">
                    <Title level={4}>
                        {type === 'timetable' ? 'Class Timetable' : 'Attendance Report'}
                    </Title>
                    <Space>
                        <Button
                            icon={<PrinterOutlined />}
                            onClick={handlePrint}
                        >
                            Print
                        </Button>
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={handleDownloadPDF}
                        >
                            Download PDF
                        </Button>
                    </Space>
                </div>
            }
        >
            <div ref={printRef} className="print-content">
                <div className="text-center mb-4">
                    <Title level={3}>
                        {classInfo?.class_name} - {classInfo?.section}
                    </Title>
                    {dateRange && (
                        <Text type="secondary">
                            Period: {dayjs(dateRange[0]).format('DD MMM YYYY')} to {dayjs(dateRange[1]).format('DD MMM YYYY')}
                        </Text>
                    )}
                </div>

                {type === 'timetable' ? renderTimetable() : renderAttendance()}
            </div>
        </Card>
    );
};

export default TimetablePrintView;
