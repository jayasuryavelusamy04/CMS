import React, { useState, useEffect } from 'react';
import { Card, Button, message, Modal, Space } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRAttendanceData, QRCodeData, DeviceInfo, QRScannerProps } from '../types/attendance.types';
import { ErrorBoundary } from './ErrorBoundary';
import { useAttendancePermissions } from '../hooks/useAttendancePermissions';
import { useAttendanceSync } from '../hooks/useAttendanceSync';
import { indexedDBService } from '../../../services/indexedDB';

export const QRCodeScanner: React.FC<QRScannerProps> = ({
    studentId,
    onSuccess,
    onError
}) => {
    const [scanning, setScanning] = useState(false);
    const [scanner, setScanner] = useState<any>(null);
    const { permissions, isOnline, error: permissionError, requestPermissions } = useAttendancePermissions();
    const { isSyncing, pendingRecords, triggerSync } = useAttendanceSync();

    useEffect(() => {
        // Cleanup scanner on component unmount
        return () => {
            if (scanner) {
                scanner.clear();
            }
        };
    }, [scanner]);

    const startScanning = () => {
        const html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
            false
        );

        const onScanSuccess = async (decodedText: string) => {
            try {
                setScanning(false);
                html5QrcodeScanner.clear();

                const qrCodeData: QRCodeData = JSON.parse(decodedText);
                const currentTime = new Date();
                const qrTimestamp = new Date(qrCodeData.timestamp);

                // Check if QR code is not expired (5 minutes validity)
                if (currentTime.getTime() - qrTimestamp.getTime() > 5 * 60 * 1000) {
                    throw new Error('QR code has expired');
                }

                // Prepare device info
                const deviceInfo: DeviceInfo = {
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                };

                // Prepare attendance data
                const attendanceData: QRAttendanceData = {
                    student_id: studentId,
                    class_id: qrCodeData.classId,
                    subject_id: qrCodeData.subjectId,
                    teacher_id: qrCodeData.teacherId,
                    date: qrCodeData.date,
                    period: qrCodeData.period,
                    qr_code: qrCodeData.id,
                    device_info: deviceInfo
                };

                // Get geolocation if available
                if (navigator.geolocation) {
                    try {
                        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject);
                        });

                        attendanceData.device_info.location = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy
                        };
                    } catch (error) {
                        console.warn('Unable to get location:', error);
                    }
                }

                // Try to submit attendance online or store offline
                if (navigator.onLine && onSuccess) {
                    await onSuccess(attendanceData);
                    message.success('Attendance marked successfully');
                } else {
                    // Store for offline sync
                    await indexedDBService.storeAttendanceRecord(attendanceData);
                    message.success('Attendance stored offline and will be synced when online');
                }

            } catch (error: any) {
                const errorMessage = error.message || 'Failed to process QR code';
                message.error(errorMessage);
                if (onError) {
                    onError(errorMessage);
                }
            }
        };

        const onScanFailure = (error: any) => {
            // Ignore scan failures as they're common during scanning process
            console.debug('QR code scan error:', error);
        };

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        setScanner(html5QrcodeScanner);
        setScanning(true);
    };

    const stopScanning = () => {
        if (scanner) {
            scanner.clear();
            setScanner(null);
        }
        setScanning(false);
    };

    return (
        <ErrorBoundary>
            <Card
                title="Mark Attendance"
                style={{ maxWidth: 400, margin: '0 auto' }}
                extra={pendingRecords > 0 && (
                    <Button
                        type="primary"
                        icon={<SyncOutlined spin={isSyncing} />}
                        onClick={triggerSync}
                        disabled={!isOnline || isSyncing}
                    >
                        Sync ({pendingRecords})
                    </Button>
                )}
            >
                {!scanning ? (!permissions.camera ? (
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <p>Camera permission is required to scan QR codes.</p>
                        <Button
                            type="primary"
                            onClick={requestPermissions}
                            block
                        >
                            Grant Camera Access
                        </Button>
                    </Space>
                ) : (
                    <Button
                        type="primary"
                        onClick={startScanning}
                        block
                        disabled={!permissions.camera || !permissions.geolocation}
                    >
                        Scan QR Code
                    </Button>
                )) : (
                    <>
                        <div id="qr-reader" style={{ width: '100%' }} />
                        <Button
                            onClick={stopScanning}
                            style={{ marginTop: 16 }}
                            block
                        >
                            Stop Scanning
                        </Button>
                    </>
                )}

                {/* Offline Mode Indicator */}
                {!navigator.onLine && (
                    <div style={{ marginTop: 16, padding: 8, background: '#fffbe6', border: '1px solid #ffe58f' }}>
                        You are currently offline. Attendance will be saved locally and synced when online.
                    </div>
                )}

                {/* Camera Permission Modal */}
                <Modal
                    title="Camera Permission Required"
                    open={scanning}
                    onOk={stopScanning}
                    onCancel={stopScanning}
                    okText="Close"
                    cancelButtonProps={{ style: { display: 'none' } }}
                >
                    <p>Please allow camera access to scan the QR code.</p>
                    <p>If you denied permission, please reset it in your browser settings and try again.</p>
                </Modal>
                {permissionError && (
                    <div style={{ marginTop: 16, color: '#ff4d4f' }}>
                        {permissionError}
                    </div>
                )}

                {!isOnline && (
                    <div style={{ marginTop: 16, padding: 8, background: '#fffbe6', border: '1px solid #ffe58f' }}>
                        You are currently offline. Attendance will be saved locally and synced when online.
                    </div>
                )}
            </Card>
        </ErrorBoundary>
    );
};
