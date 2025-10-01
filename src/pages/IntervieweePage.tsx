import React, { useState, useEffect } from 'react';
import { Upload, Button, message, Typography, Card, Form, Input, Space, Alert, Select } from 'antd';
import { UploadOutlined, ArrowRightOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { useDispatch, useSelector } from 'react-redux';

import { v4 as uuidv4 } from 'uuid';
import { RootState } from '../store';
import { startInterview, clearSession } from '../store/slices/interviewSlice';
import { addCandidate, updateCandidate } from '../store/slices/candidateSlice';
import { parseResumeFile } from '../utils/resumeParser';
import { generateQuestions } from '../utils/questionGenerator';
import { storeResume } from '../utils/resumeStorage';
import { generateAIQuestions } from '../services/aiService';
import InterviewChat from '../components/InterviewChat';
import WelcomeBackModal from '../components/WelcomeBackModal';
import { Candidate } from '../types';

const { Title, Text } = Typography;

type ResumeData = {
  name: string;
  email: string;
  phone: string;
  file: File | null;
};

// Generate questions with AI fallback
const generateQuestionsWithAI = async (easy: number, medium: number, hard: number, role: string) => {
  const difficulties = ['easy', 'medium', 'hard'] as const;
  const counts = [easy, medium, hard];
  let allQuestions: any[] = [];
  
  for (let i = 0; i < difficulties.length; i++) {
    try {
      const aiQuestions = await generateAIQuestions(role, difficulties[i], counts[i]);
      if (aiQuestions.length > 0) {
        allQuestions.push(...aiQuestions.map((q: any, idx: number) => ({
          id: `q-${Date.now()}-${difficulties[i]}-${idx}`,
          text: q.text,
          difficulty: difficulties[i],
          timeLimit: difficulties[i] === 'easy' ? 20 : difficulties[i] === 'medium' ? 60 : 120,
          category: q.category || 'General',
          order: allQuestions.length + idx,
        })));
      } else {
        // Fallback to static questions
        const fallbackQuestions = generateQuestions(
          difficulties[i] === 'easy' ? counts[i] : 0,
          difficulties[i] === 'medium' ? counts[i] : 0,
          difficulties[i] === 'hard' ? counts[i] : 0,
          role
        );
        allQuestions.push(...fallbackQuestions);
      }
    } catch (error) {
      // Fallback to static questions on error
      const fallbackQuestions = generateQuestions(
        difficulties[i] === 'easy' ? counts[i] : 0,
        difficulties[i] === 'medium' ? counts[i] : 0,
        difficulties[i] === 'hard' ? counts[i] : 0,
        role
      );
      allQuestions.push(...fallbackQuestions);
    }
  }
  
  return allQuestions;
};

const IntervieweePage: React.FC = () => {
  const dispatch = useDispatch();
  const { currentSession, hasUnfinishedSession } = useSelector((state: RootState) => state.interview);
  const reduxCandidates = useSelector((state: RootState) => state.candidates.candidates);
  
  const [currentStep, setCurrentStep] = useState<'upload' | 'info' | 'missing-fields' | 'interview' | 'complete'>('upload');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [resumeData, setResumeData] = useState<Partial<ResumeData>>({});
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [candidateId, setCandidateId] = useState<string>('');

  useEffect(() => {
    if (hasUnfinishedSession && currentSession && !currentSession.isComplete && currentStep === 'upload') {
      setShowWelcomeBack(true);
    }
  }, [hasUnfinishedSession, currentSession, currentStep]);

  const handleResumeSession = () => {
    setShowWelcomeBack(false);
    setCurrentStep('interview');
  };

  const handleStartNewInterview = () => {
    dispatch(clearSession());
    setShowWelcomeBack(false);
    setCurrentStep('upload');
  };

  const handleUpload = async (info: any) => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);
    
    const isPdf = fileList[0]?.type === 'application/pdf';
    const isDocx = fileList[0]?.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    if (!isPdf && !isDocx) {
      message.error('You can only upload PDF or DOCX files!');
      return;
    }
    
    const isLt5M = fileList[0]?.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('File must be smaller than 5MB!');
      return;
    }
    
    setFileList(fileList);
    
    try {
      message.loading('Parsing resume...', 1);
      
      // Attempt to parse the resume
      const parsedData = await parseResumeFile(fileList[0].originFileObj as File);
      const extractedFields = [];
      
      if (parsedData.name) extractedFields.push('Name');
      if (parsedData.email) extractedFields.push('Email');
      if (parsedData.phone) extractedFields.push('Phone');
      
      setResumeData({
        name: parsedData.name || '',
        email: parsedData.email || '',
        phone: parsedData.phone || '',
        file: fileList[0].originFileObj as File
      });
      
      if (extractedFields.length > 0) {
        message.success(`Resume parsed! Extracted: ${extractedFields.join(', ')}`);
      } else {
        message.info('Resume uploaded! Please enter your information manually.');
      }
      
      setCurrentStep('info');
    } catch (error) {
      console.error('Resume parsing error:', error);
      message.warning('Resume uploaded but parsing failed. Please enter your information manually.');
      setResumeData({
        name: '',
        email: '',
        phone: '',
        file: fileList[0].originFileObj as File
      });
      setCurrentStep('info');
    }
  };

  const handleInfoSubmit = async (values: any) => {
    // Check for missing required fields
    const missingFields = [];
    if (!values.name?.trim()) missingFields.push('name');
    if (!values.email?.trim()) missingFields.push('email');
    if (!values.phone?.trim()) missingFields.push('phone');
    
    if (missingFields.length > 0) {
      setResumeData(prev => ({ ...prev, ...values }));
      setCurrentStep('missing-fields');
      return;
    }
    
    const newCandidateId = uuidv4();
    setCandidateId(newCandidateId);
    
    // Store resume file if available
    let resumeUrl = '';
    let resumeData = '';
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const file = fileList[0].originFileObj;
      resumeUrl = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
      
      // Store resume using utility
      try {
        const storedResume = await storeResume(newCandidateId, file);
        resumeData = storedResume.data;
      } catch (error) {
        console.error('Error storing resume:', error);
      }
    }
    
    const candidate: Candidate = {
      id: newCandidateId,
      name: values.name,
      email: values.email,
      phone: values.phone,
      position: values.position,
      status: 'in-progress',
      interviewDate: new Date().toISOString(),
      interviewId: `INT-${Date.now()}`,
      answers: [],
      resumeUrl: resumeUrl,
      resumeData: resumeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    dispatch(addCandidate(candidate));
    
    // Generate role-specific questions (randomized)
    const questions = await generateQuestionsWithAI(2, 2, 2, values.position);
    dispatch(startInterview({ candidateId: newCandidateId, questions }));
    
    setCurrentStep('interview');
  };

  const handleMissingFieldsSubmit = async (values: any) => {
    const newCandidateId = uuidv4();
    setCandidateId(newCandidateId);
    
    const completeData = { 
      name: values.name || '',
      email: values.email || '',
      phone: values.phone || '',
      position: values.position || 'Full Stack Developer (React/Node)'
    };
    
    // Store resume file if available
    let resumeUrl = '';
    let resumeData = '';
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const file = fileList[0].originFileObj;
      resumeUrl = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
      
      try {
        const storedResume = await storeResume(newCandidateId, file);
        resumeData = storedResume.data;
      } catch (error) {
        console.error('Error storing resume:', error);
      }
    }
    
    const candidate: Candidate = {
      id: newCandidateId,
      name: completeData.name,
      email: completeData.email,
      phone: completeData.phone,
      position: completeData.position,
      status: 'in-progress',
      interviewDate: new Date().toISOString(),
      interviewId: `INT-${Date.now()}`,
      answers: [],
      resumeUrl: resumeUrl,
      resumeData: resumeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    dispatch(addCandidate(candidate));
    
    const questions = await generateQuestionsWithAI(2, 2, 2, completeData.position);
    dispatch(startInterview({ candidateId: newCandidateId, questions }));
    
    setCurrentStep('interview');
  };

  const handleInterviewComplete = () => {
    if (currentSession && candidateId) {
      // Get the existing candidate to preserve position and resume
      const existingCandidate = reduxCandidates.find((c: Candidate) => c.id === candidateId);
      
      const candidate: Candidate = {
        id: candidateId,
        name: resumeData.name || existingCandidate?.name || 'Unknown',
        email: resumeData.email || existingCandidate?.email || '',
        phone: resumeData.phone || existingCandidate?.phone || '',
        position: existingCandidate?.position || 'Full Stack Developer (React/Node)',
        status: 'completed',
        score: currentSession.totalScore,
        interviewDate: currentSession.startTime,
        interviewId: currentSession.id,
        answers: currentSession.answers,
        aiSummary: currentSession.aiSummary,
        resumeUrl: existingCandidate?.resumeUrl,
        resumeData: existingCandidate?.resumeData,
        createdAt: currentSession.startTime,
        updatedAt: new Date().toISOString(),
      };
      
      dispatch(updateCandidate(candidate));
    }
    setCurrentStep('complete');
  };

  const renderUploadStep = () => (
    <Card 
      title={<span style={{ color: '#F0F6FC', fontSize: '18px', fontWeight: '600' }}>Upload Your Resume</span>}
      style={{ 
        background: '#161B22', 
        border: '1px solid #30363D', 
        borderRadius: '12px' 
      }}
      headStyle={{ background: '#161B22', borderBottom: '1px solid #30363D' }}
      bodyStyle={{ background: '#161B22' }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Upload
            fileList={fileList}
            beforeUpload={() => false}
            onChange={handleUpload}
            accept=".pdf,.docx"
          >
            <Button 
              icon={<UploadOutlined />} 
              size="large"
              style={{
                background: '#238636',
                border: 'none',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '500'
              }}
            >
              Click to Upload (PDF/DOCX)
            </Button>
          </Upload>
          <div style={{ marginTop: '12px' }}>
            <Text style={{ color: '#8B949E', fontSize: '13px' }}>Supported formats: .pdf, .docx (max 5MB)</Text>
          </div>
        </div>
      </Space>
    </Card>
  );

  const renderInfoStep = () => {
    const initialValues = {
      name: resumeData.name || '',
      email: resumeData.email || '',
      phone: resumeData.phone || '',
      position: 'Full Stack Developer (React/Node)',
    };

    const hasExtractedData = resumeData.name || resumeData.email || resumeData.phone;

    return (
      <Card 
        title={<span style={{ color: '#F0F6FC', fontSize: '18px', fontWeight: '600' }}>Verify Your Information</span>}
        style={{ 
          background: '#161B22', 
          border: '1px solid #30363D', 
          borderRadius: '12px' 
        }}
        headStyle={{ background: '#161B22', borderBottom: '1px solid #30363D' }}
        bodyStyle={{ background: '#161B22' }}
      >
        {hasExtractedData && (
          <Alert
            message="Information Extracted Successfully"
            description={`We've automatically filled: ${[
              resumeData.name && 'Name',
              resumeData.email && 'Email', 
              resumeData.phone && 'Phone'
            ].filter(Boolean).join(', ')}. Please verify and update if needed.`}
            type="success"
            showIcon
            style={{ marginBottom: 20, background: '#0D1B0D', border: '1px solid #238636' }}
          />
        )}
        {!hasExtractedData && fileList.length > 0 && (
          <Alert
            message="Please Verify Your Information"
            description="Resume uploaded successfully. Please fill in or verify your details below to continue."
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
          />
        )}
        {fileList.length === 0 && (
          <Alert
            message="Resume Required"
            description="Please upload your resume to continue with the interview process."
            type="warning"
            showIcon
            style={{ marginBottom: 20 }}
          />
        )}
        <Form
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleInfoSubmit}
        >
          <Form.Item
            label={<span style={{ color: '#F0F6FC', fontWeight: '500' }}>Full Name</span>}
            name="name"
          >
            <Input placeholder="John Doe" size="large" style={{ background: '#21262D', border: '1px solid #30363D', color: '#F0F6FC' }} />
          </Form.Item>
          
          <Form.Item
            label={<span style={{ color: '#F0F6FC', fontWeight: '500' }}>Email</span>}
            name="email"
            rules={[
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input placeholder="john@example.com" size="large" style={{ background: '#21262D', border: '1px solid #30363D', color: '#F0F6FC' }} />
          </Form.Item>
          
          <Form.Item
            label={<span style={{ color: '#F0F6FC', fontWeight: '500' }}>Phone Number</span>}
            name="phone"
            rules={[
              { pattern: /^[0-9+\-\s()]*$/, message: 'Please enter a valid phone number!' }
            ]}
          >
            <Input placeholder="+1 (123) 456-7890" size="large" style={{ background: '#21262D', border: '1px solid #30363D', color: '#F0F6FC' }} />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: '#F0F6FC', fontWeight: '500' }}>Position Applying For</span>}
            name="position"
            rules={[{ required: true, message: 'Please select a position!' }]}
          >
            <Select size="large" placeholder="Select a position" style={{ background: '#21262D', border: '1px solid #30363D' }}>
              <Select.Option value="Full Stack Developer (React/Node)">Full Stack Developer (React/Node)</Select.Option>
              <Select.Option value="Frontend Developer (React)">Frontend Developer (React)</Select.Option>
              <Select.Option value="Backend Developer (Node.js)">Backend Developer (Node.js)</Select.Option>
              <Select.Option value="DevOps Engineer">DevOps Engineer</Select.Option>
              <Select.Option value="UI/UX Designer">UI/UX Designer</Select.Option>
              <Select.Option value="QA Engineer">QA Engineer</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={<span style={{ color: '#F0F6FC', fontWeight: '500' }}>Upload Resume (Optional)</span>}
            tooltip="Upload your resume if you haven't already"
          >
            <Upload
              fileList={fileList}
              beforeUpload={() => false}
              onChange={(info) => {
                let newFileList = [...info.fileList];
                newFileList = newFileList.slice(-1);
                setFileList(newFileList);
              }}
              accept=".pdf,.docx"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>
                {fileList.length > 0 ? 'Change Resume' : 'Upload Resume'}
              </Button>
            </Upload>
            {fileList.length > 0 && (
              <Text style={{ display: 'block', marginTop: 8, color: '#8B949E' }}>
                Selected: {fileList[0].name}
              </Text>
            )}
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              disabled={fileList.length === 0}
              style={{
                background: '#238636',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                height: '44px'
              }}
            >
              Continue <ArrowRightOutlined />
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  };

  const renderInterviewStep = () => {
    return <InterviewChat onComplete={handleInterviewComplete} />;
  };

  const renderMissingFieldsStep = () => {
    const missingFields = [];
    if (!resumeData?.name?.trim()) missingFields.push({ key: 'name', label: 'Full Name', type: 'text' });
    if (!resumeData?.email?.trim()) missingFields.push({ key: 'email', label: 'Email', type: 'email' });
    if (!resumeData?.phone?.trim()) missingFields.push({ key: 'phone', label: 'Phone Number', type: 'tel' });
    
    return (
      <Card 
        title={<span style={{ color: '#F0F6FC', fontSize: '18px', fontWeight: '600' }}>Complete Your Information</span>}
        style={{ 
          background: '#161B22', 
          border: '1px solid #30363D', 
          borderRadius: '12px' 
        }}
        headStyle={{ background: '#161B22', borderBottom: '1px solid #30363D' }}
        bodyStyle={{ background: '#161B22' }}
      >
        <Alert
          message="Missing Information"
          description={`Please provide the following required information: ${missingFields.map(f => f.label).join(', ')}`}
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
        />
        
        <Form
          layout="vertical"
          initialValues={resumeData || {}}
          onFinish={handleMissingFieldsSubmit}
        >
          {missingFields.map(field => (
            <Form.Item
              key={field.key}
              label={<span style={{ color: '#F0F6FC', fontWeight: '500' }}>{field.label}</span>}
              name={field.key}
              rules={[{ required: true, message: `Please input your ${field.label.toLowerCase()}!` }]}
            >
              <Input 
                placeholder={`Enter your ${field.label.toLowerCase()}`} 
                size="large" 
                type={field.type}
                style={{ background: '#21262D', border: '1px solid #30363D', color: '#F0F6FC' }}
              />
            </Form.Item>
          ))}
          
          <Form.Item
            label={<span style={{ color: '#F0F6FC', fontWeight: '500' }}>Position Applying For</span>}
            name="position"
            initialValue="Full Stack Developer (React/Node)"
            rules={[{ required: true, message: 'Please select a position!' }]}
          >
            <Select size="large" placeholder="Select a position" style={{ background: '#21262D', border: '1px solid #30363D' }}>
              <Select.Option value="Full Stack Developer (React/Node)">Full Stack Developer (React/Node)</Select.Option>
              <Select.Option value="Frontend Developer (React)">Frontend Developer (React)</Select.Option>
              <Select.Option value="Backend Developer (Node.js)">Backend Developer (Node.js)</Select.Option>
              <Select.Option value="DevOps Engineer">DevOps Engineer</Select.Option>
              <Select.Option value="UI/UX Designer">UI/UX Designer</Select.Option>
              <Select.Option value="QA Engineer">QA Engineer</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              style={{
                background: '#238636',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                height: '44px'
              }}
            >
              Start Interview <ArrowRightOutlined />
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  };

  const renderCompleteStep = () => (
    <Card 
      title={<span style={{ color: '#F0F6FC', fontSize: '18px', fontWeight: '600' }}>Interview Complete</span>}
      style={{ 
        background: '#161B22', 
        border: '1px solid #30363D', 
        borderRadius: '12px' 
      }}
      headStyle={{ background: '#161B22', borderBottom: '1px solid #30363D' }}
      bodyStyle={{ background: '#161B22' }}
    >
      <div>
        <Alert
          message="Thank you for completing the interview!"
          description="Your responses have been submitted successfully. The hiring team will review your application and get back to you soon."
          type="success"
          showIcon
          style={{ marginBottom: '24px', background: '#0D1B0D', border: '1px solid #238636' }}
        />
        
        <div style={{ marginBottom: '24px' }}>
          <Title level={4} style={{ color: '#F0F6FC', marginBottom: '12px' }}>Next Steps</Title>
          <ul style={{ color: '#8B949E', paddingLeft: '20px' }}>
            <li>Your interview responses are being reviewed</li>
            <li>You'll receive an email with the next steps</li>
            <li>Check your dashboard for updates</li>
          </ul>
        </div>
        
        <Button 
          type="primary" 
          onClick={() => window.location.href = '/'}
          style={{
            background: '#238636',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            height: '44px'
          }}
        >
          Return to Home
        </Button>
      </div>
    </Card>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 'upload':
        return renderUploadStep();
      case 'info':
        return renderInfoStep();
      case 'missing-fields':
        return renderMissingFieldsStep();
      case 'interview':
        return renderInterviewStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return renderUploadStep();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0D1117', padding: '24px' }}>
      <WelcomeBackModal
        visible={showWelcomeBack}
        onResume={handleResumeSession}
        onStartNew={handleStartNewInterview}
        questionsCompleted={currentSession?.currentQuestionIndex || 0}
        totalQuestions={currentSession?.questions.length || 6}
      />
      
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ color: '#F0F6FC', marginBottom: '8px', fontWeight: '600' }}>Candidate Interview Portal</Title>
          <Text style={{ color: '#8B949E', fontSize: '15px' }}>
            {currentStep === 'upload' && 'Step 1: Upload your resume'}
            {currentStep === 'info' && 'Step 2: Verify your information'}
            {currentStep === 'missing-fields' && 'Step 3: Complete missing information'}
            {currentStep === 'interview' && 'Step 4: Complete the interview'}
            {currentStep === 'complete' && 'Interview Complete'}
          </Text>
        </div>
        
        <div>
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default IntervieweePage;
