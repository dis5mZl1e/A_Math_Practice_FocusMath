CREATE DATABASE IF NOT EXISTS focusmath
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE focusmath;

CREATE TABLE IF NOT EXISTS subjects (
  code VARCHAR(32) PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  color VARCHAR(24) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS questions (
  question_key VARCHAR(220) PRIMARY KEY,
  id VARCHAR(128) NOT NULL,
  subject_code VARCHAR(32) NOT NULL,
  difficulty TINYINT NOT NULL DEFAULT 5,
  q_type ENUM('choice','fill') NOT NULL DEFAULT 'choice',
  question_text LONGTEXT NOT NULL,
  options_json JSON NULL,
  answer_text TEXT NOT NULL,
  explanation LONGTEXT NULL,
  source_type VARCHAR(64) NOT NULL DEFAULT 'default',
  source_label VARCHAR(128) NULL,
  is_imported TINYINT(1) NOT NULL DEFAULT 0,
  meta_json JSON NULL,
  search_text LONGTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_subject_id (subject_code, id),
  KEY idx_subject_type_difficulty (subject_code, q_type, difficulty),
  KEY idx_subject_imported (subject_code, is_imported),
  KEY idx_subject_source (subject_code, source_type),
  FULLTEXT KEY ft_question (question_text, explanation, search_text),
  CONSTRAINT fk_questions_subject FOREIGN KEY (subject_code) REFERENCES subjects(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS topics (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  subject_code VARCHAR(32) NOT NULL,
  name VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_topic (subject_code, name),
  CONSTRAINT fk_topics_subject FOREIGN KEY (subject_code) REFERENCES subjects(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS question_topics (
  question_key VARCHAR(220) NOT NULL,
  topic_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (question_key, topic_id),
  KEY idx_topic_question (topic_id, question_key),
  CONSTRAINT fk_qt_question FOREIGN KEY (question_key) REFERENCES questions(question_key) ON DELETE CASCADE,
  CONSTRAINT fk_qt_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS keywords (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  subject_code VARCHAR(32) NOT NULL,
  word VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_keyword (subject_code, word),
  CONSTRAINT fk_keywords_subject FOREIGN KEY (subject_code) REFERENCES subjects(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS question_keywords (
  question_key VARCHAR(220) NOT NULL,
  keyword_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (question_key, keyword_id),
  KEY idx_keyword_question (keyword_id, question_key),
  CONSTRAINT fk_qk_question FOREIGN KEY (question_key) REFERENCES questions(question_key) ON DELETE CASCADE,
  CONSTRAINT fk_qk_keyword FOREIGN KEY (keyword_id) REFERENCES keywords(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS question_sources (
  question_key VARCHAR(220) NOT NULL PRIMARY KEY,
  source_type VARCHAR(64) NOT NULL DEFAULT 'default',
  source_label VARCHAR(128) NULL,
  CONSTRAINT fk_qs_question FOREIGN KEY (question_key) REFERENCES questions(question_key) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS import_batches (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  source_type VARCHAR(64) NOT NULL,
  source_label VARCHAR(128) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS app_meta (
  meta_key VARCHAR(80) PRIMARY KEY,
  meta_value TEXT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
