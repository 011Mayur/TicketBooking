DROP PROCEDURE IF EXISTS get_latest_refresh_token
DELIMITER //
CREATE PROCEDURE get_latest_refresh_token(
    IN p_user_id INT
)
BEGIN
    SELECT id, user_id, token, expires_at, created_at
    FROM refresh_tokens
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 1;
END //

DELIMITER ;