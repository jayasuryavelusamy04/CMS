import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../../store';

interface LoginFormData {
    username: string;
    password: string;
}

export const LoginPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const loading = useSelector((state: RootState) => state.auth.loading);

    // Get the redirect path from location state, or default to '/'
    const from = location.state?.from?.pathname || '/';

    const onFinish = async (values: LoginFormData) => {
        try {
            await dispatch(login(values)).unwrap();
            message.success('Login successful');
            // Navigate to the page they were trying to visit, or home
            navigate(from, { replace: true });
        } catch (error: any) {
            message.error(error.message || 'Login failed');
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#f0f2f5'
        }}>
            <Card
                title="Campus Management System"
                style={{ width: 400 }}
                headStyle={{ textAlign: 'center' }}
            >
                <Form
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    requiredMark={false}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Username"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Password"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                        >
                            Log in
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};
