import React from 'react';
import { Modal, Button, Space, Typography } from 'antd';
import { ClockCircleOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface WelcomeBackModalProps {
  visible: boolean;
  onResume: () => void;
  onStartNew: () => void;
  questionsCompleted: number;
  totalQuestions: number;
}

const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({
  visible,
  onResume,
  onStartNew,
  questionsCompleted,
  totalQuestions,
}) => {
  return (
    <Modal
      open={visible}
      closable={false}
      footer={null}
      centered
      width={500}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <ClockCircleOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 20 }} />
        
        <Title level={3}>Welcome Back!</Title>
        
        <Paragraph style={{ fontSize: 16, color: '#666' }}>
          We found an unfinished interview session. You've completed{' '}
          <Text strong>{questionsCompleted}</Text> out of{' '}
          <Text strong>{totalQuestions}</Text> questions.
        </Paragraph>

        <Paragraph style={{ fontSize: 14, color: '#999' }}>
          Would you like to continue where you left off or start a new interview?
        </Paragraph>

        <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 30 }}>
          <Button
            type="primary"
            size="large"
            block
            onClick={onResume}
            icon={<ClockCircleOutlined />}
          >
            Resume Interview
          </Button>
          
          <Button
            size="large"
            block
            onClick={onStartNew}
            icon={<DeleteOutlined />}
            danger
          >
            Start New Interview
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default WelcomeBackModal;
