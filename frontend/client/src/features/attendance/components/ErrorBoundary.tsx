import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Card } from 'antd';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        // Here you can send error to your error tracking service
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null
        });
        this.props.onReset?.();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Card>
                    <Alert
                        message="An error occurred"
                        description={this.state.error?.message || 'Something went wrong'}
                        type="error"
                        showIcon
                    />
                    <Button
                        type="primary"
                        onClick={this.handleReset}
                        style={{ marginTop: 16 }}
                    >
                        Try Again
                    </Button>
                </Card>
            );
        }

        return this.props.children;
    }
}
