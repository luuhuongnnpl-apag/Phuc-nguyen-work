PRAGMA foreign_keys = ON;

CREATE TABLE schedules (
 id TEXT PRIMARY KEY,
 type TEXT NOT NULL CHECK(type IN ('teaching','meetings','study','invigilation','grading','research','other')),
 title TEXT NOT NULL, description TEXT, start_at TEXT NOT NULL, end_at TEXT, location TEXT,
 task_id TEXT REFERENCES tasks(id), owner_id TEXT NOT NULL REFERENCES users(id), created_by TEXT NOT NULL REFERENCES users(id),
 visibility TEXT NOT NULL DEFAULT 'private' CHECK(visibility IN ('private','shared')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, deleted_at TEXT
);
CREATE TABLE reminders (
 id TEXT PRIMARY KEY, task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, remind_at TEXT NOT NULL,
 channel TEXT NOT NULL DEFAULT 'in_app' CHECK(channel IN ('in_app','email')), sent_at TEXT, dismissed_at TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_schedules_start ON schedules(start_at);
CREATE INDEX idx_schedules_owner ON schedules(owner_id,start_at);
CREATE INDEX idx_reminders_due ON reminders(channel,remind_at,sent_at);
CREATE INDEX idx_reminders_user ON reminders(user_id,remind_at);
