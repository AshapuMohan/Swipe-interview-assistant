# Crisp Interview Assistant 

An AI-powered interview assistant platform built for the Swipe Internship Assignment. This application provides a seamless interview experience for both candidates and interviewers.

## Features

### For Candidates (Interviewee Tab)
- **Resume Upload**: Support for PDF and DOCX formats (or skip and enter manually)
- **Automatic Data Extraction**: Attempts to extract Name, Email, and Phone from resume
- **Smart Form Validation**: Prompts for missing information before starting
- **Manual Entry Option**: Skip resume upload and enter details directly
- **Timed Interview Questions**: 
  - 2 Easy questions (60 seconds each)
  - 2 Medium questions (120 seconds each)
  - 2 Hard questions (180 seconds each)
- **Auto-Submit**: Answers automatically submitted when timer expires
- **AI Scoring**: Final score and summary provided after completion
- **Session Persistence**: Resume from where you left off with "Welcome Back" modal

### For Interviewers (Dashboard Tab)
- **Candidate Management**: View all candidates sorted by score
- **Detailed Profiles**: Access candidate information, resume, and chat history
- **Search & Filter**: Find candidates quickly with advanced search
- **AI Summaries**: View AI-generated evaluation summaries
- **Real-time Updates**: Live status tracking of interviews

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **State Management**: Redux Toolkit with Redux Persist
- **UI Library**: Ant Design 5
- **Routing**: React Router v6
- **Data Persistence**: LocalStorage with Redux Persist
- **Styling**: CSS3 with responsive design
- **Icons**: Ant Design Icons

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crisp-interview-assistant
```

2. Install dependencies:
```bash
npm install
```

3. **Configure AI API (Optional but Recommended)**:
```bash
# Copy the example env file
copy .env.example .env

# Get your free Gemini API key from:
# https://makersuite.google.com/app/apikey

# Add to .env file:
REACT_APP_GEMINI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

**Note**: The app works without an API key using fallback AI scoring, but real AI judging provides better results.

## Project Structure

```
crisp-interview-assistant/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable components
│   ├── features/        # Feature-specific components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── store/          # Redux store and slices
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main app component
│   └── index.tsx       # Entry point
├── package.json
└── README.md
```

## Key Components

### Pages
- **HomePage**: Landing page with role selection
- **IntervieweePage**: Candidate interview interface
- **InterviewerPage**: Interviewer dashboard
- **NotFoundPage**: 404 error page

### Store Slices
- **interviewSlice**: Manages interview session state
- **candidateSlice**: Manages candidate data

### Utilities
- **questionGenerator**: Generates interview questions
- **resumeParser**: Extracts data from resumes
- **useTimer**: Custom hook for countdown timers

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

### `npm run eject`
Ejects from Create React App (one-way operation)

## Deployment

### Deploy to Vercel
```bash
npm run build
# Deploy the build folder to Vercel
```

### Deploy to Netlify
```bash
npm run build
# Deploy the build folder to Netlify
```

## Features Implementation

### Resume Upload & Parsing
- Supports PDF and DOCX file formats
- Maximum file size: 5MB
- **Real PDF Parsing**: Uses `pdfjs-dist` to extract text from PDF files
- **Real DOCX Parsing**: Uses `mammoth` to extract text from DOCX files
- Automatically extracts: Name, Email, Phone Number using regex patterns
- Validates extracted data
- **Fallback**: If extraction fails, users can manually enter information or skip upload entirely

### Interview Flow
- Dynamic question generation based on difficulty
- Countdown timer for each question
- Auto-submit on timeout
- Progress tracking
- Session persistence

### Data Persistence
- Redux Persist with LocalStorage
- Saves interview progress
- Restores unfinished sessions
- "Welcome Back" modal for returning users

### Interviewer Dashboard
- Sortable candidate table
- Search functionality
- Filter by status and position
- Detailed candidate view modal
- AI evaluation metrics

## Interview Questions

The application includes a comprehensive question bank for Full Stack (React/Node) roles:

- **Easy**: React basics, JavaScript fundamentals
- **Medium**: React hooks, Express middleware, async programming
- **Hard**: System design, performance optimization, security

## Security Considerations

- Client-side data validation
- Secure file upload handling
- XSS prevention
- CSRF protection ready

## Future Enhancements

- [ ] Real AI integration (OpenAI/Anthropic)
- [ ] Video interview support
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Calendar integration
- [ ] Real-time collaboration

## License

This project is created for the Swipe Internship Assignment.

## Author

Built with for Swipe Internship Assignment

## Acknowledgments

- Ant Design for the beautiful UI components
- Redux team for excellent state management
- React team for the amazing framework
