import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    BookOutlined,
    CalendarOutlined
} from '@ant-design/icons';

const DashboardPage: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Students"
                            value={1234}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Staff"
                            value={98}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Active Courses"
                            value={45}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Upcoming Events"
                            value={12}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <div className="mt-6">
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <Card title="Recent Admissions">
                            <p>Recent admissions will be displayed here</p>
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Upcoming Exams">
                            <p>Upcoming exams will be displayed here</p>
                        </Card>
                    </Col>
                </Row>
            </div>

            <div className="mt-6">
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <Card title="Fee Collection Status">
                            <p>Fee collection statistics will be displayed here</p>
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Attendance Overview">
                            <p>Attendance statistics will be displayed here</p>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default DashboardPage;
