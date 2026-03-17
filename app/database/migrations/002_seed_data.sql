-- =============================================================
-- SLIIT Support Desk — Sample Data for Testing (New Schema)
-- =============================================================

-- Clear existing data
TRUNCATE TABLE ticket_attachments, ticket_comments, tickets, chat_messages, chat_sessions, kb_articles, kb_categories, sessions, notifications, staff_profiles, student_profiles, users RESTART IDENTITY CASCADE;

-- ── 1. Create Users ──────────────────────────────────────────────────────────
-- Password for all is: Password@123 (bcrypt valid hash)
INSERT INTO users (id, email, hashed_password, full_name, phone, role, is_active, is_verified)
VALUES 
-- 1 Super Admin
('11111111-1111-1111-1111-111111111111', 'super@sliit.lk', '$2b$12$11Y0VXfOgETiBJvaC3Zs3u2.u2V/Sey2Qj1sIIHDPwarZ1aaDZjsV2', 'Super Admin', '+94770000001', 'super_admin', true, true),
-- 2 Admins
('22222222-2222-2222-2222-222222222222', 'admin.it@sliit.lk', '$2b$12$11Y0VXfOgETiBJvaC3Zs3u2.u2V/Sey2Qj1sIIHDPwarZ1aaDZjsV2', 'IT Admin', '+94770000002', 'admin', true, true),
('33333333-3333-3333-3333-333333333333', 'admin.finance@sliit.lk', '$2b$12$11Y0VXfOgETiBJvaC3Zs3u2.u2V/Sey2Qj1sIIHDPwarZ1aaDZjsV2', 'Finance Admin', '+94770000003', 'admin', true, true),
-- 3 Staff
('44444444-4444-4444-4444-444444444444', 'staff.exams@sliit.lk', '$2b$12$11Y0VXfOgETiBJvaC3Zs3u2.u2V/Sey2Qj1sIIHDPwarZ1aaDZjsV2', 'Exam Officer', '+94770000004', 'staff', true, true),
('55555555-5555-5555-5555-555555555555', 'staff.library@sliit.lk', '$2b$12$11Y0VXfOgETiBJvaC3Zs3u2.u2V/Sey2Qj1sIIHDPwarZ1aaDZjsV2', 'Librarian', '+94770000005', 'staff', true, true),
-- 3 Students
('66666666-6666-6666-6666-666666666666', 'it22000001@my.sliit.lk', '$2b$12$11Y0VXfOgETiBJvaC3Zs3u2.u2V/Sey2Qj1sIIHDPwarZ1aaDZjsV2', 'Kamal Perera', '+94711111111', 'student', true, true),
('77777777-7777-7777-7777-777777777777', 'bm21000002@my.sliit.lk', '$2b$12$11Y0VXfOgETiBJvaC3Zs3u2.u2V/Sey2Qj1sIIHDPwarZ1aaDZjsV2', 'Nimali Silva', '+94722222222', 'student', true, true),
('88888888-8888-8888-8888-888888888888', 'en23000003@my.sliit.lk', '$2b$12$11Y0VXfOgETiBJvaC3Zs3u2.u2V/Sey2Qj1sIIHDPwarZ1aaDZjsV2', 'Ruwan Fernando', '+94733333333', 'student', true, true);

-- ── 1.1 Create Staff Profiles ────────────────────────────────────────────────
INSERT INTO staff_profiles (user_id, employee_id, department, position)
VALUES
('11111111-1111-1111-1111-111111111111', 'EM00000001', 'it', 'Super Admin'),
('22222222-2222-2222-2222-222222222222', 'EM00000002', 'it', 'IT Support Specialist'),
('33333333-3333-3333-3333-333333333333', 'EM00000003', 'finance', 'Finance Officer'),
('44444444-4444-4444-4444-444444444444', 'EM00000004', 'academic', 'Exam Officer'),
('55555555-5555-5555-5555-555555555555', 'EM00000005', 'library', 'Librarian');

-- ── 1.2 Create Student Profiles ──────────────────────────────────────────────
INSERT INTO student_profiles (user_id, registration_number, faculty, campus)
VALUES
('66666666-6666-6666-6666-666666666666', 'IT22000001', 'computing', 'malabe'),
('77777777-7777-7777-7777-777777777777', 'BM21000002', 'business', 'kandy'),
('88888888-8888-8888-8888-888888888888', 'EN23000003', 'engineering', 'malabe');


-- ── 2. Create Knowledge Base Categories & Articles ───────────────────────────
INSERT INTO kb_categories (id, name, description, icon, sort_order)
VALUES
('aaaa0000-0000-0000-0000-000000000000', 'IT Services', 'Wi-Fi, CourseWeb, Email', 'wifi', 1),
('bbbb0000-0000-0000-0000-000000000000', 'Examinations', 'Results, Timetables, Repeat Exams', 'school', 2),
('cccc0000-0000-0000-0000-000000000000', 'Finance', 'Payments, Penalties, Scholarships', 'payments', 3);

INSERT INTO kb_articles (category_id, title, content, author_id, tags, is_published, view_count, helpful_count)
VALUES
('aaaa0000-0000-0000-0000-000000000000', 'How to connect to SLIIT Student Wi-Fi?', 'Use your SLIIT email and password to connect to the "SLIIT-Student" SSID.', '22222222-2222-2222-2222-222222222222', ARRAY['wifi', 'internet', 'connection'], true, 150, 45),
('bbbb0000-0000-0000-0000-000000000000', 'When are semester results released?', 'Results are generally released 3 weeks after the final date of the examination period.', '44444444-4444-4444-4444-444444444444', ARRAY['exams', 'results', 'grades'], true, 300, 120),
('cccc0000-0000-0000-0000-000000000000', 'How to pay semester fees online?', 'Log into the SLIIT payment portal, enter your registration number, and pay via debit/credit card.', '33333333-3333-3333-3333-333333333333', ARRAY['fees', 'payment', 'portal'], true, 500, 200);


-- ── 3. Create Tickets and Comments ───────────────────────────────────────────
INSERT INTO tickets (id, user_id, assigned_to, subject, message, department, status, priority)
VALUES 
-- Open ticket by Kamal (Unassigned)
('dddd1111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', NULL, 'CourseWeb Login Fails', 'I cannot login to CourseWeb. It says invalid credentials.', 'technical', 'open', 'high'),

-- In Progress ticket by Nimali (Assigned to Finance Admin)
('eeee2222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', 'Payment not reflected', 'I paid my semester fee yesterday but my portal still shows pending.', 'financial', 'in_progress', 'medium');

-- Add Comments to the In Progress ticket
INSERT INTO ticket_comments (ticket_id, user_id, content, is_internal)
VALUES
('eeee2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Please attach your payment receipt.', false),
('eeee2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Double check payment gateway logs before approving.', true), -- internal note
('eeee2222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', 'I will upload it shortly.', false);


-- ── 4. Create Chat Sessions and Messages ─────────────────────────────────────
INSERT INTO chat_sessions (id, user_id, title)
VALUES
('ffff0000-0000-0000-0000-000000000000', '66666666-6666-6666-6666-666666666666', 'Wi-Fi Connection Issue');

INSERT INTO chat_messages (session_id, role, content)
VALUES
('ffff0000-0000-0000-0000-000000000000', 'user', 'How do I connect to campus wifi?'),
('ffff0000-0000-0000-0000-000000000000', 'assistant', 'To connect to the SLIIT Student Wi-Fi, use your SLIIT email and password to connect to the "SLIIT-Student" SSID.');


-- ── 5. Create Notifications ──────────────────────────────────────────────────
INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id, is_read)
VALUES
('77777777-7777-7777-7777-777777777777', 'Ticket Updated', 'Finance Admin commented on your ticket "Payment not reflected".', 'ticket_update', 'ticket', 'eeee2222-2222-2222-2222-222222222222', false),
('11111111-1111-1111-1111-111111111111', 'System Maintenance', 'CourseWeb will be down for maintenance this Sunday from 2 AM to 4 AM.', 'announcement', NULL, NULL, true);
