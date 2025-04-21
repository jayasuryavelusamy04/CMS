import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Row, Col, Card, Button } from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import PeriodForm from '../components/PeriodForm';
import TimetableGrid from '../components/TimetableGrid';
import AttendanceMarking from '../components/AttendanceMarking';
import AttendanceReport from '../components/AttendanceReport';

const TimetableRoutes: React.FC = () => {
    const navigate = useNavigate();
    const { classSectionId, timetableSlotId } = useParams();
    const { currentUser } = useSelector((state: any) => state.auth);

    // Redirect to class selection if no class is selected
    useEffect(() => {
        if (!classSectionId && location.pathname.includes('/class')) {
            navigate('/timetable');
        }
    }, [classSectionId, navigate]);

    // Landing page for timetable section
    const TimetableLanding: React.FC = () => {
        return (
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card
                        hoverable
                        onClick={() => navigate('/timetable/periods')}
                        className="h-full"
                    >
                        <div className="text-center">
                            <CalendarOutlined className="text-4xl text-blue-500 mb-4" />
                            <h2 className="text-xl font-semibold mb-2">Class Periods</h2>
                            <p className="text-gray-600">
                                Define and manage class periods and timings
                            </p>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card
                        hoverable
                        onClick={() => navigate('/timetable/attendance/mark')}
                        className="h-full"
                    >
                        <div className="text-center">
                            <ClockCircleOutlined className="text-4xl text-green-500 mb-4" />
                            <h2 className="text-xl font-semibold mb-2">Mark Attendance</h2>
                            <p className="text-gray-600">
                                Record and manage student attendance
                            </p>
                        </div>
                    </Card>
                </Col>
            </Row>
        );
    };

    return (
        <Routes>
            {/* Landing page */}
            <Route index element={<TimetableLanding />} />

            {/* Periods Management */}
            <Route 
                path="periods" 
                element={
                    currentUser.role === 'admin' ? (
                        <PeriodForm />
                    ) : (
                        <div>You don't have permission to access this page.</div>
                    )
                } 
            />

            {/* Timetable View */}
            <Route path="class">
                <Route 
                    index 
                    element={
                        <Card title="Select Class">
                            {/* Add class selection component here */}
                            <Button onClick={() => navigate('/timetable/class/1')}>
                                Class 1
                            </Button>
                        </Card>
                    } 
                />
                <Route 
                    path=":classSectionId" 
                    element={<TimetableGrid classSectionId={Number(classSectionId)} />} 
                />
            </Route>

            {/* Attendance Management */}
            <Route path="attendance">
                <Route 
                    path="mark" 
                    element={
                        <Card title="Select Class for Attendance">
                            {/* Add class selection for attendance */}
                            <Button onClick={() => navigate('/timetable/attendance/mark/1/1')}>
                                Mark Class 1 Attendance
                            </Button>
                        </Card>
                    } 
                />
                <Route 
                    path="mark/:classSectionId/:timetableSlotId" 
                    element={
                        <AttendanceMarking 
                            classSectionId={Number(classSectionId)}
                            timetableSlotId={Number(timetableSlotId)}
                            students={[]}  // Pass actual students from parent component
                        />
                    } 
                />
                <Route 
                    path="report" 
                    element={
                        <Card title="Select Class for Report">
                            {/* Add class selection for reports */}
                            <Button onClick={() => navigate('/timetable/attendance/report/1')}>
                                View Class 1 Reports
                            </Button>
                        </Card>
                    } 
                />
                <Route 
                    path="report/:classSectionId" 
                    element={<AttendanceReport classSectionId={Number(classSectionId)} />} 
                />
            </Route>
        </Routes>
    );
};

export default TimetableRoutes;
