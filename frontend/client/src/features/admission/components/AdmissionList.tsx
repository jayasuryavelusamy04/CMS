import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import { Button, Input, Select, Space, message } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fetchStudents, deleteStudent } from '../../../store/slices/admissionSlice';
import { AppDispatch } from '../../../store';
import { Student, AdmissionFilters } from '../types/admission.types';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const { Option } = Select;

const AdmissionList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [filters, setFilters] = useState<AdmissionFilters>({
        page: 0,
        pageSize: 10,
        search: '',
        admission_status: undefined
    });

    const { students, totalStudents, loading } = useSelector((state: any) => state.admission);

    useEffect(() => {
        dispatch(fetchStudents(filters));
    }, [dispatch, filters]);

    const handleSearch = (value: string) => {
        setFilters(prev => ({ ...prev, search: value, page: 0 }));
    };

    const handleStatusFilter = (value: string | undefined) => {
        setFilters(prev => ({ ...prev, admission_status: value as any, page: 0 }));
    };

    const handleDelete = async (id: number) => {
        try {
            await dispatch(deleteStudent(id)).unwrap();
            message.success('Student deleted successfully');
            dispatch(fetchStudents(filters));
        } catch (error) {
            message.error('Failed to delete student');
        }
    };

    const columnDefs = [
        {
            headerName: 'Name',
            valueGetter: (params: any) => 
                `${params.data.first_name} ${params.data.middle_name || ''} ${params.data.last_name}`.trim(),
            sortable: true,
            filter: true,
            flex: 2
        },
        {
            headerName: 'Contact',
            field: 'contact_number',
            sortable: true,
            filter: true,
            flex: 1
        },
        {
            headerName: 'Class',
            valueGetter: (params: any) => 
                params.data.class_section 
                    ? `${params.data.class_section.class_name} - ${params.data.class_section.section}`
                    : 'Not Assigned',
            sortable: true,
            filter: true,
            flex: 1
        },
        {
            headerName: 'Status',
            field: 'admission_status',
            sortable: true,
            filter: true,
            flex: 1,
            cellRenderer: (params: any) => (
                <Select
                    value={params.value}
                    style={{ width: '100%' }}
                    onChange={(value) => handleStatusChange(params.data.id, value)}
                >
                    <Option value="admitted">Admitted</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="rejected">Rejected</Option>
                </Select>
            )
        },
        {
            headerName: 'Actions',
            flex: 1,
            cellRenderer: (params: any) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/admission/edit/${params.data.id}`)}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDelete(params.data.id)}
                    />
                </Space>
            )
        }
    ];

    const handleStatusChange = async (studentId: number, status: string) => {
        try {
            // Implement status update logic here
            message.success('Status updated successfully');
        } catch (error) {
            message.error('Failed to update status');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <Space>
                    <Input
                        placeholder="Search students..."
                        prefix={<SearchOutlined />}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: 200 }}
                    />
                    <Select
                        placeholder="Filter by status"
                        allowClear
                        style={{ width: 150 }}
                        onChange={handleStatusFilter}
                    >
                        <Option value="admitted">Admitted</Option>
                        <Option value="pending">Pending</Option>
                        <Option value="rejected">Rejected</Option>
                    </Select>
                </Space>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/admission/new')}
                >
                    New Admission
                </Button>
            </div>

            <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 240px)', width: '100%' }}>
                <AgGridReact
                    columnDefs={columnDefs}
                    rowData={students}
                    pagination={true}
                    paginationPageSize={filters.pageSize}
                    onPaginationChanged={(params) => {
                        const currentPage = params.api.paginationGetCurrentPage();
                        setFilters(prev => ({ ...prev, page: currentPage }));
                    }}
                    rowSelection="single"
                    suppressRowClickSelection={true}
                    defaultColDef={{
                        resizable: true,
                    }}
                />
            </div>
        </div>
    );
};

export default AdmissionList;
