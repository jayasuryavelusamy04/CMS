import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import { Button, Space, Select, message, Modal } from 'antd';
import { UserAddOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fetchStaff, deleteStaff } from '../../../store/slices/staffSlice';
import { AppDispatch } from '../../../store';
import { Staff } from '../types/staff.types';

const { Option } = Select;
const { confirm } = Modal;

const StaffList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        role: undefined as string | undefined,
        isActive: true
    });

    const { staff, totalStaff, loading } = useSelector((state: any) => state.staff);

    useEffect(() => {
        dispatch(fetchStaff({ ...filters }));
    }, [dispatch, filters]);

    const columnDefs = [
        {
            headerName: 'Employee ID',
            field: 'employee_id',
            sortable: true,
            filter: true
        },
        {
            headerName: 'Name',
            valueGetter: (params: any) => 
                `${params.data.first_name} ${params.data.last_name}`,
            sortable: true,
            filter: true
        },
        {
            headerName: 'Role',
            field: 'role',
            sortable: true,
            filter: true,
            cellRenderer: (params: any) => (
                <span className="capitalize">{params.value}</span>
            )
        },
        {
            headerName: 'Email',
            field: 'email',
            sortable: true,
            filter: true
        },
        {
            headerName: 'Contact',
            field: 'contact_number',
            sortable: true,
            filter: true
        },
        {
            headerName: 'Status',
            field: 'is_active',
            cellRenderer: (params: any) => (
                <span className={`px-2 py-1 rounded ${
                    params.value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {params.value ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            headerName: 'Actions',
            cellRenderer: (params: any) => (
                <Space>
                    <Button 
                        type="link"
                        onClick={() => navigate(`/staff/${params.data.id}`)}
                    >
                        View
                    </Button>
                    <Button
                        type="link"
                        onClick={() => navigate(`/staff/edit/${params.data.id}`)}
                    >
                        Edit
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={() => showDeleteConfirm(params.data)}
                    >
                        Delete
                    </Button>
                </Space>
            )
        }
    ];

    const showDeleteConfirm = (staff: Staff) => {
        confirm({
            title: 'Are you sure you want to delete this staff member?',
            icon: <ExclamationCircleOutlined />,
            content: `This will deactivate ${staff.first_name} ${staff.last_name}'s account and all associated data.`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => handleDelete(staff.id)
        });
    };

    const handleDelete = async (id: number) => {
        try {
            await dispatch(deleteStaff(id)).unwrap();
            message.success('Staff member deleted successfully');
        } catch (error) {
            message.error('Failed to delete staff member');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <Space>
                    <Select
                        placeholder="Filter by role"
                        allowClear
                        onChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
                        style={{ width: 200 }}
                    >
                        <Option value="teacher">Teacher</Option>
                        <Option value="admin">Admin</Option>
                        <Option value="non_teaching">Non Teaching</Option>
                    </Select>
                    <Select
                        placeholder="Filter by status"
                        value={filters.isActive}
                        onChange={(value) => setFilters(prev => ({ ...prev, isActive: value }))}
                        style={{ width: 200 }}
                    >
                        <Option value={true}>Active</Option>
                        <Option value={false}>Inactive</Option>
                    </Select>
                </Space>
                <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => navigate('/staff/new')}
                >
                    Add Staff
                </Button>
            </div>
            
            <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 240px)', width: '100%' }}>
                <AgGridReact
                    columnDefs={columnDefs}
                    rowData={staff}
                    pagination={true}
                    paginationPageSize={10}
                    rowSelection="single"
                    suppressRowClickSelection={true}
                    defaultColDef={{
                        resizable: true,
                    }}
                    onGridReady={(params) => {
                        params.api.sizeColumnsToFit();
                    }}
                />
            </div>
        </div>
    );
};

export default StaffList;
