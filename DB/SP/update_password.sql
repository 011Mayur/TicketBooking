DROP PROCEDURE IF EXISTS update_password;
DELIMITER //
CREATE PROCEDURE update_password(IN p_user_id INT, IN p_password_hash LONGTEXT)
BEGIN
UPDATE users SET password_hash = p_password_hash WHERE id = p_user_id;
END //
DELIMITER ;

DESCRIBE users