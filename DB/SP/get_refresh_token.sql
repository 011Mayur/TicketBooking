DROP PROCEDURE IF EXISTS refresh
DELIMITER //
CREATE PROCEDURE get_refresh_token(
    IN p_token VARCHAR(500)
)
BEGIN
    SELECT id, user_id, token, expires_at, created_at
    FROM refresh_tokens
    WHERE token = p_token
    LIMIT 1;
END //

DELIMITER ;