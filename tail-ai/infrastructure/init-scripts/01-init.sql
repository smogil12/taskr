-- Initialize the database with proper user and permissions
CREATE USER taskr_user WITH PASSWORD 'taskr_password';
CREATE DATABASE taskr_dev OWNER taskr_user;
GRANT ALL PRIVILEGES ON DATABASE taskr_dev TO taskr_user;

-- Connect to the taskr_dev database
\c taskr_dev;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO taskr_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO taskr_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO taskr_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO taskr_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO taskr_user;
