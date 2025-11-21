-- Fix task_history created_at column type from TIMESTAMP to TIMESTAMPTZ
ALTER TABLE task_history ALTER COLUMN created_at TYPE TIMESTAMPTZ;
