import { Question } from '../types';

// Role-specific question banks
const questionBanksByRole: Record<string, any> = {
  'Full Stack Developer (React/Node)': {
    easy: [
      { text: "What is the difference between React class components and functional components?", category: "React Basics" },
      { text: "Explain what props are in React and how they are used.", category: "React Basics" },
      { text: "What is the purpose of the useState hook in React?", category: "React Hooks" },
      { text: "What is Node.js and why is it used for backend development?", category: "Node.js Basics" },
      { text: "Explain the difference between let, const, and var in JavaScript.", category: "JavaScript Fundamentals" },
    ],
    medium: [
      { text: "Explain the concept of Virtual DOM in React and how it improves performance.", category: "React Advanced" },
      { text: "What is the useEffect hook and when would you use it? Provide an example.", category: "React Hooks" },
      { text: "How does middleware work in Express.js? Provide an example.", category: "Node.js/Express" },
      { text: "Explain the difference between synchronous and asynchronous code in JavaScript. How do Promises help?", category: "JavaScript Advanced" },
      { text: "What is RESTful API design? What are the main HTTP methods and their purposes?", category: "API Design" },
    ],
    hard: [
      { text: "Describe how you would implement authentication and authorization in a full-stack application. What security considerations would you keep in mind?", category: "Security & Auth" },
      { text: "Explain React's reconciliation algorithm and how keys help optimize rendering. What happens when you don't use keys properly?", category: "React Performance" },
      { text: "How would you optimize a Node.js application for high traffic? Discuss clustering, caching, and database optimization strategies.", category: "Performance Optimization" },
      { text: "Design a real-time chat application architecture using React and Node.js. What technologies would you use and why?", category: "System Design" },
      { text: "Explain the event loop in Node.js. How does it handle asynchronous operations?", category: "Node.js Advanced" },
    ],
  },
  'Frontend Developer (React)': {
    easy: [
      { text: "What is JSX in React and why is it used?", category: "React Basics" },
      { text: "Explain the difference between state and props in React.", category: "React Basics" },
      { text: "What is the purpose of the key prop in React lists?", category: "React Basics" },
      { text: "What are React Hooks? Name at least three commonly used hooks.", category: "React Hooks" },
      { text: "Explain what CSS-in-JS is and name some popular libraries.", category: "Styling" },
    ],
    medium: [
      { text: "How does React Context API work? When would you use it instead of prop drilling?", category: "React Advanced" },
      { text: "Explain the difference between controlled and uncontrolled components in React.", category: "React Forms" },
      { text: "What is code splitting in React and how can you implement it?", category: "Performance" },
      { text: "Describe the component lifecycle in React functional components using hooks.", category: "React Hooks" },
      { text: "How would you optimize a React application's performance?", category: "Performance" },
    ],
    hard: [
      { text: "Explain React's reconciliation algorithm and fiber architecture in detail.", category: "React Internals" },
      { text: "How would you implement a custom hook for data fetching with caching and error handling?", category: "Advanced Hooks" },
      { text: "Design a scalable state management solution for a large React application. Compare Redux, Context API, and other solutions.", category: "State Management" },
      { text: "Explain how you would implement server-side rendering (SSR) in a React application.", category: "SSR/SSG" },
      { text: "How would you handle accessibility (a11y) in a complex React application?", category: "Accessibility" },
    ],
  },
  'Backend Developer (Node.js)': {
    easy: [
      { text: "What is Node.js and how does it differ from traditional server-side languages?", category: "Node.js Basics" },
      { text: "Explain what npm is and its purpose.", category: "Node.js Basics" },
      { text: "What is the difference between require() and import in Node.js?", category: "Node.js Basics" },
      { text: "What are environment variables and why are they important?", category: "Configuration" },
      { text: "Explain what middleware is in Express.js.", category: "Express Basics" },
    ],
    medium: [
      { text: "How does the event loop work in Node.js? Explain with examples.", category: "Node.js Advanced" },
      { text: "What are streams in Node.js and when would you use them?", category: "Node.js Streams" },
      { text: "Explain the difference between SQL and NoSQL databases. When would you use each?", category: "Databases" },
      { text: "How would you implement authentication and authorization in a Node.js API?", category: "Security" },
      { text: "What is the purpose of clustering in Node.js and how does it work?", category: "Performance" },
    ],
    hard: [
      { text: "Design a scalable microservices architecture using Node.js. What patterns and tools would you use?", category: "Architecture" },
      { text: "How would you handle database transactions and ensure data consistency in a distributed system?", category: "Databases" },
      { text: "Explain how you would implement rate limiting, caching, and load balancing for a high-traffic API.", category: "Performance" },
      { text: "Describe your approach to error handling, logging, and monitoring in a production Node.js application.", category: "Production" },
      { text: "How would you optimize database queries and implement efficient indexing strategies?", category: "Database Optimization" },
    ],
  },
  'DevOps Engineer': {
    easy: [
      { text: "What is DevOps and what are its main principles?", category: "DevOps Basics" },
      { text: "Explain what CI/CD means and why it's important.", category: "CI/CD" },
      { text: "What is Docker and what problem does it solve?", category: "Containerization" },
      { text: "What is version control and why is Git commonly used?", category: "Version Control" },
      { text: "Explain the difference between horizontal and vertical scaling.", category: "Scaling" },
    ],
    medium: [
      { text: "How would you set up a CI/CD pipeline for a web application?", category: "CI/CD" },
      { text: "Explain the difference between Docker and Kubernetes. When would you use each?", category: "Orchestration" },
      { text: "What is Infrastructure as Code (IaC)? Describe tools like Terraform or CloudFormation.", category: "IaC" },
      { text: "How would you implement monitoring and alerting for a production system?", category: "Monitoring" },
      { text: "Explain different deployment strategies (blue-green, canary, rolling).", category: "Deployment" },
    ],
    hard: [
      { text: "Design a highly available and fault-tolerant infrastructure for a global application.", category: "Architecture" },
      { text: "How would you implement disaster recovery and backup strategies for critical systems?", category: "DR/Backup" },
      { text: "Explain your approach to security hardening, compliance, and vulnerability management.", category: "Security" },
      { text: "How would you optimize cloud costs while maintaining performance and reliability?", category: "Cost Optimization" },
      { text: "Describe how you would implement observability (logs, metrics, traces) across a microservices architecture.", category: "Observability" },
    ],
  },
  'UI/UX Designer': {
    easy: [
      { text: "What is the difference between UI and UX design?", category: "Design Basics" },
      { text: "Explain what a design system is and why it's important.", category: "Design Systems" },
      { text: "What are wireframes and mockups? How do they differ?", category: "Design Process" },
      { text: "What is responsive design and why is it important?", category: "Responsive Design" },
      { text: "Explain the concept of user personas and their role in design.", category: "UX Research" },
    ],
    medium: [
      { text: "How would you conduct user research and usability testing?", category: "UX Research" },
      { text: "Explain the principles of visual hierarchy and how you apply them.", category: "Visual Design" },
      { text: "What is accessibility (a11y) in design and how do you ensure it?", category: "Accessibility" },
      { text: "Describe your design process from concept to final delivery.", category: "Design Process" },
      { text: "How do you handle design feedback and iterate on your designs?", category: "Collaboration" },
    ],
    hard: [
      { text: "Design a complete user flow for a complex feature (e.g., multi-step checkout). Explain your decisions.", category: "UX Design" },
      { text: "How would you measure the success of a design? What metrics would you track?", category: "Design Metrics" },
      { text: "Explain how you would design for multiple platforms (web, mobile, tablet) while maintaining consistency.", category: "Cross-platform" },
      { text: "How do you balance business requirements, user needs, and technical constraints in your designs?", category: "Design Strategy" },
      { text: "Describe how you would establish and maintain a design system for a large organization.", category: "Design Systems" },
    ],
  },
  'QA Engineer': {
    easy: [
      { text: "What is the difference between manual testing and automated testing?", category: "Testing Basics" },
      { text: "Explain what a test case is and what it should include.", category: "Testing Basics" },
      { text: "What are the different types of software testing (unit, integration, e2e)?", category: "Testing Types" },
      { text: "What is regression testing and why is it important?", category: "Testing Types" },
      { text: "Explain what a bug report should contain.", category: "Bug Reporting" },
    ],
    medium: [
      { text: "How would you design a test strategy for a new feature?", category: "Test Strategy" },
      { text: "Explain the testing pyramid and how you would apply it.", category: "Test Strategy" },
      { text: "What is test-driven development (TDD) and what are its benefits?", category: "TDD" },
      { text: "How would you test an API? What tools would you use?", category: "API Testing" },
      { text: "Explain how you would implement continuous testing in a CI/CD pipeline.", category: "CI/CD Testing" },
    ],
    hard: [
      { text: "Design a comprehensive test automation framework. What tools and patterns would you use?", category: "Test Automation" },
      { text: "How would you test a distributed microservices architecture? What challenges would you face?", category: "Microservices Testing" },
      { text: "Explain your approach to performance testing and load testing. What metrics would you measure?", category: "Performance Testing" },
      { text: "How would you implement security testing and vulnerability scanning in your QA process?", category: "Security Testing" },
      { text: "Describe how you would ensure quality in an agile/DevOps environment with frequent releases.", category: "Agile QA" },
    ],
  },
};

// Time limits in seconds per requirements
const timeLimits = {
  easy: 20,    // 20 seconds for easy questions
  medium: 60,  // 60 seconds for medium questions
  hard: 120,   // 120 seconds for hard questions
};

/**
 * Generates a set of interview questions based on role
 * @param easyCount Number of easy questions
 * @param mediumCount Number of medium questions
 * @param hardCount Number of hard questions
 * @param role The position/role for which to generate questions
 * @returns Array of Question objects
 */
export const generateQuestions = (
  easyCount: number = 2,
  mediumCount: number = 2,
  hardCount: number = 2,
  role: string = 'Full Stack Developer (React/Node)'
): Question[] => {
  const questions: Question[] = [];
  let order = 0;

  // Get the question bank for the specific role, fallback to Full Stack if role not found
  const questionBank = questionBanksByRole[role] || questionBanksByRole['Full Stack Developer (React/Node)'];

  // Helper function to get random questions from a difficulty level
  const getRandomQuestions = (difficulty: 'easy' | 'medium' | 'hard', count: number) => {
    const pool = [...questionBank[difficulty]];
    const selected = [];
    
    for (let i = 0; i < count && pool.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      selected.push(pool.splice(randomIndex, 1)[0]);
    }
    
    return selected;
  };

  // Get easy questions
  const easyQuestions = getRandomQuestions('easy', easyCount);
  easyQuestions.forEach((q) => {
    questions.push({
      id: `q-${Date.now()}-${order}`,
      text: q.text,
      difficulty: 'easy',
      timeLimit: timeLimits.easy,
      category: q.category,
      order: order++,
    });
  });

  // Get medium questions
  const mediumQuestions = getRandomQuestions('medium', mediumCount);
  mediumQuestions.forEach((q) => {
    questions.push({
      id: `q-${Date.now()}-${order}`,
      text: q.text,
      difficulty: 'medium',
      timeLimit: timeLimits.medium,
      category: q.category,
      order: order++,
    });
  });

  // Get hard questions
  const hardQuestions = getRandomQuestions('hard', hardCount);
  hardQuestions.forEach((q) => {
    questions.push({
      id: `q-${Date.now()}-${order}`,
      text: q.text,
      difficulty: 'hard',
      timeLimit: timeLimits.hard,
      category: q.category,
      order: order++,
    });
  });

  return questions;
};

/**
 * Get time limit for a specific difficulty
 */
export const getTimeLimit = (difficulty: 'easy' | 'medium' | 'hard'): number => {
  return timeLimits[difficulty];
};

/**
 * Format time in MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
