import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Form, Input, Select, Button, DatePicker, Space, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { createFeeStructure, FeeStructure } from '../../../store/slices/feeSlice';

type CreateFeeStructureData = Omit<FeeStructure, 'id' | 'created_at' | 'updated_at'>;

interface Props {
    onSuccess?: () => void;
    classSections: Array<{ id: number; name: string }>;
}

export const FeeStructureForm: React.FC<Props> = ({ onSuccess, classSections }) => {
    const { control, handleSubmit, formState: { errors } } = useForm<CreateFeeStructureData>();
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector((state: RootState) => state.fees.loading);

    const onSubmit = async (data: CreateFeeStructureData) => {
        try {
            await dispatch(createFeeStructure(data)).unwrap();
            message.success('Fee structure created successfully');
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            message.error('Failed to create fee structure');
        }
    };

    return (
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
            <Form.Item
                label="Class Section"
                validateStatus={errors.class_section_id ? 'error' : ''}
                help={errors.class_section_id?.message}
            >
                <Controller
                    name="class_section_id"
                    control={control}
                    rules={{ required: 'Please select a class section' }}
                    render={({ field }) => (
                        <Select {...field}>
                            {classSections.map(section => (
                                <Select.Option key={section.id} value={section.id}>
                                    {section.name}
                                </Select.Option>
                            ))}
                        </Select>
                    )}
                />
            </Form.Item>

            <Form.Item
                label="Fee Type"
                validateStatus={errors.fee_type ? 'error' : ''}
                help={errors.fee_type?.message}
            >
                <Controller
                    name="fee_type"
                    control={control}
                    rules={{ required: 'Please select a fee type' }}
                    render={({ field }) => (
                        <Select {...field}>
                            <Select.Option value="TUITION">Tuition Fee</Select.Option>
                            <Select.Option value="ACTIVITY">Activity Fee</Select.Option>
                            <Select.Option value="LIBRARY">Library Fee</Select.Option>
                            <Select.Option value="SPORTS">Sports Fee</Select.Option>
                            <Select.Option value="EXAM">Exam Fee</Select.Option>
                            <Select.Option value="OTHER">Other</Select.Option>
                        </Select>
                    )}
                />
            </Form.Item>

            <Form.Item
                label="Amount"
                validateStatus={errors.amount ? 'error' : ''}
                help={errors.amount?.message}
            >
                <Controller
                    name="amount"
                    control={control}
                    rules={{
                        required: 'Amount is required',
                        min: { value: 0, message: 'Amount must be positive' }
                    }}
                    render={({ field }) => (
                        <Input
                            type="number"
                            {...field}
                            prefix="₹"
                        />
                    )}
                />
            </Form.Item>

            <Form.Item
                label="Due Date"
                validateStatus={errors.due_date ? 'error' : ''}
                help={errors.due_date?.message}
            >
                <Controller
                    name="due_date"
                    control={control}
                    rules={{ required: 'Due date is required' }}
                    render={({ field }) => (
                        <DatePicker
                            {...field}
                            style={{ width: '100%' }}
                            format="YYYY-MM-DD"
                        />
                    )}
                />
            </Form.Item>

            <Form.Item
                label="Academic Year"
                validateStatus={errors.academic_year ? 'error' : ''}
                help={errors.academic_year?.message}
            >
                <Controller
                    name="academic_year"
                    control={control}
                    rules={{ required: 'Academic year is required' }}
                    render={({ field }) => (
                        <Input
                            {...field}
                            placeholder="e.g. 2025-2026"
                        />
                    )}
                />
            </Form.Item>

            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                >
                    Create Fee Structure
                </Button>
            </Form.Item>
        </Form>
    );
};
