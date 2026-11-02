PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  github_id TEXT UNIQUE,
  email TEXT,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);
INSERT INTO roles (id, code, name) VALUES
 ('role_admin','admin','Quản trị viên'),
 ('role_manager','manager','Quản lý'),
 ('role_member','member','Thành viên'),
 ('role_viewer','viewer','Chỉ xem');

CREATE TABLE user_roles (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles(id),
  PRIMARY KEY(user_id, role_id)
);

CREATE TABLE sessions (
  id_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  objective TEXT,
  owner_id TEXT REFERENCES users(id),
  start_date TEXT,
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned','active','paused','completed','cancelled')),
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  project_id TEXT REFERENCES projects(id),
  category_id TEXT REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  received_date TEXT,
  start_date TEXT,
  due_date TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo','in_progress','waiting','paused','completed')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100),
  outcome TEXT,
  notes TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  deleted_at TEXT
);

CREATE TABLE task_assignees (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  assignment_type TEXT NOT NULL CHECK(assignment_type IN ('owner','collaborator')),
  PRIMARY KEY(task_id, user_id, assignment_type)
);

CREATE TABLE task_dependencies (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  PRIMARY KEY(task_id, depends_on_task_id),
  CHECK(task_id <> depends_on_task_id)
);

CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  document_number TEXT,
  issued_date TEXT,
  issuing_agency TEXT,
  received_date TEXT,
  url TEXT NOT NULL,
  description TEXT,
  processing_status TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_documents (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  PRIMARY KEY(task_id, document_id)
);

CREATE TABLE activity_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT REFERENCES users(id),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  changes_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_status_due ON tasks(status, due_date);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_updated ON tasks(updated_at DESC);
CREATE INDEX idx_activity_entity ON activity_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_sessions_user_expiry ON sessions(user_id, expires_at);
