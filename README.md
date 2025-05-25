# AutoJudge - AI Interview Platform

AutoJudge is an AI-powered interview platform that generates role-specific questions, allows live or asynchronous interviews, prevents cheating, and automatically evaluates candidates.

## Features

- **AI-Generated Questions**: Automatically creates multiple-choice and open-ended questions based on job roles
- **Interviewer Dashboard**: Manage interviews, view candidate sessions, and analyze results
- **Candidate Interface**: User-friendly interface with proctoring features
- **Automatic Evaluation**: AI-based scoring of candidate answers
- **Comprehensive Analytics**: Detailed reports and insights on candidate performance

## Technology Stack

### Backend

- Spring Boot 3.2
- Spring Security with JWT Authentication
- Spring AI for OpenAI integration
- PostgreSQL Database
- JPA/Hibernate

### Frontend

- Angular 17
- Tailwind CSS
- Responsive Design

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL
- OpenAI API Key

### Backend Setup

1. Navigate to the backend directory: `cd backend`
2. Configure database settings in `application.properties`
3. Add your OpenAI API key to `application.properties`
4. Run: `./mvnw spring-boot:run`

### Frontend Setup

1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Access the application at `http://localhost:4200`

## Usage

### For Interviewers

1. Register and log in as an interviewer
2. Create interviews with specific job roles
3. Generate questions automatically
4. Invite candidates via email
5. Review candidate performance and analytics

### For Candidates

1. Access the interview via the provided link
2. Complete the interview with automatic proctoring
3. Receive instant feedback on multiple-choice questions
4. Get detailed evaluation for open-ended answers

## License

This project is licensed under the MIT License.
