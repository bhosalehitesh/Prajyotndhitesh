-- SQL script to create database if it doesn't exist
-- Run this in pgAdmin or psql

-- Connect to PostgreSQL first:
-- psql -U postgres

-- Then run:
SELECT 'CREATE DATABASE sakhistore_hitesh_testing'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sakhistore_hitesh_testing')\gexec

-- Or manually:
-- CREATE DATABASE sakhistore_hitesh_testing;

-- Verify it was created:
-- \l

