-- =============================================================
-- SLIIT Support Desk — Supabase Table Setup (Complete Schema)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================

-- ── Enable UUID generation ──────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users table ─────────────────────────────────────────────────
-- ── Users table (Auth & Shared Identity) ────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email               TEXT UNIQUE NOT NULL,
    hashed_password     TEXT NOT NULL,
    full_name           TEXT NOT NULL,
    phone               TEXT,
    role                TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff', 'admin', 'super_admin')),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
    profile_picture     TEXT,
    last_login          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Student Profiles ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_profiles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registration_number TEXT UNIQUE NOT NULL,
    faculty             TEXT NOT NULL CHECK (faculty IN ('computing', 'business', 'engineering', 'humanities')),
    campus              TEXT NOT NULL CHECK (campus IN ('malabe', 'metro', 'matara', 'kandy', 'kurunegala', 'jaffna')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Staff Profiles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff_profiles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id         TEXT UNIQUE NOT NULL,
    department          TEXT NOT NULL,
    position            TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tickets table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to         UUID REFERENCES users(id) ON DELETE SET NULL,
    subject             TEXT NOT NULL,
    message             TEXT NOT NULL,
    department          TEXT NOT NULL CHECK (department IN ('academic', 'financial', 'technical', 'administrative', 'library', 'other')),
    status              TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'escalated')),
    priority            TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    admin_note          TEXT,
    resolution          TEXT,
    resolved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Ticket Comments ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_comments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id           UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content             TEXT NOT NULL,
    is_internal         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Ticket Attachments ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_attachments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id           UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    file_name           TEXT NOT NULL,
    file_url            TEXT NOT NULL,
    file_size           INTEGER,
    mime_type           TEXT,
    uploaded_by         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Knowledge Base Categories ───────────────────────────────────
CREATE TABLE IF NOT EXISTS kb_categories (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                TEXT UNIQUE NOT NULL,
    description         TEXT,
    icon                TEXT,
    sort_order          INTEGER DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Knowledge Base Articles ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS kb_articles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id         UUID NOT NULL REFERENCES kb_categories(id) ON DELETE CASCADE,
    title               TEXT NOT NULL,
    content             TEXT NOT NULL,
    author_id           UUID REFERENCES users(id) ON DELETE SET NULL,
    tags                TEXT[],
    is_published        BOOLEAN NOT NULL DEFAULT FALSE,
    view_count          INTEGER NOT NULL DEFAULT 0,
    helpful_count       INTEGER NOT NULL DEFAULT 0,
    file_url            TEXT,
    file_name           TEXT,
    source_type         TEXT DEFAULT 'manual' CHECK (source_type IN ('manual', 'pdf', 'document', 'webpage')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── RAG Chat Sessions ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
    title               TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    ended_at            TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── RAG Chat Messages ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id          UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role                TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content             TEXT NOT NULL,
    source_documents    JSONB,
    confidence_score    FLOAT,
    feedback            TEXT CHECK (feedback IN ('helpful', 'not_helpful')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Sessions (Auth) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token       TEXT UNIQUE NOT NULL,
    ip_address          TEXT,
    user_agent          TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at          TIMESTAMPTZ NOT NULL,
    last_used_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Notifications ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               TEXT NOT NULL,
    message             TEXT NOT NULL,
    type                TEXT NOT NULL CHECK (type IN ('ticket_update', 'ticket_assigned', 'ticket_resolved', 'system', 'announcement')),
    reference_type      TEXT,
    reference_id        UUID,
    is_read             BOOLEAN NOT NULL DEFAULT FALSE,
    read_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_student_profiles_reg_number ON student_profiles(registration_number);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_emp_id ON staff_profiles(employee_id);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_department ON tickets(department);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_attachments_ticket_id ON ticket_attachments(ticket_id);

CREATE INDEX IF NOT EXISTS idx_kb_articles_category_id ON kb_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- ── Auto-update updated_at on row changes ───────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER kb_articles_updated_at
    BEFORE UPDATE ON kb_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
