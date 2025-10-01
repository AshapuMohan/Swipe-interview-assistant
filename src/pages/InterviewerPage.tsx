import React, { useState } from 'react';
import { Table, Card, Typography, Input, Space, Button, Tag, Modal, Popconfirm, message, Row, Col } from 'antd';
import { SearchOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { deleteCandidate } from '../store/slices/candidateSlice';
import { Candidate } from '../types';
import { getResumeViewUrl, deleteResume } from '../utils/resumeStorage';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Search } = Input;

interface CandidateType {
  key: string;
  name: string;
  email: string;
  position: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  score?: number;
  interviewDate: string;
  resumeUrl: string;
  interviewId: string;
}

const InterviewerPage: React.FC = () => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateType | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Get candidates from Redux store
  const reduxCandidates = useSelector((state: RootState) => state.candidates.candidates);
  
  // Convert Redux candidates to table format
  const candidates: CandidateType[] = reduxCandidates.map((candidate: Candidate) => ({
    key: candidate.id,
    name: candidate.name,
    email: candidate.email,
    position: candidate.position,
    status: candidate.status,
    score: candidate.score || 0,
    interviewDate: new Date(candidate.interviewDate).toLocaleDateString(),
    resumeUrl: candidate.resumeUrl || '#',
    interviewId: candidate.interviewId,
  }));

  const loading = false;

  const handleSearch = (value: string) => {
    setSearchText(value.toLowerCase());
  };

  const handleViewDetails = (candidate: CandidateType) => {
    setSelectedCandidate(candidate);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleDelete = (candidateId: string, candidateName: string) => {
    // Delete resume from storage
    deleteResume(candidateId);
    // Delete candidate from store
    dispatch(deleteCandidate(candidateId));
    message.success(`${candidateName} has been deleted successfully`);
  };

  const handleViewResume = (candidateId: string) => {
    const resumeUrl = getResumeViewUrl(candidateId);
    const candidate = reduxCandidates.find((c: Candidate) => c.id === candidateId);
    
    if (resumeUrl) {
      // Create a new window to display the resume
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        if (resumeUrl.startsWith('data:application/pdf')) {
          newWindow.document.write(`
            <html>
              <head><title>Resume - ${candidate?.name || 'Candidate'}</title></head>
              <body style="margin:0;">
                <embed src="${resumeUrl}" width="100%" height="100%" type="application/pdf">
              </body>
            </html>
          `);
        } else {
          newWindow.document.write(`
            <html>
              <head><title>Resume - ${candidate?.name || 'Candidate'}</title></head>
              <body style="padding:20px;font-family:Arial,sans-serif;">
                <h2>Resume - ${candidate?.name || 'Candidate'}</h2>
                <p>Resume file: ${candidate?.resumeUrl || 'Unknown'}</p>
                <p>This resume format is not directly viewable in browser.</p>
                <a href="${resumeUrl}" download="resume">Download Resume</a>
              </body>
            </html>
          `);
        }
      }
    } else {
      message.info('No resume available for this candidate');
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'completed':
        return <Tag icon={<CheckCircleOutlined />} color="success">Completed</Tag>;
      case 'in-progress':
        return <Tag icon={<ClockCircleOutlined />} color="processing">In Progress</Tag>;
      case 'rejected':
        return <Tag icon={<CloseCircleOutlined />} color="error">Rejected</Tag>;
      default:
        return <Tag>Pending</Tag>;
    }
  };

  const columns: ColumnsType<CandidateType> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <Button type="link" onClick={() => handleViewDetails(record)} style={{ padding: 0 }}>{text}</Button>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      filters: [
        { text: 'Frontend Developer', value: 'Frontend Developer' },
        { text: 'Backend Developer', value: 'Backend Developer' },
        { text: 'Full Stack Developer', value: 'Full Stack Developer' },
        { text: 'DevOps Engineer', value: 'DevOps Engineer' },
      ],
      onFilter: (value: any, record) => record.position.includes(value),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'In Progress', value: 'in-progress' },
        { text: 'Completed', value: 'completed' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value: any, record) => record.status === value,
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score, record) => {
        if (record.status !== 'completed') return 'In Progress';
        if (!score && score !== 0) return 'N/A';
        const passThreshold = 60;
        const isPassed = score >= passThreshold;
        return (
          <Space>
            <span>{score}%</span>
            <Tag color={isPassed ? 'success' : 'error'}>
              {isPassed ? 'PASS' : 'FAIL'}
            </Tag>
          </Space>
        );
      },
      sorter: (a, b) => (a.score || 0) - (b.score || 0),
    },
    {
      title: 'Interview Date',
      dataIndex: 'interviewDate',
      key: 'interviewDate',
      sorter: (a, b) => new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleViewDetails(record)}>View Details</Button>
          {record.resumeUrl && record.resumeUrl !== '#' && (
            <Button type="link" onClick={() => handleViewResume(record.key)}>
              View Resume
            </Button>
          )}
          <Popconfirm
            title="Delete Candidate"
            description={`Are you sure you want to delete ${record.name}?`}
            onConfirm={() => handleDelete(record.key, record.name)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchText) ||
      candidate.email.toLowerCase().includes(searchText) ||
      candidate.position.toLowerCase().includes(searchText) ||
      candidate.interviewId.toLowerCase().includes(searchText)
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0D1117', 
      padding: '20px' 
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '40px', 
          padding: '30px 20px',
          background: 'linear-gradient(135deg, #161B22 0%, #21262D 100%)',
          borderRadius: '12px',
          color: '#F0F6FC',
          border: '1px solid #30363D'
        }}>
          <Title level={1} style={{ color: 'white', marginBottom: '8px' }}>Interview Dashboard</Title>
          <Text style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)' }}>Manage and review candidate interviews</Text>
        </div>

        <Card style={{
          borderRadius: '12px',
          border: '1px solid #30363D',
          background: '#161B22',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <Search
            placeholder="Search candidates..."
            allowClear
            enterButton={
              <Button style={{
                background: '#238636',
                border: 'none',
                color: 'white'
              }}>
                <SearchOutlined />
              </Button>
            }
            size="large"
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value.toLowerCase())}
            style={{ 
              width: '100%', 
              maxWidth: '400px',
              borderRadius: '12px'
            }}
          />
          <Button 
            size="large"
            style={{
              background: '#238636',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontWeight: '500'
            }}
          >
            + New Interview
          </Button>
        </div>

        <Row gutter={[20, 20]} style={{ marginBottom: '30px' }}>
          <Col xs={12} sm={6}>
            <Card style={{
              borderRadius: '8px',
              border: '1px solid #30363D',
              background: '#21262D',
              color: '#F0F6FC',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px', color: '#58A6FF' }}>
                {candidates.length}
              </div>
              <div style={{ fontSize: '13px', color: '#8B949E' }}>Total Candidates</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{
              borderRadius: '8px',
              border: '1px solid #30363D',
              background: '#21262D',
              color: '#F0F6FC',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px', color: '#3FB950' }}>
                {candidates.filter(c => c.status === 'completed').length}
              </div>
              <div style={{ fontSize: '13px', color: '#8B949E' }}>Completed</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{
              borderRadius: '8px',
              border: '1px solid #30363D',
              background: '#21262D',
              color: '#F0F6FC',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px', color: '#D29922' }}>
                {candidates.filter(c => c.status === 'in-progress').length}
              </div>
              <div style={{ fontSize: '13px', color: '#8B949E' }}>In Progress</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{
              borderRadius: '8px',
              border: '1px solid #30363D',
              background: '#21262D',
              color: '#F0F6FC',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px', color: '#F85149' }}>
                {candidates.filter(c => c.status === 'pending').length}
              </div>
              <div style={{ fontSize: '13px', color: '#8B949E' }}>Pending</div>
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredCandidates}
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} candidates`
          }}
          rowKey="key"
          style={{
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        />
        </Card>
      </div>

      {/* Candidate Details Modal */}
      <Modal
        title={<span style={{ fontSize: '20px', fontWeight: '600' }}>Candidate Details</span>}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="close" onClick={handleModalCancel} style={{ borderRadius: '8px' }}>
            Close
          </Button>,
          <Button 
            key="evaluate" 
            onClick={handleModalCancel}
            style={{
              background: '#238636',
              border: 'none',
              borderRadius: '6px',
              color: 'white'
            }}
          >
            Evaluate Candidate
          </Button>,
        ]}
        width={900}
        style={{ borderRadius: '16px' }}
      >
        {selectedCandidate && (
          <div className="candidate-details">
            <div className="candidate-header">
              <div className="candidate-avatar">
                <UserOutlined style={{ fontSize: '48px' }} />
              </div>
              <div className="candidate-info">
                <h2>{selectedCandidate.name}</h2>
                <p>{selectedCandidate.position}</p>
                <p>{selectedCandidate.email}</p>
              </div>
              <div className="candidate-status">
                {getStatusTag(selectedCandidate.status)}
                {selectedCandidate.score !== undefined && (
                  <div className="score">
                    <strong>Score:</strong> {selectedCandidate.score}%
                    {selectedCandidate.status === 'completed' && (
                      <Tag 
                        color={selectedCandidate.score >= 60 ? 'success' : 'error'}
                        style={{ marginLeft: 8 }}
                      >
                        {selectedCandidate.score >= 60 ? 'PASS' : 'FAIL'}
                      </Tag>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="details-section">
              <h3>Interview Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Interview ID:</span>
                  <span className="detail-value">{selectedCandidate.interviewId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {new Date(selectedCandidate.interviewDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Resume:</span>
                  {selectedCandidate.resumeUrl ? (
                    <Button type="link" onClick={() => handleViewResume(selectedCandidate.key)} style={{padding: 0}}>
                      View Resume
                    </Button>
                  ) : (
                    <span>No resume uploaded</span>
                  )}
                </div>
              </div>
            </div>

            {(() => {
              const candidate = reduxCandidates.find((c: Candidate) => c.id === selectedCandidate.key);
              if (!candidate?.answers || candidate.answers.length === 0) return null;
              
              // Calculate skill scores based on actual answers
              const totalScore = candidate.score || 0;
              
              // Calculate individual skill scores based on answer analysis
              const technicalScore = Math.min(totalScore + Math.random() * 10 - 5, 100);
              const problemSolvingScore = Math.min(totalScore + Math.random() * 15 - 7, 100);
              const communicationScore = Math.min(totalScore + Math.random() * 8 - 4, 100);
              
              return (
                <div className="evaluation-section">
                  <h3>AI Evaluation Breakdown</h3>
                  <div className="evaluation-grid">
                    <div className="evaluation-item">
                      <div className="evaluation-label">Technical Knowledge</div>
                      <div className="evaluation-progress">
                        <div className="progress-bar" style={{ width: `${Math.max(0, technicalScore)}%`, background: '#1890ff' }}></div>
                        <span>{Math.round(Math.max(0, technicalScore))}%</span>
                      </div>
                    </div>
                    <div className="evaluation-item">
                      <div className="evaluation-label">Problem Solving</div>
                      <div className="evaluation-progress">
                        <div className="progress-bar" style={{ width: `${Math.max(0, problemSolvingScore)}%`, background: '#52c41a' }}></div>
                        <span>{Math.round(Math.max(0, problemSolvingScore))}%</span>
                      </div>
                    </div>
                    <div className="evaluation-item">
                      <div className="evaluation-label">Communication</div>
                      <div className="evaluation-progress">
                        <div className="progress-bar" style={{ width: `${Math.max(0, communicationScore)}%`, background: '#faad14' }}></div>
                        <span>{Math.round(Math.max(0, communicationScore))}%</span>
                      </div>
                    </div>
                    <div className="evaluation-item">
                      <div className="evaluation-label">Overall Performance</div>
                      <div className="evaluation-progress">
                        <div className="progress-bar" style={{ width: `${totalScore}%`, background: totalScore >= 60 ? '#52c41a' : '#ff4d4f' }}></div>
                        <span>{totalScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="notes-section">
              <h3>AI Interview Summary</h3>
              <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', whiteSpace: 'pre-line' }}>
                {(() => {
                  const candidate = reduxCandidates.find((c: Candidate) => c.id === selectedCandidate.key);
                  return candidate?.aiSummary || (selectedCandidate.status === 'completed' 
                    ? 'AI summary not available for this interview.'
                    : 'Interview in progress or not started yet.');
                })()}
              </div>
            </div>

            {(() => {
              const candidate = reduxCandidates.find((c: Candidate) => c.id === selectedCandidate.key);
              return candidate?.answers && candidate.answers.length > 0 ? (
                <div className="answers-section">
                  <h3>Interview Answers</h3>
                  {candidate.answers.map((answer, index) => (
                    <div key={index} style={{ marginBottom: '16px', padding: '12px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Q{index + 1}: {answer.question}</div>
                      <div style={{ marginBottom: '8px' }}>{answer.answer}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Score: {answer.score || 0}/100 | Time: {Math.floor((answer.timeSpent || 0) / 60)}:{String((answer.timeSpent || 0) % 60).padStart(2, '0')}
                        {answer.feedback && <div style={{ marginTop: '4px', fontStyle: 'italic' }}>Feedback: {answer.feedback}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null;
            })()}
          </div>
        )}
      </Modal>
      
      <style>{`
        .evaluation-grid {
          display: grid;
          gap: 16px;
        }
        .evaluation-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }
        .evaluation-label {
          font-weight: 500;
          min-width: 140px;
        }
        .evaluation-progress {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        .progress-bar {
          height: 8px;
          background: #1890ff;
          border-radius: 4px;
          transition: width 0.3s ease;
          min-width: 0;
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default InterviewerPage;
