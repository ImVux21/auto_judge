-- Create join table for interview and coding tasks (many-to-many)
CREATE TABLE interview_coding_tasks (
    interview_id BIGINT NOT NULL,
    coding_task_id BIGINT NOT NULL,
    PRIMARY KEY (interview_id, coding_task_id),
    FOREIGN KEY (interview_id) REFERENCES interviews(id),
    FOREIGN KEY (coding_task_id) REFERENCES coding_tasks(id)
);

-- Migrate existing data: Copy single coding task relationships to the new join table
INSERT INTO interview_coding_tasks (interview_id, coding_task_id)
SELECT id, coding_task_id FROM interviews 
WHERE coding_task_id IS NOT NULL;

-- Note: We're keeping the coding_task_id column in interviews table for backward compatibility 