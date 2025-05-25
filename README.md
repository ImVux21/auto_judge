# AutoJudge - AI-Based Interview Platform

AutoJudge is a smart AI interview platform that generates role-specific questions, allows live or async answers, prevents cheating, and evaluates candidates automatically.

## Project Structure

This project consists of:

- **Backend**: Spring Boot application with PostgreSQL database
- **Frontend**: Angular 19 with Tailwind CSS

## Technologies Used

### Backend

- Spring Boot 3.2.3
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL
- Spring AI (OpenAI integration)
- Lombok

### Frontend

- Angular 19
- Tailwind CSS
- Chart.js for analytics
- ngx-webcam for camera proctoring

## Features

- Role-based MCQ and open-ended question generation using LLMs
- Interviewer dashboard to create and send out interview sessions
- Candidate interface for timed sessions with proctoring
- Auto-evaluation for MCQs and open-ended answers
- Cheating prevention: IP/device binding, webcam proctoring, copy detection
- Result dashboard with scores and analytics

## Setup Instructions

### Backend Setup

1. Install PostgreSQL and create a database named `autojudge`
2. Update `application.properties` with your database credentials
3. Add your OpenAI API key to `application.properties`
4. Run the Spring Boot application:
   ```
   cd backend
   ./gradlew bootRun
   ```

### Frontend Setup

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```
2. Start the development server:
   ```
   npm start
   ```
3. Open your browser and navigate to `http://localhost:4200`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
# auto_judge
