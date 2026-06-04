-- ============================================================
--  RUN THIS if you already imported database.sql and
--  are getting "Invalid credentials" on admin login.
--
--  This resets the admin password to plain text 'admin123'.
--  admin_auth.php will auto-upgrade it to bcrypt on first login.
-- ============================================================

USE nestfind;

-- Reset password to plain text (works on all PHP versions)
UPDATE admins SET password = 'admin123' WHERE username = 'admin';

-- If the admin row doesn't exist yet, insert it:
INSERT INTO admins (username, email, password)
VALUES ('admin', 'admin@nestfind.com', 'admin123')
ON DUPLICATE KEY UPDATE password = 'admin123';

-- Verify:
SELECT id, username, email, password FROM admins;
