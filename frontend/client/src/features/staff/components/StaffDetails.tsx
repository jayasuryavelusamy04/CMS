import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Tabs, Descriptions, Tag, Button, Space, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '../../../store';
import StaffAvailability from './StaffAvailability';
import dayjs from 'dayjs';

const { TabPane } = Tabs;

const StaffDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { staff, loading } = useSelector((state: any) => state.staff);

    const staffMember = staff.find((s: any) => s.id === parseInt(id || '0'));

    if (!staffMember) {
        return <div>Staff member not found</div>;
    }

    return (
        <div className="p-6">
            <Card
                title="Staff Details"
                extra={
                    <Space>
                        <Button type="primary" onClick={() => navigate(`/staff/edit/${id}`)}>
                            Edit Details
                        </Button>
                        <Button onClick={() => navigate('/staff')}>
                            Back to List
                        </Button>
                    </Space>
                }
            >
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Personal Information" key="1">
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Employee ID">
                                {staffMember.employee_id}
                            </Descriptions.Item>
                            <Descriptions.Item label="Name">
                                {`${staffMember.first_name} ${staffMember.last_name}`}
                            </Descriptions.Item>
                            <Descriptions.Item label="Role">
                                <Tag color={
                                    staffMember.role === 'teacher' ? 'blue' :
                                    staffMember.role === 'admin' ? 'purple' : 'default'
                                }>
                                    {staffMember.role.toUpperCase()}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={staffMember.is_active ? 'success' : 'error'}>
                                    {staffMember.is_active ? 'Active' : 'Inactive'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {staffMember.email}
                            </Descriptions.Item>
                            <Descriptions.Item label="Contact Number">
                                {staffMember.contact_number}
                            </Descriptions.Item>
                            <Descriptions.Item label="Joining Date">
                                {dayjs(staffMember.joining_date).format('MMMM D, YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Address" span={2}>
                                {staffMember.address}
                            </Descriptions.Item>
                            {staffMember.qualifications && (
                                <Descriptions.Item label="Qualifications" span={2}>
                                    {staffMember.qualifications}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </TabPane>

                    {staffMember.role === 'teacher' && (
                        <TabPane tab="Teaching Assignments" key="2">
                            <Card title="Assigned Subjects">
                                {staffMember.teaching_subjects?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {staffMember.teaching_subjects.map((subject: any) => (
                                            <Card key={subject.id} size="small">
                                                <p><strong>Subject:</strong> {subject.subject.name}</p>
                                                <p><strong>Class:</strong> {subject.class_section?.name}</p>
                                                <Tag color={subject.is_primary ? 'green' : 'blue'}>
                                                    {subject.is_primary ? 'Primary Subject' : 'Secondary Subject'}
                                                </Tag>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No subjects assigned yet.</p>
                                )}
                            </Card>
                        </TabPane>
                    )}

                    <TabPane tab="Availability Schedule" key="3">
                        <StaffAvailability
                            staffId={parseInt(id || '0')}
                            availabilities={staffMember.availabilities}
                        />
                    </TabPane>

                    <TabPane tab="Audit Log" key="4">
                        <Card>
                            {staffMember.audit_logs?.length > 0 ? (
                                <div className="space-y-4">
                                    {staffMember.audit_logs.map((log: any) => (
                                        <Card key={log.id} size="small">
                                            <p><strong>Action:</strong> {log.action}</p>
                                            <p><strong>Details:</strong> {log.details}</p>
                                            <p><strong>Date:</strong> {dayjs(log.created_at).format('MMMM D, YYYY HH:mm')}</p>
                                            <p><strong>Performed By:</strong> {log.performed_by}</p>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p>No audit logs available.</p>
                            )}
                        </Card>
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default StaffDetails;
