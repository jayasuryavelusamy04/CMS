import React, { useState, useEffect } from 'react';
import { Card, QRCode, Button, Select, Space, DatePicker, message } from 'antd';
import { RootState, AppDispatch } from '../../../store';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

interface Props {
    classId: number;
    subjectId: number;
    teacherId: number;
    onQRGenerated?: (qrData: string) => void;
}

interface QRData {
    id: string;
    classId: number;
    subjectId: number;
    teacherId: number;
    date: string;
    period: number;
    timestamp: string;
}

export const QRCodeAttendance: React.FC<Props> = ({
    classId,
    subjectId,
    teacherId,
    onQRGenerated
}) => {
    const [qrData, setQRData] = useState<QRData | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [refreshInterval]);

    const generateQRCode = () => {
        const newQRData: QRData = {
            id: uuidv4(),
            classId,
            subjectId,
            teacherId,
            date: selectedDate.format('YYYY-MM-DD'),
            period: selectedPeriod,
            timestamp: new Date().toISOString()
        };

        setQRData(newQRData);
        if (onQRGenerated) {
            onQRGenerated(JSON.stringify(newQRData));
        }

        // Auto refresh QR code every 5 minutes for security
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
        const interval = setInterval(generateQRCode, 5 * 60 * 1000);
        setRefreshInterval(interval);

        message.success('New QR code generated');
    };

    const periodOptions = Array.from({ length: 8 }, (_, i) => ({
        value: i + 1,
        label: `Period ${i + 1}`
    }));

    return (
        <Card title="QR Code Attendance" style={{ maxWidth: 400, margin: '0 auto' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
                <DatePicker
                    value={selectedDate}
                    onChange={(date) => date && setSelectedDate(date)}
                    style={{ width: '100%' }}
                />

                <Select
                    placeholder="Select Period"
                    value={selectedPeriod}
                    onChange={setSelectedPeriod}
                    options={periodOptions}
                    style={{ width: '100%' }}
                />

                <Button
                    type="primary"
                    onClick={generateQRCode}
                    style={{ width: '100%' }}
                >
                    Generate QR Code
                </Button>

                {qrData && (
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <QRCode
                            value={JSON.stringify(qrData)}
                            size={200}
                            style={{ margin: '0 auto' }}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            QR Code refreshes every 5 minutes
                        </div>
                        <div style={{ marginTop: 8 }}>
                            <Space>
                                <span>Class: {classId}</span>
                                <span>Period: {qrData.period}</span>
                                <span>Date: {qrData.date}</span>
                            </Space>
                        </div>
                    </div>
                )}
            </Space>
        </Card>
    );
};
