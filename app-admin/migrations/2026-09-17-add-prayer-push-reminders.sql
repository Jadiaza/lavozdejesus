CREATE TABLE IF NOT EXISTS lvj_com_push_subscriptions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  endpoint_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  endpoint TEXT NOT NULL,
  public_key VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  auth_token VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  content_encoding VARCHAR(30) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL DEFAULT 'aes128gcm',
  device_token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  timezone VARCHAR(64) NOT NULL DEFAULT 'America/Bogota',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  last_test_at DATETIME NULL,
  last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_push_endpoint_hash (endpoint_hash),
  UNIQUE KEY uq_push_device_token_hash (device_token_hash),
  KEY idx_push_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lvj_com_prayer_reminders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  subscription_id BIGINT UNSIGNED NOT NULL,
  reminder_id VARCHAR(40) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  time_local TIME NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  last_sent_date DATE NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_push_prayer_reminder (subscription_id, reminder_id),
  KEY idx_prayer_reminder_due (enabled, time_local, last_sent_date),
  CONSTRAINT fk_prayer_reminder_subscription
    FOREIGN KEY (subscription_id) REFERENCES lvj_com_push_subscriptions(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
