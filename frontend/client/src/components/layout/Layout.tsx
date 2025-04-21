import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Button, theme } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    TeamOutlined,
    BookOutlined,
    CalendarOutlined,
    UserAddOutlined,
    DollarOutlined,
    LogoutOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
// Import your logout action here when implementing auth
// import { logout } from '../../features/auth/authSlice';

const { Header, Sider, Content } = AntLayout;

export const Layout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/admissions',
            icon: <UserAddOutlined />,
            label: 'Admissions',
        },
        {
            key: '/students',
            icon: <TeamOutlined />,
            label: 'Students',
        },
        {
            key: '/staff',
            icon: <TeamOutlined />,
            label: 'Staff',
        },
        {
            key: '/courses',
            icon: <BookOutlined />,
            label: 'Courses',
        },
        {
            key: '/timetable',
            icon: <CalendarOutlined />,
            label: 'Timetable',
        },
        {
            key: '/fees',
            icon: <DollarOutlined />,
            label: 'Fees',
        },
        {
            key: '/attendance',
            icon: <CheckCircleOutlined />,
            label: 'Attendance'
        }
    ];

    const handleLogout = () => {
        // Implement logout functionality when implementing auth
        // dispatch(logout());
        navigate('/login');
    };

    const handleMenuClick = (key: string) => {
        navigate(key);
    };

    return (
        <AntLayout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme="light"
            >
                <div style={{ height: 32, margin: 16, background: 'rgba(0, 0, 0, 0.2)' }} />
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => handleMenuClick(key)}
                />
            </Sider>
            <AntLayout>
                <Header style={{ padding: 0, background: colorBgContainer }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                    <Button
                        type="text"
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        style={{
                            fontSize: '16px',
                            float: 'right',
                            margin: '16px 24px',
                        }}
                    >
                        Logout
                    </Button>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        overflowY: 'auto'
                    }}
                >
                    <Outlet />
                </Content>
            </AntLayout>
        </AntLayout>
    );
};
