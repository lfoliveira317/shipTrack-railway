-- =====================================================
-- BEACON SHIPMENT TRACKING - DATABASE SCHEMA
-- PostgreSQL Format
-- Generated: 2026-01-13
-- =====================================================

-- Drop existing tables (if recreating)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS api_configs CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    open_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar TEXT,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'user', 'admin')),
    is_owner BOOLEAN DEFAULT FALSE,
    is_collaborator BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_open_id ON users(open_id);
CREATE INDEX idx_users_role ON users(role);

COMMENT ON TABLE users IS 'User accounts with role-based access control';
COMMENT ON COLUMN users.role IS 'User role: viewer (read-only), user (can modify), admin (full access)';

-- =====================================================
-- SHIPMENTS TABLE
-- =====================================================
CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    order_number TEXT NOT NULL,
    supplier TEXT,
    cro TEXT,
    container_number TEXT,
    mawb_number TEXT,
    carrier TEXT,
    status TEXT,
    atd TEXT,
    eta TEXT,
    ata TEXT,
    label TEXT,
    shipment_type TEXT NOT NULL DEFAULT 'ocean',
    pol TEXT,
    pod TEXT,
    vessel TEXT,
    voyage TEXT,
    commodity TEXT,
    weight TEXT,
    volume TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX idx_shipments_order_number ON shipments(order_number);
CREATE INDEX idx_shipments_container_number ON shipments(container_number);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_carrier ON shipments(carrier);
CREATE INDEX idx_shipments_created_at ON shipments(created_at DESC);

COMMENT ON TABLE shipments IS 'Container shipment tracking data';
COMMENT ON COLUMN shipments.shipment_type IS 'Type of shipment: ocean (container), air (removed)';
COMMENT ON COLUMN shipments.status IS 'Current shipment status (e.g., In transit, Delivered, etc.)';

-- =====================================================
-- COMMENTS TABLE
-- =====================================================
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    comment TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient queries
CREATE INDEX idx_comments_shipment_id ON comments(shipment_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

COMMENT ON TABLE comments IS 'User comments on shipments for collaboration';

-- =====================================================
-- ATTACHMENTS TABLE
-- =====================================================
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    s3_key TEXT,
    s3_url TEXT
);

-- Create indexes for efficient queries
CREATE INDEX idx_attachments_shipment_id ON attachments(shipment_id);
CREATE INDEX idx_attachments_uploaded_at ON attachments(uploaded_at DESC);

COMMENT ON TABLE attachments IS 'File attachments for shipments with S3 cloud storage';
COMMENT ON COLUMN attachments.s3_key IS 'S3 object key for cloud-stored files';
COMMENT ON COLUMN attachments.s3_url IS 'Presigned URL for file download';

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    shipment_id INTEGER REFERENCES shipments(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_shipment_id ON notifications(shipment_id);

COMMENT ON TABLE notifications IS 'User notifications for shipment updates and system events';
COMMENT ON COLUMN notifications.type IS 'Notification type (e.g., status_change, delay, arrival)';

-- =====================================================
-- API CONFIGS TABLE
-- =====================================================
CREATE TABLE api_configs (
    id SERIAL PRIMARY KEY,
    config_type TEXT NOT NULL CHECK (config_type IN ('single', 'per_carrier')),
    carrier TEXT,
    api_url TEXT,
    api_port TEXT,
    api_token TEXT,
    api_user TEXT,
    api_password TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_api_configs_config_type ON api_configs(config_type);
CREATE INDEX idx_api_configs_carrier ON api_configs(carrier);

COMMENT ON TABLE api_configs IS 'API configuration for carrier tracking integration';
COMMENT ON COLUMN api_configs.config_type IS 'Configuration mode: single (one API for all) or per_carrier (specific APIs per carrier)';
COMMENT ON COLUMN api_configs.carrier IS 'Carrier name (MSC, Maersk, CMA CGM, etc.) - NULL for single mode';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp for shipments
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shipments_updated_at 
    BEFORE UPDATE ON shipments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_configs_updated_at 
    BEFORE UPDATE ON api_configs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (Optional - comment out if not needed)
-- =====================================================

-- Insert default admin user (replace with your actual user data)
-- INSERT INTO users (open_id, name, email, role, is_owner)
-- VALUES ('admin_open_id', 'Admin User', 'admin@example.com', 'admin', TRUE);

-- =====================================================
-- GRANTS (Adjust based on your user setup)
-- =====================================================

-- Grant permissions to your application user
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- =====================================================
-- SCHEMA CREATION COMPLETE
-- =====================================================

-- Verify tables were created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN ('users', 'shipments', 'comments', 'attachments', 'notifications', 'api_configs')
ORDER BY table_name;
