# AutoJudge Architecture

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
