-- ============================================================
--  ForgeBoard – Platforma za kolekcije i sesije društvenih igara
--  DB_Upiti.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS forgeboard
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE forgeboard;

-- ------------------------------------------------------------
-- 1. KORISNICI
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)   NOT NULL UNIQUE,
  full_name     VARCHAR(100)  NOT NULL,
  email         VARCHAR(120)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('player','admin') DEFAULT 'player',
  profile_image LONGTEXT      NULL,
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 2. MEHANIKE (zasebna tabela – M:N sa igrama)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mechanics (
  id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE
);

-- ------------------------------------------------------------
-- 3. IGRE (globalni katalog)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS games (
  id           INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(120)  NOT NULL,
  description  TEXT          NULL,
  cover_image  LONGTEXT      NULL,
  min_players  INT UNSIGNED  NOT NULL DEFAULT 1,
  max_players  INT UNSIGNED  NOT NULL DEFAULT 4,
  duration_min INT UNSIGNED  NOT NULL DEFAULT 30,
  weight       DECIMAL(3,1)  NOT NULL DEFAULT 2.0,
  year         SMALLINT UNSIGNED NOT NULL,
  publisher    VARCHAR(100)  NOT NULL,
  created_at   DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_players  CHECK (max_players >= min_players AND min_players >= 1),
  CONSTRAINT chk_weight   CHECK (weight >= 1.0 AND weight <= 5.0),
  CONSTRAINT chk_duration CHECK (duration_min >= 5),
  CONSTRAINT chk_year     CHECK (year >= 1900 AND year <= 2100)
);

-- ------------------------------------------------------------
-- M:N 1 – Igre ↔ Mehanike
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS game_mechanics (
  game_id     INT UNSIGNED NOT NULL,
  mechanic_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (game_id, mechanic_id),
  FOREIGN KEY (game_id)     REFERENCES games(id)     ON DELETE CASCADE,
  FOREIGN KEY (mechanic_id) REFERENCES mechanics(id) ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- M:N 2 – Korisnici ↔ Igre (lična kolekcija)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_games (
  user_id         INT UNSIGNED  NOT NULL,
  game_id         INT UNSIGNED  NOT NULL,
  status          ENUM('owned','wishlist','previously_owned') NOT NULL DEFAULT 'owned',
  personal_rating TINYINT UNSIGNED NULL,
  notes           TEXT          NULL,
  added_at        DATETIME      DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, game_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  CONSTRAINT chk_rating CHECK (personal_rating IS NULL OR (personal_rating >= 1 AND personal_rating <= 10))
);

-- ------------------------------------------------------------
-- 4. SESIJE IGRANJA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  game_id      INT UNSIGNED NOT NULL,
  creator_id   INT UNSIGNED NOT NULL,
  played_at    DATE         NOT NULL,
  duration_min INT UNSIGNED NOT NULL DEFAULT 60,
  notes        TEXT         NULL,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id)    REFERENCES games(id)  ON DELETE RESTRICT,
  FOREIGN KEY (creator_id) REFERENCES users(id)  ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- M:N 3 – Korisnici ↔ Sesije igranja
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_players (
  session_id INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  score      INT          NULL,
  winner     TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (session_id, user_id),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 5. RECENZIJE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  game_id    INT UNSIGNED NOT NULL,
  title      VARCHAR(150) NOT NULL,
  body       TEXT         NOT NULL,
  rating     TINYINT UNSIGNED NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_game (user_id, game_id),
  FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES games(id)  ON DELETE CASCADE,
  CONSTRAINT chk_review_rating CHECK (rating >= 1 AND rating <= 10)
);

-- ------------------------------------------------------------
-- 6. AUDIT LOG
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NULL,
  action     VARCHAR(80)  NOT NULL,
  entity     VARCHAR(40)  NULL,
  entity_id  INT UNSIGNED NULL,
  meta       TEXT         NULL,
  ip_address VARCHAR(45)  NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- SEED – podrazumevane mehanike
-- ------------------------------------------------------------
INSERT IGNORE INTO mechanics (name) VALUES
  ('Worker Placement'),
  ('Deck Building'),
  ('Area Control'),
  ('Dice Rolling'),
  ('Cooperative'),
  ('Engine Building'),
  ('Trading'),
  ('Auction/Bidding'),
  ('Push Your Luck'),
  ('Set Collection');