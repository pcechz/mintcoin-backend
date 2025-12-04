-- ============================================
-- MINTCOIN DATABASE INITIALIZATION SCRIPT
-- ============================================
-- This script creates all necessary databases
-- for the microservices architecture
-- ============================================

-- Note: This script is executed once during PostgreSQL initialization
-- via docker-entrypoint-initdb.d. If databases already exist, the script
-- will fail. To recreate, stop containers and remove volumes.

-- Create databases for each microservice
-- Each service gets its own database for proper separation of concerns
CREATE DATABASE auth_db;
CREATE DATABASE user_db;
CREATE DATABASE kyc_db;
CREATE DATABASE wallet_db;
CREATE DATABASE ledger_db;
CREATE DATABASE payment_db;
CREATE DATABASE room_db;
CREATE DATABASE call_billing_db;
CREATE DATABASE chat_db;
CREATE DATABASE gift_db;
CREATE DATABASE referral_db;
CREATE DATABASE discovery_db;
CREATE DATABASE social_graph_db;
CREATE DATABASE notification_db;
CREATE DATABASE moderation_db;
CREATE DATABASE fraud_db;
CREATE DATABASE admin_db;
CREATE DATABASE analytics_db;

-- Enable UUID extension for all databases (PostgreSQL 13+)
\c auth_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c user_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c kyc_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c wallet_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c ledger_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c payment_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c room_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c call_billing_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c chat_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c gift_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c referral_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c discovery_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c social_graph_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c notification_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c moderation_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c fraud_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c admin_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c analytics_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
