import React, { useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchFeeStructures, FeeStructure } from '../../../store/slices/feeSlice';
import dayjs from 'dayjs';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface Props {
    onEdit?: (feeStructure: FeeStructure) => void;
    onDelete?: (feeStructure: FeeStructure) => void;
}

export const FeeStructureList: React.FC<Props> = ({ onEdit, onDelete }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { feeStructures, loading } = useSelector((state: RootState) => state.fees);

    useEffect(() => {
        dispatch(fetchFeeStructures());
    }, [dispatch]);

    const columnDefs = useMemo<ColDef[]>(() => [
        {
            field: 'class_section_id',
            headerName: 'Class Section',
            sortable: true,
            filter: true
        },
        {
            field: 'fee_type',
            headerName: 'Fee Type',
            sortable: true,
            filter: true
        },
        {
            field: 'amount',
            headerName: 'Amount',
            sortable: true,
            filter: 'agNumberColumnFilter',
            cellRenderer: (params: any) => `₹${params.value}`
        },
        {
            field: 'due_date',
            headerName: 'Due Date',
            sortable: true,
            filter: true,
            cellRenderer: (params: any) => dayjs(params.value).format('DD/MM/YYYY')
        },
        {
            field: 'academic_year',
            headerName: 'Academic Year',
            sortable: true,
            filter: true
        },
        {
            headerName: 'Actions',
            sortable: false,
            filter: false,
            width: 120,
            cellRenderer: (params: any) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => onEdit?.(params.data)}
                    />
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDelete?.(params.data)}
                    />
                </Space>
            )
        }
    ], [onEdit, onDelete]);

    const defaultColDef = useMemo(() => ({
        flex: 1,
        minWidth: 100,
        resizable: true,
    }), []);

    return (
        <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
            <AgGridReact
                rowData={feeStructures}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={10}
                rowSelection="single"
                animateRows={true}
                enableCellTextSelection={true}
                suppressMovableColumns={true}
            />
        </div>
    );
};
