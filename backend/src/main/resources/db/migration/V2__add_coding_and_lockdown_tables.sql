-- Create coding_tasks table
CREATE TABLE coding_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    time_limit INT NOT NULL,
    language VARCHAR(50) NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    initial_code TEXT NOT NULL,
    solution_code TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- Create test_cases table
CREATE TABLE test_cases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coding_task_id BIGINT NOT NULL,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN NOT NULL,
    `order` INT NOT NULL,
    FOREIGN KEY (coding_task_id) REFERENCES coding_tasks(id) ON DELETE CASCADE
);

-- Create coding_submissions table
CREATE TABLE coding_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_session_id BIGINT NOT NULL,
    coding_task_id BIGINT NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    submitted_at TIMESTAMP NOT NULL,
    is_complete BOOLEAN NOT NULL,
    candidate_notes TEXT,
    FOREIGN KEY (interview_session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (coding_task_id) REFERENCES coding_tasks(id) ON DELETE CASCADE
);

-- Create test_case_results table
CREATE TABLE test_case_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coding_submission_id BIGINT NOT NULL,
    test_case_id BIGINT NOT NULL,
    passed BOOLEAN NOT NULL,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    actual_output TEXT NOT NULL,
    execution_time_ms BIGINT,
    FOREIGN KEY (coding_submission_id) REFERENCES coding_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE
);

-- Create proctor_events table for browser lockdown features
CREATE TABLE proctor_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_session_id BIGINT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    event_details TEXT,
    severity INT NOT NULL,
    FOREIGN KEY (interview_session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
);

-- Add index for performance
CREATE INDEX idx_test_case_coding_task ON test_cases(coding_task_id);
CREATE INDEX idx_coding_submission_session ON coding_submissions(interview_session_id);
CREATE INDEX idx_coding_submission_task ON coding_submissions(coding_task_id);
CREATE INDEX idx_test_case_result_submission ON test_case_results(coding_submission_id);
CREATE INDEX idx_test_case_result_test_case ON test_case_results(test_case_id);
CREATE INDEX idx_proctor_events_session ON proctor_events(interview_session_id);
CREATE INDEX idx_proctor_events_type ON proctor_events(event_type); 