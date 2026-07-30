DROP PROCEDURE IF EXISTS create_refresh_token
DELIMITER //
CREATE PROCEDURE create_refresh_token(
IN p_user_id INT,
IN p_token VARCHAR(500),
IN p_expires_at DATETIME,
IN p_created_at DATETIME
)
BEGIN
INSERT INTO refresh_tokens (user_id, token, expires_at, created_at)
VALUES (p_user_id, p_token, p_expires_at, p_created_at);
END //

DELIMITER ;