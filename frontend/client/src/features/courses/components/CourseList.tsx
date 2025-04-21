import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import { Button, Space, Select, Input, message, Modal } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fetchCourses, deleteCourse } from '../../../store/slices/courseSlice';
import { AppDispatch } from '../../../store';
import type { Course } from '../types/course.types';
import dayjs from 'dayjs';

const { Option } = Select;
const { confirm } = Modal;

const CourseList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        search: '',
        class_section_id: undefined as number | undefined,
        subject_id: undefined as number | undefined,
        page: 0,
        pageSize: 10
    });

    const { courses, totalCourses, loading } = useSelector((state: any) => state.course);
    const { classSections } = useSelector((state: any) => state.classSection);
    const { subjects } = useSelector((state: any) => state.subject);

    useEffect(() => {
        dispatch(fetchCourses(filters));
    }, [dispatch, filters]);

    const columnDefs = [
        {
            headerName: 'Course Name',
            field: 'name',
            sortable: true,
            filter: true,
            flex: 2
        },
        {
            headerName: 'Code',
            field: 'code',
            sortable: true,
            filter: true,
            flex: 1
        },
        {
            headerName: 'Class & Section',
            valueGetter: (params: any) => {
                const classSection = params.data.class_section;
                return classSection ? `${classSection.class_name} - ${classSection.section}` : '';
            },
            sortable: true,
            filter: true,
            flex: 1
        },
        {
            headerName: 'Subject',
            valueGetter: (params: any) => params.data.subject?.name || '',
            sortable: true,
            filter: true,
            flex: 1
        },
        {
            headerName: 'Duration',
            valueGetter: (params: any) => {
                const start = dayjs(params.data.start_date).format('DD/MM/YYYY');
                const end = dayjs(params.data.end_date).format('DD/MM/YYYY');
                return `${start} - ${end}`;
            },
            flex: 2
        },
        {
            headerName: 'Actions',
            flex: 1,
            cellRenderer: (params: any) => (
                <Space>
                    <Button
                        type="link"
                        onClick={() => navigate(`/courses/${params.data.id}`)}
                    >
                        View
                    </Button>
                    <Button
                        type="link"
                        onClick={() => navigate(`/courses/edit/${params.data.id}`)}
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

    const showDeleteConfirm = (course: Course) => {
        confirm({
            title: 'Are you sure you want to delete this course?',
            icon: <ExclamationCircleOutlined />,
            content: 'This will also delete all associated timetable slots.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => handleDelete(course.id)
        });
    };

    const handleDelete = async (id: number) => {
        try {
            await dispatch(deleteCourse(id)).unwrap();
            message.success('Course deleted successfully');
        } catch (error) {
            message.error('Failed to delete course');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <Space size="large">
                    <Input.Search
                        placeholder="Search courses..."
                        onSearch={(value) => setFilters(prev => ({ ...prev, search: value, page: 0 }))}
                        style={{ width: 250 }}
                    />
                    <Select
                        placeholder="Filter by Class Section"
                        allowClear
                        style={{ width: 200 }}
                        onChange={(value) => setFilters(prev => ({ ...prev, class_section_id: value, page: 0 }))}
                    >
                        {classSections?.map((cs: any) => (
                            <Option key={cs.id} value={cs.id}>
                                {`${cs.class_name} - ${cs.section}`}
                            </Option>
                        ))}
                    </Select>
                    <Select
                        placeholder="Filter by Subject"
                        allowClear
                        style={{ width: 200 }}
                        onChange={(value) => setFilters(prev => ({ ...prev, subject_id: value, page: 0 }))}
                    >
                        {subjects?.map((subject: any) => (
                            <Option key={subject.id} value={subject.id}>
                                {subject.name}
                            </Option>
                        ))}
                    </Select>
                </Space>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/courses/new')}
                >
                    Add Course
                </Button>
            </div>

            <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 240px)', width: '100%' }}>
                <AgGridReact
                    columnDefs={columnDefs}
                    rowData={courses}
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

export default CourseList;
