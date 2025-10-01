import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';

// Pages
import HomePage from './pages/HomePage';
import IntervieweePage from './pages/IntervieweePage';
import InterviewerPage from './pages/InterviewerPage';
import NotFoundPage from './pages/NotFoundPage';

// Styles
import 'antd/dist/reset.css';
import './App.css';

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
      }}
    >
      <Router>
        <div className="app">
          <main className="app-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/interview" element={<IntervieweePage />} />
              <Route path="/dashboard" element={<InterviewerPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ConfigProvider>
  );
};

export default App;
