# SLIIT Support Desk — Database Schema & Relationships

## ER Diagram Overview

```
users (Central Entity)
├── 1:1 ── student_profiles
├── 1:1 ── staff_profiles
├── 1:N ── tickets (as creator)
├── 1:N ── tickets (as assignee)
├── 1:N ── ticket_comments
├── 1:N ── ticket_attachments (as uploader)
├── 1:N ── kb_articles (as author)
├── 1:N ── chat_sessions
├── 1:N ── sessions (auth)
└── 1:N ── notifications

tickets
├── 1:N ── ticket_comments
└── 1:N ── ticket_attachments

kb_categories
└── 1:N ── kb_articles

chat_sessions
└── 1:N ── chat_messages
```

---

## Tables

### 1. users
| Column            | Type         | Constraints                                                              |
|-------------------|--------------|--------------------------------------------------------------------------|
| id                | UUID         | PK, default uuid_generate_v4()                                          |
| email             | TEXT         | UNIQUE, NOT NULL                                                         |
| hashed_password   | TEXT         | NOT NULL                                                                 |
| full_name         | TEXT         | NOT NULL                                                                 |
| phone             | TEXT         |                                                                          |
| role              | TEXT         | NOT NULL, default 'student', CHECK (student, staff, admin, super_admin)  |
| is_active         | BOOLEAN      | NOT NULL, default TRUE                                                   |
| is_verified       | BOOLEAN      | NOT NULL, default FALSE                                                  |
| profile_picture   | TEXT         |                                                                          |
| last_login        | TIMESTAMPTZ  |                                                                          |
| created_at        | TIMESTAMPTZ  | NOT NULL, default NOW()                                                  |
| updated_at        | TIMESTAMPTZ  | NOT NULL, default NOW()                                                  |

---

### 2. student_profiles
| Column              | Type         | Constraints                                                             |
|---------------------|--------------|-------------------------------------------------------------------------|
| id                  | UUID         | PK                                                                      |
| user_id             | UUID         | FK → users(id), UNIQUE, NOT NULL, ON DELETE CASCADE                     |
| registration_number | TEXT         | UNIQUE, NOT NULL                                                        |
| faculty             | TEXT         | NOT NULL, CHECK (computing, business, engineering, humanities)          |
| campus              | TEXT         | NOT NULL, CHECK (malabe, metro, matara, kandy, kurunegala, jaffna)      |
| created_at          | TIMESTAMPTZ  | NOT NULL                                                                |
| updated_at          | TIMESTAMPTZ  | NOT NULL                                                                |

---

### 3. staff_profiles
| Column      | Type         | Constraints                                         |
|-------------|--------------|-----------------------------------------------------|
| id          | UUID         | PK                                                  |
| user_id     | UUID         | FK → users(id), UNIQUE, NOT NULL, ON DELETE CASCADE |
| employee_id | TEXT         | UNIQUE, NOT NULL                                    |
| department  | TEXT         | NOT NULL                                            |
| position    | TEXT         |                                                     |
| created_at  | TIMESTAMPTZ  | NOT NULL                                            |
| updated_at  | TIMESTAMPTZ  | NOT NULL                                            |

---

### 4. tickets
| Column      | Type         | Constraints                                                                          |
|-------------|--------------|--------------------------------------------------------------------------------------|
| id          | UUID         | PK                                                                                   |
| user_id     | UUID         | FK → users(id), NOT NULL, ON DELETE CASCADE                                          |
| assigned_to | UUID         | FK → users(id), ON DELETE SET NULL                                                   |
| subject     | TEXT         | NOT NULL                                                                             |
| message     | TEXT         | NOT NULL                                                                             |
| department  | TEXT         | NOT NULL, CHECK (academic, financial, technical, administrative, library, other)      |
| status      | TEXT         | NOT NULL, default 'open', CHECK (open, in_progress, resolved, closed, escalated)     |
| priority    | TEXT         | NOT NULL, default 'medium', CHECK (low, medium, high, urgent)                        |
| admin_note  | TEXT         |                                                                                      |
| resolution  | TEXT         |                                                                                      |
| resolved_at | TIMESTAMPTZ  |                                                                                      |
| created_at  | TIMESTAMPTZ  | NOT NULL                                                                             |
| updated_at  | TIMESTAMPTZ  | NOT NULL                                                                             |

---

### 5. ticket_comments
| Column      | Type         | Constraints                                      |
|-------------|--------------|--------------------------------------------------|
| id          | UUID         | PK                                               |
| ticket_id   | UUID         | FK → tickets(id), NOT NULL, ON DELETE CASCADE    |
| user_id     | UUID         | FK → users(id), NOT NULL, ON DELETE CASCADE      |
| content     | TEXT         | NOT NULL                                         |
| is_internal | BOOLEAN      | NOT NULL, default FALSE                          |
| created_at  | TIMESTAMPTZ  | NOT NULL                                         |

---

### 6. ticket_attachments
| Column      | Type         | Constraints                                      |
|-------------|--------------|--------------------------------------------------|
| id          | UUID         | PK                                               |
| ticket_id   | UUID         | FK → tickets(id), NOT NULL, ON DELETE CASCADE    |
| file_name   | TEXT         | NOT NULL                                         |
| file_url    | TEXT         | NOT NULL                                         |
| file_size   | INTEGER      |                                                  |
| mime_type   | TEXT         |                                                  |
| uploaded_by | UUID         | FK → users(id), NOT NULL, ON DELETE CASCADE      |
| created_at  | TIMESTAMPTZ  | NOT NULL                                         |

---

### 7. kb_categories
| Column      | Type         | Constraints        |
|-------------|--------------|--------------------|
| id          | UUID         | PK                 |
| name        | TEXT         | UNIQUE, NOT NULL   |
| description | TEXT         |                    |
| icon        | TEXT         |                    |
| sort_order  | INTEGER      | default 0          |
| created_at  | TIMESTAMPTZ  | NOT NULL           |

---

### 8. kb_articles
| Column         | Type         | Constraints                                                  |
|----------------|--------------|--------------------------------------------------------------|
| id             | UUID         | PK                                                           |
| category_id    | UUID         | FK → kb_categories(id), NOT NULL, ON DELETE CASCADE          |
| title          | TEXT         | NOT NULL                                                     |
| content        | TEXT         | NOT NULL                                                     |
| author_id      | UUID         | FK → users(id), ON DELETE SET NULL                           |
| tags           | TEXT[]       |                                                              |
| is_published   | BOOLEAN      | NOT NULL, default FALSE                                      |
| view_count     | INTEGER      | NOT NULL, default 0                                          |
| helpful_count  | INTEGER      | NOT NULL, default 0                                          |
| file_url       | TEXT         |                                                              |
| file_name      | TEXT         |                                                              |
| source_type    | TEXT         | default 'manual', CHECK (manual, pdf, document, webpage)     |
| created_at     | TIMESTAMPTZ  | NOT NULL                                                     |
| updated_at     | TIMESTAMPTZ  | NOT NULL                                                     |

---

### 9. chat_sessions
| Column     | Type         | Constraints                                  |
|------------|--------------|----------------------------------------------|
| id         | UUID         | PK                                           |
| user_id    | UUID         | FK → users(id), ON DELETE CASCADE            |
| title      | TEXT         |                                              |
| is_active  | BOOLEAN      | NOT NULL, default TRUE                       |
| ended_at   | TIMESTAMPTZ  |                                              |
| created_at | TIMESTAMPTZ  | NOT NULL                                     |

---

### 10. chat_messages
| Column           | Type         | Constraints                                       |
|------------------|--------------|---------------------------------------------------|
| id               | UUID         | PK                                                |
| session_id       | UUID         | FK → chat_sessions(id), NOT NULL, ON DELETE CASCADE |
| role             | TEXT         | NOT NULL, CHECK (user, assistant)                 |
| content          | TEXT         | NOT NULL                                          |
| source_documents | JSONB        |                                                   |
| confidence_score | FLOAT        |                                                   |
| feedback         | TEXT         | CHECK (helpful, not_helpful)                      |
| created_at       | TIMESTAMPTZ  | NOT NULL                                          |

---

### 11. sessions (Auth)
| Column        | Type         | Constraints                                   |
|---------------|--------------|-----------------------------------------------|
| id            | UUID         | PK                                            |
| user_id       | UUID         | FK → users(id), NOT NULL, ON DELETE CASCADE   |
| refresh_token | TEXT         | UNIQUE, NOT NULL                              |
| ip_address    | TEXT         |                                               |
| user_agent    | TEXT         |                                               |
| is_active     | BOOLEAN      | NOT NULL, default TRUE                        |
| expires_at    | TIMESTAMPTZ  | NOT NULL                                      |
| last_used_at  | TIMESTAMPTZ  | NOT NULL                                      |
| created_at    | TIMESTAMPTZ  | NOT NULL                                      |

---

### 12. notifications
| Column         | Type         | Constraints                                                                                      |
|----------------|--------------|--------------------------------------------------------------------------------------------------|
| id             | UUID         | PK                                                                                               |
| user_id        | UUID         | FK → users(id), NOT NULL, ON DELETE CASCADE                                                      |
| title          | TEXT         | NOT NULL                                                                                         |
| message        | TEXT         | NOT NULL                                                                                         |
| type           | TEXT         | NOT NULL, CHECK (ticket_update, ticket_assigned, ticket_resolved, system, announcement)          |
| reference_type | TEXT         |                                                                                                  |
| reference_id   | UUID         |                                                                                                  |
| is_read        | BOOLEAN      | NOT NULL, default FALSE                                                                          |
| read_at        | TIMESTAMPTZ  |                                                                                                  |
| created_at     | TIMESTAMPTZ  | NOT NULL                                                                                         |

---

## Relationships Summary

| # | Relationship                        | Type         | FK Column     | References          | ON DELETE |
|---|-------------------------------------|--------------|---------------|---------------------|-----------|
| 1 | student_profiles → users            | One-to-One   | user_id       | users(id)           | CASCADE   |
| 2 | staff_profiles → users              | One-to-One   | user_id       | users(id)           | CASCADE   |
| 3 | tickets → users (creator)           | Many-to-One  | user_id       | users(id)           | CASCADE   |
| 4 | tickets → users (assignee)          | Many-to-One  | assigned_to   | users(id)           | SET NULL  |
| 5 | ticket_comments → tickets           | Many-to-One  | ticket_id     | tickets(id)         | CASCADE   |
| 6 | ticket_comments → users             | Many-to-One  | user_id       | users(id)           | CASCADE   |
| 7 | ticket_attachments → tickets        | Many-to-One  | ticket_id     | tickets(id)         | CASCADE   |
| 8 | ticket_attachments → users          | Many-to-One  | uploaded_by   | users(id)           | CASCADE   |
| 9 | kb_articles → kb_categories         | Many-to-One  | category_id   | kb_categories(id)   | CASCADE   |
| 10| kb_articles → users (author)        | Many-to-One  | author_id     | users(id)           | SET NULL  |
| 11| chat_sessions → users              | Many-to-One  | user_id       | users(id)           | CASCADE   |
| 12| chat_messages → chat_sessions      | Many-to-One  | session_id    | chat_sessions(id)   | CASCADE   |
| 13| sessions → users                   | Many-to-One  | user_id       | users(id)           | CASCADE   |
| 14| notifications → users              | Many-to-One  | user_id       | users(id)           | CASCADE   |

---

## Cardinality for ER Diagram

```
users ──||──o|── student_profiles      (1:1, optional)
users ──||──o|── staff_profiles        (1:1, optional)
users ──||──o<── tickets               (1:N, as creator)
users ──||──o<── tickets               (1:N, as assignee, optional)
users ──||──o<── ticket_comments       (1:N)
users ──||──o<── ticket_attachments    (1:N, as uploader)
users ──||──o<── kb_articles           (1:N, as author, optional)
users ──||──o<── chat_sessions         (1:N)
users ──||──o<── sessions              (1:N)
users ──||──o<── notifications         (1:N)
tickets ─||──o<── ticket_comments      (1:N)
tickets ─||──o<── ticket_attachments   (1:N)
kb_categories ─||──o<── kb_articles    (1:N)
chat_sessions ─||──o<── chat_messages  (1:N)
```
