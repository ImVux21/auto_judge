# AutoJudge Architecture

This document describes the architectural design of the AutoJudge platform, focusing on the Browser Lockdown system and Live Coding features.

## Overview

AutoJudge is designed as a microservice-oriented application with a clear separation between frontend and backend components. The application follows a layered architecture pattern with presentation, business logic, and data access layers.

## System Components

### Frontend

- **Angular 17** with standalone components
- **Monorepo structure** with three packages:
  - `@autojudge/core`: Core services and utilities
  - `@autojudge/ui`: Reusable UI components
  - `@autojudge/main`: Main application

### Backend

- **Spring Boot 3.2** for RESTful API services
- **Spring Security** with JWT authentication
- **PostgreSQL** for data persistence
- **Spring AI** for OpenAI integration

## Browser Lockdown Feature

The Browser Lockdown system ensures interview integrity by preventing candidates from accessing unauthorized resources during assessments.

### Components

#### Frontend

1. **LockdownService**: Angular service that monitors browser state
   - Fullscreen management
   - Tab visibility detection
   - Copy/paste event monitoring

2. **FullscreenDirective**: Angular directive to enforce and monitor fullscreen mode

3. **SecurityIndicator**: UI component showing current security status

#### Backend

1. **LockdownService**: Spring service for processing security events
   - Records security violations
   - Evaluates session security status
   - Provides violation reports

2. **ProctorEvent**: Entity model for security events
   - Tracks event type, timestamp, and severity
   - Related to specific interview session

3. **LockdownController**: REST endpoints for the lockdown system
   - Record security events
   - Retrieve security status
   - Get violation reports

### Flow

1. Candidate starts interview session
2. LockdownService activates fullscreen mode
3. Frontend continuously monitors for security violations:
   - Tab switching
   - Fullscreen exit
   - Copy/paste attempts
4. Security events sent to backend via API
5. Events stored in database for later review
6. Security indicators update in real-time

## Live Coding Feature

The Live Coding system provides a robust environment for technical assessments with coding tasks.

### Components

#### Frontend

1. **NeoCodeEditor**: Monaco-based code editor component
   - Syntax highlighting
   - Language-specific features
   - Copy/paste allowed only within editor

2. **CodingChallenge**: Component for candidates to solve tasks
   - Task instructions
   - Code editor
   - Submission and execution controls
   - Real-time feedback

3. **CodingTaskCreator**: Component for interviewers to create tasks
   - Define task parameters
   - Create test cases
   - Provide reference solutions

#### Backend

1. **CodingService**: Spring service for managing coding tasks
   - CRUD operations for coding tasks
   - Submission handling
   - Progress saving

2. **CodeExecutionService**: Service for executing submitted code
   - Runs code in isolated environment
   - Validates against test cases
   - Returns execution results

3. **CodingController**: REST endpoints for coding functionality
   - Task management
   - Code execution
   - Submission handling

### Data Model

1. **CodingTask**: Entity representing a coding challenge
   - Instructions, difficulty, time limit
   - Initial code template
   - Programming language
   - Reference solution

2. **TestCase**: Entity for test cases
   - Input data
   - Expected output
   - Visibility flag (visible/hidden to candidate)

3. **CodingSubmission**: Entity for candidate submissions
   - Submitted code
   - Related interview session
   - Submission timestamp
   - Completion status

4. **TestCaseResult**: Entity for execution results
   - Pass/fail status
   - Actual output
   - Execution time

### Flow

1. Interviewer creates coding task with test cases
2. Candidate starts interview and receives coding task
3. Candidate solves task in code editor
4. Periodic auto-saving of progress
5. Candidate can execute code against visible test cases
6. On submission, code is executed against all test cases
7. Results are stored and available for review
8. Interviewer can view and evaluate submissions

## Security Considerations

1. **Code Execution**:
   - Isolated execution environment
   - Resource limitations (CPU, memory, time)
   - Input validation to prevent injection

2. **Browser Lockdown**:
   - Client-side security measures can be circumvented
   - Multiple layers of detection for greater security
   - Violations logged for manual review

3. **Data Protection**:
   - Encrypted communication
   - Access control for submissions
   - Session management

## System Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                        Angular Frontend                               │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐ │
│ │ Auth Module   │ │ Interviewer   │ │ Candidate     │ │ Analytics   │ │
│ │               │ │ Dashboard     │ │ Interface     │ │ Dashboard   │ │
│ └───────────────┘ └───────────────┘ └───────────────┘ └─────────────┘ │
└───────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────────────┐
│                       Spring Boot Backend                             │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐ │
│ │ Auth Service  │ │ Interview     │ │ Question      │ │ Evaluation  │ │
│ │ & JWT         │ │ Service       │ │ Service       │ │ Service     │ │
│ └───────────────┘ └───────────────┘ └───────────────┘ └─────────────┘ │
│                                                                       │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐                │
│ │ User Service  │ │ Proctor       │ │ Analytics     │                │
│ │               │ │ Service       │ │ Service       │                │
│ └───────────────┘ └───────────────┘ └───────────────┘                │
└───────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────────────┐
│                       PostgreSQL Database                             │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐ │
│ │ Users         │ │ Interviews    │ │ Questions     │ │ Options     │ │
│ └───────────────┘ └───────────────┘ └───────────────┘ └─────────────┘ │
│                                                                       │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐                │
│ │ Sessions      │ │ Answers       │ │ Analytics     │                │
│ └───────────────┘ └───────────────┘ └───────────────┘                │
└───────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────────────┐
│                         External Services                             │
│ ┌───────────────┐ ┌───────────────┐                                  │
│ │ OpenAI API    │ │ ATS           │                                  │
│ │ (Question Gen │ │ Integration   │                                  │
│ │ & Evaluation) │ │ (Optional)    │                                  │
│ └───────────────┘ └───────────────┘                                  │
└───────────────────────────────────────────────────────────────────────┘
```

## Database Schema

```
+-------------+       +-------------+       +-------------+
| Users       |       | Interviews  |       | Questions   |
+-------------+       +-------------+       +-------------+
| id          |       | id          |       | id          |
| firstName   |       | title       |       | text        |
| lastName    |       | jobRole     |       | type        |
| email       |<----->| createdBy   |<----->| interviewId |
| password    |       | createdAt   |       | difficulty  |
| roles       |       | timeLimit   |       | category    |
+-------------+       | active      |       | orderIndex  |
                      +-------------+       | modelAnswer |
                             ^              +-------------+
                             |                     ^
                             |                     |
+-------------+       +-------------+       +-------------+
| Sessions    |       | Answers     |       | Options     |
+-------------+       +-------------+       +-------------+
| id          |       | id          |       | id          |
| interviewId |<----->| sessionId   |       | questionId  |<----+
| candidateId |       | questionId  |<----->| text        |     |
| startTime   |       | textAnswer  |       | correct     |     |
| endTime     |       | submittedAt |       +-------------+     |
| status      |       | score       |                           |
| accessToken |       | aiEvaluation|       +-------------+     |
| ipAddress   |       +-------------+       | Answer_Options|    |
| deviceInfo  |              ^              +-------------+     |
| score       |              |              | answerId    |-----+
| proctored   |              |              | optionId    |
+-------------+              +              +-------------+
```

## Component Structure

### Frontend Components

- **Auth Module**: Login, Registration, Password Reset
- **Interviewer Dashboard**: Create/Manage Interviews, View Results
- **Candidate Interface**: Take Interview, Proctored Session
- **Analytics Dashboard**: Performance Metrics, Comparison Reports

### Backend Services

- **Auth Service**: Authentication, Authorization, JWT Management
- **Interview Service**: Interview CRUD, Session Management
- **Question Service**: Question Generation, Management
- **Evaluation Service**: LLM-based Answer Evaluation
- **User Service**: User Management
- **Proctor Service**: Webcam Monitoring, Anti-cheat
- **Analytics Service**: Results Processing, Reporting

## Data Flow

1. **Interview Creation**:

   - Interviewer creates interview template
   - LLM generates appropriate questions
   - Questions saved to database

2. **Interview Session**:

   - Candidate receives unique access link
   - Session starts with device/IP binding
   - Proctoring begins with webcam
   - Questions presented with timing constraints

3. **Answer Evaluation**:

   - MCQ answers auto-evaluated
   - Open-ended answers processed by LLM
   - Results saved with detailed scoring

4. **Results & Analytics**:
   - Interviewer views results dashboard
   - System generates candidate performance reports
   - HR collaborates with tech leads for review
