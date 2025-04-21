import React from 'react';
import { Card, Row, Col, Skeleton } from 'antd';

interface Props {
    type?: 'stats' | 'table' | 'full';
}

export const LoadingSkeleton: React.FC<Props> = ({ type = 'full' }) => {
    const renderStatsSkeleton = () => (
        <Row gutter={[16, 16]}>
            {[1, 2, 3, 4].map((key) => (
                <Col xs={24} sm={12} md={6} key={key}>
                    <Card>
                        <Skeleton
                            active
                            paragraph={false}
                            title={{ width: '60%' }}
                        />
                        <Skeleton.Input
                            style={{ width: '100%', marginTop: 16 }}
                            active
                            size="large"
                        />
                    </Card>
                </Col>
            ))}
        </Row>
    );

    const renderTableSkeleton = () => (
        <Card style={{ marginTop: 24 }}>
            <Skeleton
                active
                title={false}
                paragraph={{ rows: 8, width: ['100%', '100%', '100%', '100%', '100%', '100%', '100%', '100%'] }}
            />
        </Card>
    );

    const renderChartSkeleton = () => (
        <Card style={{ marginTop: 24 }}>
            <Row justify="center" align="middle" style={{ minHeight: 300 }}>
                <Col span={24} style={{ textAlign: 'center' }}>
                    <Skeleton.Avatar active size={200} shape="circle" />
                </Col>
            </Row>
        </Card>
    );

    if (type === 'stats') {
        return renderStatsSkeleton();
    }

    if (type === 'table') {
        return renderTableSkeleton();
    }

    return (
        <div>
            <Card>
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col flex="auto">
                        <Skeleton.Input style={{ width: 250 }} active size="large" />
                    </Col>
                    <Col>
                        <Skeleton.Button active size="large" />
                    </Col>
                </Row>

                {renderStatsSkeleton()}
                {renderChartSkeleton()}
                {renderTableSkeleton()}
            </Card>
        </div>
    );
};

// Additional loading components for specific use cases
export const TableRowSkeleton: React.FC = () => (
    <tr>
        <td colSpan={5} style={{ padding: '12px 8px' }}>
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
        </td>
    </tr>
);

export const CardSkeleton: React.FC = () => (
    <Card>
        <Skeleton active avatar paragraph={{ rows: 2 }} />
    </Card>
);

export const StatsSkeleton: React.FC = () => (
    <Row gutter={[16, 16]}>
        {[1, 2, 3, 4].map((key) => (
            <Col xs={24} sm={12} md={6} key={key}>
                <Card>
                    <Skeleton active paragraph={false} />
                </Card>
            </Col>
        ))}
    </Row>
);
