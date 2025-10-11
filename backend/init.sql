-- Initialize database
CREATE DATABASE IF NOT EXISTS monopoly;
CREATE USER IF NOT EXISTS postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE monopoly TO postgres;
