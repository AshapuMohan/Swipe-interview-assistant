import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Progress, Typography, Space, Alert } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, SendOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { submitAnswer, completeInterview } from '../store/slices/interviewSlice';
import { useTimer } from '../hooks/useTimer';
import { formatTime } from '../utils/questionGenerator';
import { Answer } from '../types';
import { judgeAnswerWithAI, generateAISummary } from '../services/aiService';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

interface InterviewChatProps {
  onComplete: () => void;
}

const InterviewChat: React.FC<InterviewChatProps> = ({ onComplete }) => {
  const dispatch = useDispatch();
  const { currentSession } = useSelector((state: RootState) => state.interview);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = currentSession?.questions[currentSession.currentQuestionIndex];
  const progress = currentSession 
    ? ((currentSession.currentQuestionIndex) / currentSession.questions.length) * 100 
    : 0;

  const handleTimeUp = () => {
    handleSubmitAnswer();
  };

  const { timeRemaining, start, reset } = useTimer({
    initialTime: currentQuestion?.timeLimit || 60,
    onTimeUp: handleTimeUp,
    autoStart: false,
  });

  useEffect(() => {
    if (currentQuestion) {
      reset(currentQuestion.timeLimit);
      start();
    }
  }, [currentQuestion, start, reset]);

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !currentSession) return;

    // Validate answer
    if (timeRemaining > 0 && (!currentAnswer.trim() || currentAnswer.trim().length < 10)) {
      return; // Button is already disabled, but extra check
    }

    setIsSubmitting(true);

    try {
      // Try AI judging first, fallback to local scoring
      let answerScore = 0;
      let aiFeedback = '';

      try {
        const aiResult = await judgeAnswerWithAI(
          currentQuestion.text,
          currentAnswer || '(No answer provided)',
          currentQuestion.difficulty
        );
        answerScore = aiResult.score;
        aiFeedback = aiResult.feedback;
      } catch (error) {
        console.log('AI judging failed, using fallback scoring');
        answerScore = scoreAnswer(currentAnswer, currentQuestion);
        aiFeedback = 'Scored using fallback system';
      }

      const answer: Answer = {
        questionId: currentQuestion.id,
        question: currentQuestion.text,
        answer: currentAnswer || '(No answer provided)',
        timeSpent: currentQuestion.timeLimit - timeRemaining,
        timestamp: new Date().toISOString(),
        score: answerScore,
        feedback: aiFeedback,
      };

      dispatch(submitAnswer(answer));
      setCurrentAnswer('');

      // Check if this was the last question
      if (currentSession.currentQuestionIndex + 1 >= currentSession.questions.length) {
        // Calculate final score based on all answers
        const allAnswers = [...currentSession.answers, answer];
        const totalScore = calculateFinalScore(allAnswers);
        
        // Try AI summary, fallback to local summary
        let aiSummary = '';
        try {
          aiSummary = await generateAISummary(allAnswers, 'Full Stack Developer');
        } catch (error) {
          console.log('AI summary failed, using fallback');
          aiSummary = generateDetailedAISummary(allAnswers, totalScore);
        }
        
        dispatch(completeInterview({ totalScore, aiSummary }));
        
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * AI-powered answer scoring based on content analysis
   */
  const scoreAnswer = (answer: string, question: any): number => {
    if (!answer || answer === '(No answer provided)') return 0;

    let score = 0;
    const answerLower = answer.toLowerCase();

    // Base score for attempting the question
    score += 20;

    // Length analysis (detailed answers score higher)
    const wordCount = answer.trim().split(/\s+/).length;
    if (wordCount > 50) score += 15;
    else if (wordCount > 30) score += 10;
    else if (wordCount > 15) score += 5;

    // Technical keyword detection based on difficulty
    const technicalKeywords = [
      'function', 'component', 'state', 'props', 'hook', 'api', 'database',
      'performance', 'optimization', 'security', 'architecture', 'design',
      'implementation', 'testing', 'deployment', 'scalability', 'async',
      'promise', 'callback', 'event', 'middleware', 'authentication'
    ];

    const keywordMatches = technicalKeywords.filter(keyword => 
      answerLower.includes(keyword)
    ).length;
    score += Math.min(keywordMatches * 3, 20);

    // Code examples or specific examples boost score
    if (answerLower.includes('example') || answerLower.includes('for instance')) {
      score += 10;
    }
    if (answer.includes('```') || answer.includes('const ') || answer.includes('function ')) {
      score += 10;
    }

    // Structure indicators (well-organized answers)
    const hasStructure = answerLower.includes('first') || 
                        answerLower.includes('second') ||
                        answerLower.includes('1.') ||
                        answerLower.includes('2.');
    if (hasStructure) score += 10;

    // Difficulty-based adjustment
    if (question.difficulty === 'hard' && wordCount > 80) score += 10;
    if (question.difficulty === 'medium' && wordCount > 50) score += 5;

    // Cap score at 100
    return Math.min(score, 100);
  };

  /**
   * Calculate final score from all answers
   */
  const calculateFinalScore = (answers: Answer[]): number => {
    if (answers.length === 0) return 0;

    let totalScore = 0;
    let weightedSum = 0;
    let totalWeight = 0;

    answers.forEach(answer => {
      const question = currentSession?.questions.find((q: any) => q.id === answer.questionId);
      if (!question) return;

      // Weight by difficulty
      const weight = question.difficulty === 'hard' ? 3 : 
                    question.difficulty === 'medium' ? 2 : 1;
      
      weightedSum += (answer.score || 0) * weight;
      totalWeight += weight;
    });

    totalScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    return Math.min(totalScore, 100);
  };

  /**
   * Generate detailed AI summary based on answers
   */
  const generateDetailedAISummary = (answers: Answer[], score: number): string => {
    const easyAnswers = answers.filter((a, i) => currentSession?.questions[i]?.difficulty === 'easy');
    const mediumAnswers = answers.filter((a, i) => currentSession?.questions[i]?.difficulty === 'medium');
    const hardAnswers = answers.filter((a, i) => currentSession?.questions[i]?.difficulty === 'hard');

    const avgEasy = easyAnswers.reduce((sum, a) => sum + (a.score || 0), 0) / (easyAnswers.length || 1);
    const avgMedium = mediumAnswers.reduce((sum, a) => sum + (a.score || 0), 0) / (mediumAnswers.length || 1);
    const avgHard = hardAnswers.reduce((sum, a) => sum + (a.score || 0), 0) / (hardAnswers.length || 1);

    const totalWords = answers.reduce((sum, a) => sum + a.answer.split(/\s+/).length, 0);
    const avgWords = Math.round(totalWords / answers.length);

    let summary = `**Overall Score: ${score}/100**\n\n`;

    if (score >= 85) {
      summary += `🌟 **Excellent Performance!** The candidate demonstrated exceptional technical knowledge and problem-solving abilities.\n\n`;
    } else if (score >= 70) {
      summary += `✅ **Good Performance!** The candidate showed solid understanding with room for growth.\n\n`;
    } else if (score >= 50) {
      summary += `⚠️ **Average Performance.** The candidate has basic knowledge but needs improvement in several areas.\n\n`;
    } else {
      summary += `❌ **Needs Improvement.** The candidate struggled with most questions and requires significant development.\n\n`;
    }

    summary += `**Performance Breakdown:**\n`;
    summary += `- Easy Questions: ${Math.round(avgEasy)}/100 (${easyAnswers.length} questions)\n`;
    summary += `- Medium Questions: ${Math.round(avgMedium)}/100 (${mediumAnswers.length} questions)\n`;
    summary += `- Hard Questions: ${Math.round(avgHard)}/100 (${hardAnswers.length} questions)\n\n`;

    summary += `**Answer Quality:**\n`;
    summary += `- Average answer length: ${avgWords} words\n`;
    summary += `- Detail level: ${avgWords > 50 ? 'Comprehensive' : avgWords > 30 ? 'Adequate' : 'Brief'}\n\n`;

    summary += `**Recommendation:** `;
    if (score >= 80) {
      summary += `Strongly recommend for next round. Candidate shows strong technical competency.`;
    } else if (score >= 65) {
      summary += `Recommend for next round with focus on areas needing improvement.`;
    } else if (score >= 50) {
      summary += `Consider for junior positions or with additional training.`;
    } else {
      summary += `Not recommended at this time. Suggest more preparation and reapplication.`;
    }

    return summary;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#52c41a';
      case 'medium':
        return '#faad14';
      case 'hard':
        return '#f5222d';
      default:
        return '#1890ff';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  if (!currentSession || !currentQuestion) {
    return (
      <Card>
        <Alert
          message="No Active Interview"
          description="Please start an interview to continue."
          type="info"
          showIcon
        />
      </Card>
    );
  }

  const isTimeCritical = timeRemaining <= 10;

  return (
    <div className="interview-chat">
      <Card className="interview-card">
        {/* Progress Bar */}
        <div className="interview-progress">
          <Text type="secondary">
            Question {currentSession.currentQuestionIndex + 1} of {currentSession.questions.length}
          </Text>
          <Progress 
            percent={progress} 
            status="active" 
            strokeColor={{
              '0%': '#667eea',
              '100%': '#764ba2',
            }}
          />
        </div>

        {/* Question Card */}
        <Card 
          className="question-card"
          style={{ marginTop: 20, background: '#f9f9f9' }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div className="question-header">
              <Space>
                <Title level={4} style={{ margin: 0 }}>
                  Question {currentSession.currentQuestionIndex + 1}
                </Title>
                <span 
                  style={{ 
                    padding: '4px 12px', 
                    borderRadius: '4px', 
                    background: getDifficultyColor(currentQuestion.difficulty),
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {getDifficultyLabel(currentQuestion.difficulty)}
                </span>
              </Space>
            </div>

            <Paragraph style={{ fontSize: '16px', marginBottom: 0 }}>
              {currentQuestion.text}
            </Paragraph>

            {/* Timer */}
            <div 
              className="timer-display"
              style={{
                background: isTimeCritical ? '#ff4d4f' : '#1890ff',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                animation: isTimeCritical ? 'pulse 1s infinite' : 'none',
              }}
            >
              <ClockCircleOutlined />
              <span>Time Remaining: {formatTime(timeRemaining)}</span>
            </div>

            {/* Answer Input */}
            <div>
              <Text strong>Your Answer:</Text>
              <TextArea
                rows={8}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here... (minimum 10 characters required)"
                style={{ marginTop: 8 }}
                disabled={isSubmitting}
                showCount
                maxLength={2000}
              />
              {currentAnswer.trim().length > 0 && currentAnswer.trim().length < 10 && (
                <Text type="warning" style={{ fontSize: '12px' }}>
                  Answer should be at least 10 characters long
                </Text>
              )}
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button
                type="primary"
                size="large"
                icon={currentSession.currentQuestionIndex + 1 >= currentSession.questions.length 
                  ? <CheckCircleOutlined /> 
                  : <SendOutlined />}
                onClick={handleSubmitAnswer}
                loading={isSubmitting}
                disabled={(timeRemaining > 0 && (!currentAnswer.trim() || currentAnswer.trim().length < 10)) || isSubmitting}
              >
                {currentSession.currentQuestionIndex + 1 >= currentSession.questions.length 
                  ? 'Complete Interview' 
                  : 'Submit Answer'}
              </Button>
            </div>
          </Space>
        </Card>

        {/* Interview Info */}
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Text type="secondary">
            Category: {currentQuestion.category} | 
            Time Limit: {formatTime(currentQuestion.timeLimit)}
          </Text>
        </div>
      </Card>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default InterviewChat;
