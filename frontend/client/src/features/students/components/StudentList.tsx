import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import { Button, Input, Select, Space, message } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '../../../store';
import { fetchStudentProfiles } from '../../../store/slices/studentProfileSlice';
import { StudentProfileFilters } from '../types/student-profile.types';

const { Option } = Select;

const StudentList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [filters, setFilters] = useState<StudentProfileFilters>({
        page: 0,
        pageSize: 10,
        academic_year: undefined
    });

    const { profiles, totalProfiles, loading } = useSelector((state: any) => state.studentProfile);

    useEffect(() => {
        dispatch(fetchStudentProfiles(filters));
    }, [dispatch, filters]);

    const columnDefs = [
        {
            headerName: 'Roll Number',
            field: 'rollnumber',
            sortable: true,
            filter: true,
            flex: 1
        },
        {
            headerName: 'Student Name',
            valueGetter: (params: any) => {
                const student = params.data.student;
                return student ? `${student.first_name} ${student.last_name}` : '';
            },
            sortable: true,
            filter: true,
            flex: 2
        },
        {
            headerName: 'Academic Year',
            field: 'academic_year',
            sortable: true,
            filter: true,
            flex: 1
        },
        {
            headerName: 'Class & Section',
            valueGetter: (params: any) => {
                const student = params.data.student;
                return student?.class_section 
                    ? `${student.class_section.class_name} - ${student.class_section.section}`
                    : 'Not Assigned';
            },
            sortable: true,
            filter: true,
            flex: 1
        },
        {
            headerName: 'Status',
            field: 'is_active',
            cellRenderer: (params: any) => (
                <span className={`px-2 py-1 rounded ${params.value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {params.value ? 'Active' : 'Inactive'}
                </span>
            ),
            sortable: true,
            filter: true,
            flex: 1
        },
        {
            headerName: 'Actions',
            flex: 1,
            cellRenderer: (params: any) => (
                <Space>
                    <Button
                        icon={<UserOutlined />}
                        onClick={() => navigate(`/students/${params.data.id}`)}
                    >
                        View Profile
                    </Button>
                </Space>
            )
        }
    ];

    const handleAcademicYearFilter = (value: string | undefined) => {
        setFilters(prev => ({ ...prev, academic_year: value, page: 0 }));
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <Space>
                    <Select
                        placeholder="Academic Year"
                        allowClear
                        style={{ width: 150 }}
                        onChange={handleAcademicYearFilter}
                    >
                        <Option value="2024-2025">2024-2025</Option>
                        <Option value="2023-2024">2023-2024</Option>
                    </Select>
                </Space>
            </div>

            <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 240px)', width: '100%' }}>
                <AgGridReact
                    columnDefs={columnDefs}
                    rowData={profiles}
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

export default StudentList;
