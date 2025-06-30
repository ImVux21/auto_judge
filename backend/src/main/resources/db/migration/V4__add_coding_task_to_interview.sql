-- Add coding task related columns to interviews table

-- Add foreign key column for coding tasks
ALTER TABLE interviews
ADD COLUMN coding_task_id BIGINT NULL;

-- Add flag to indicate if this interview has a coding challenge
ALTER TABLE interviews
ADD COLUMN has_coding_challenge BOOLEAN NOT NULL DEFAULT FALSE;

-- Add foreign key constraint
ALTER TABLE interviews
ADD CONSTRAINT fk_interview_coding_task
FOREIGN KEY (coding_task_id)
REFERENCES coding_tasks (id)
ON DELETE SET NULL; 