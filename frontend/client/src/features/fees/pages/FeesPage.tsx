import React, { useState, useEffect } from 'react';
import { Card, Modal, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchClassSections } from '../../../store/slices/courseSlice';
import { FeeStructure } from '../../../store/slices/feeSlice';
import { FeeStructureForm } from '../components/FeeStructureForm';
import { FeeStructureList } from '../components/FeeStructureList';

export const FeesPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingFeeStructure, setEditingFeeStructure] = useState<FeeStructure | null>(null);
    const { classSections, loading: classLoading } = useSelector((state: RootState) => state.course);

    useEffect(() => {
        dispatch(fetchClassSections());
    }, [dispatch]);

    const handleAddNew = () => {
        setEditingFeeStructure(null);
        setIsModalVisible(true);
    };

    const handleEdit = (feeStructure: FeeStructure) => {
        setEditingFeeStructure(feeStructure);
        setIsModalVisible(true);
    };

    const handleDelete = (feeStructure: FeeStructure) => {
        Modal.confirm({
            title: 'Delete Fee Structure',
            content: 'Are you sure you want to delete this fee structure?',
            onOk() {
                message.success('Fee structure deleted successfully');
                // In a real app, you would dispatch a delete action here
            }
        });
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setEditingFeeStructure(null);
    };

    const handleFormSuccess = () => {
        setIsModalVisible(false);
        setEditingFeeStructure(null);
    };

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title="Fee Structures"
                loading={classLoading}
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddNew}
                    >
                        Add New Fee Structure
                    </Button>
                }
            >
                <FeeStructureList
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </Card>

            <Modal
                title={editingFeeStructure ? "Edit Fee Structure" : "Add New Fee Structure"}
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={600}
            >
                <FeeStructureForm
                    onSuccess={handleFormSuccess}
                    classSections={classSections || []}
                />
            </Modal>
        </div>
    );
};
