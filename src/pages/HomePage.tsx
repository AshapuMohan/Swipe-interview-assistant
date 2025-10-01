import React from 'react';
import { Button, Typography, Row, Col, Card } from 'antd';
import { UserOutlined, LaptopOutlined, RocketOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0D1117', 
      padding: '24px' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '48px', 
          color: '#F0F6FC',
          padding: '32px 0'
        }}>
          <RocketOutlined style={{ 
            fontSize: 'clamp(40px, 6vw, 48px)', 
            marginBottom: '16px', 
            color: '#58A6FF' 
          }} />
          <Title level={1} style={{ 
            color: '#F0F6FC', 
            fontSize: 'clamp(32px, 5vw, 42px)', 
            marginBottom: '12px',
            lineHeight: '1.1',
            fontWeight: '600'
          }}>
            Swipe Interview Assistant
          </Title>
          <Paragraph style={{ 
            fontSize: 'clamp(16px, 2.5vw, 18px)', 
            color: '#8B949E', 
            maxWidth: '560px', 
            margin: '0 auto',
            padding: '0 24px',
            lineHeight: '1.5'
          }}>
            AI-powered interview platform for seamless candidate evaluation
          </Paragraph>
        </div>

        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={20} md={12} lg={10}>
            <Card 
              hoverable
              style={{
                borderRadius: '12px',
                border: '1px solid #30363D',
                boxShadow: 'none',
                background: '#161B22',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                height: '100%'
              }}
              bodyStyle={{ padding: 'clamp(24px, 4vw, 32px)' }}
              onClick={() => navigate('/interview')}
            >
              <div style={{ 
                width: 'clamp(56px, 10vw, 64px)', 
                height: 'clamp(56px, 10vw, 64px)', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #238636, #2EA043)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <UserOutlined style={{ fontSize: 'clamp(24px, 5vw, 32px)', color: 'white' }} />
              </div>
              <Title level={2} style={{ 
                marginBottom: '8px', 
                color: '#F0F6FC',
                fontSize: 'clamp(20px, 3.5vw, 24px)',
                fontWeight: '600'
              }}>I'm a Candidate</Title>
              <Paragraph style={{ 
                fontSize: 'clamp(14px, 2.2vw, 15px)', 
                color: '#8B949E', 
                marginBottom: '20px',
                lineHeight: '1.5'
              }}>
                Upload your resume and showcase your skills through our AI-powered interview process
              </Paragraph>
              <Button 
                type="primary" 
                size="large" 
                block
                style={{
                  height: 'clamp(40px, 6vw, 44px)',
                  borderRadius: '8px',
                  background: '#238636',
                  border: 'none',
                  fontSize: 'clamp(14px, 2.2vw, 15px)',
                  fontWeight: '500'
                }}
              >
                Start Interview
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={20} md={12} lg={10}>
            <Card 
              hoverable
              style={{
                borderRadius: '12px',
                border: '1px solid #30363D',
                boxShadow: 'none',
                background: '#161B22',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                height: '100%'
              }}
              bodyStyle={{ padding: 'clamp(24px, 4vw, 32px)' }}
              onClick={() => navigate('/dashboard')}
            >
              <div style={{ 
                width: 'clamp(56px, 10vw, 64px)', 
                height: 'clamp(56px, 10vw, 64px)', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #58A6FF, #1F6FEB)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <LaptopOutlined style={{ fontSize: 'clamp(24px, 5vw, 32px)', color: 'white' }} />
              </div>
              <Title level={2} style={{ 
                marginBottom: '8px', 
                color: '#F0F6FC',
                fontSize: 'clamp(20px, 3.5vw, 24px)',
                fontWeight: '600'
              }}>I'm an Interviewer</Title>
              <Paragraph style={{ 
                fontSize: 'clamp(14px, 2.2vw, 15px)', 
                color: '#8B949E', 
                marginBottom: '20px',
                lineHeight: '1.5'
              }}>
                Review candidate performance, analyze AI insights, and make informed hiring decisions
              </Paragraph>
              <Button 
                type="primary" 
                size="large" 
                block
                style={{
                  height: 'clamp(40px, 6vw, 44px)',
                  borderRadius: '8px',
                  background: '#58A6FF',
                  border: 'none',
                  fontSize: 'clamp(14px, 2.2vw, 15px)',
                  fontWeight: '500'
                }}
              >
                View Dashboard
              </Button>
            </Card>
          </Col>
        </Row>

        <div style={{ 
          textAlign: 'center', 
          marginTop: 'clamp(48px, 8vw, 64px)', 
          color: '#8B949E',
          padding: '24px 0'
        }}>
          <Row gutter={[16, 16]} justify="center">
            <Col xs={12} sm={6} md={6} style={{ textAlign: 'center' }}>
              <StarOutlined style={{ 
                fontSize: 'clamp(18px, 3vw, 20px)', 
                marginBottom: '6px',
                color: '#58A6FF'
              }} />
              <div style={{ fontSize: 'clamp(12px, 1.8vw, 13px)', color: '#8B949E' }}>AI-Powered</div>
            </Col>
            <Col xs={12} sm={6} md={6} style={{ textAlign: 'center' }}>
              <RocketOutlined style={{ 
                fontSize: 'clamp(18px, 3vw, 20px)', 
                marginBottom: '6px',
                color: '#3FB950'
              }} />
              <div style={{ fontSize: 'clamp(12px, 1.8vw, 13px)', color: '#8B949E' }}>Fast & Efficient</div>
            </Col>
            <Col xs={12} sm={6} md={6} style={{ textAlign: 'center' }}>
              <UserOutlined style={{ 
                fontSize: 'clamp(18px, 3vw, 20px)', 
                marginBottom: '6px',
                color: '#D29922'
              }} />
              <div style={{ fontSize: 'clamp(12px, 1.8vw, 13px)', color: '#8B949E' }}>User Friendly</div>
            </Col>
            <Col xs={12} sm={6} md={6} style={{ textAlign: 'center' }}>
              <LaptopOutlined style={{ 
                fontSize: 'clamp(18px, 3vw, 20px)', 
                marginBottom: '6px',
                color: '#F85149'
              }} />
              <div style={{ fontSize: 'clamp(12px, 1.8vw, 13px)', color: '#8B949E' }}>Real-time Analytics</div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default HomePage;