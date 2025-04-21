import React, { useEffect, useState } from 'react';
import { Select, Card, Space, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../utils/api';
import { LoadingOutlined } from '@ant-design/icons';

const { Option } = Select;

interface ClassSection {
    id: number;
    class_name: string;
    section: string;
}

interface Props {
    onSelect?: (classSectionId: number) => void;
    redirectPath?: string;
    title?: string;
    actionText?: string;
}

const ClassSectionSelector: React.FC<Props> = ({
    onSelect,
    redirectPath,
    title = 'Select Class',
    actionText = 'Proceed'
}) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [classSections, setClassSections] = useState<ClassSection[]>([]);
    const [selectedClass, setSelectedClass] = useState<number | null>(null);

    useEffect(() => {
        fetchClassSections();
    }, []);

    const fetchClassSections = async () => {
        setLoading(true);
        try {
            const response = await api.get('/class-sections/');
            setClassSections(response.data.items);
        } catch (error) {
            console.error('Failed to fetch class sections:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (value: number) => {
        setSelectedClass(value);
        if (onSelect) {
            onSelect(value);
        }
    };

    const handleProceed = () => {
        if (selectedClass && redirectPath) {
            navigate(redirectPath.replace(':classSectionId', selectedClass.toString()));
        }
    };

    return (
        <Card title={title}>
            <Space direction="vertical" style={{ width: '100%' }}>
                <Select
                    placeholder="Select a class"
                    style={{ width: '100%' }}
                    onChange={handleSelect}
                    loading={loading}
                    disabled={loading}
                >
                    {classSections.map((cs) => (
                        <Option key={cs.id} value={cs.id}>
                            {`${cs.class_name} - ${cs.section}`}
                        </Option>
                    ))}
                </Select>

                {loading && (
                    <div className="text-center">
                        <LoadingOutlined style={{ fontSize: 24 }} spin />
                        <p>Loading classes...</p>
                    </div>
                )}

                {!loading && classSections.length === 0 && (
                    <div className="text-center text-gray-500">
                        No classes found
                    </div>
                )}

                {selectedClass && redirectPath && (
                    <Button 
                        type="primary" 
                        onClick={handleProceed}
                        style={{ width: '100%' }}
                    >
                        {actionText}
                    </Button>
                )}
            </Space>
        </Card>
    );
};

export default ClassSectionSelector;
