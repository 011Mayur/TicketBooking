DROP PROCEDURE IF EXISTS delete_refresh_token
DELIMITER //
CREATE PROCEDURE delete_refresh_token(
    IN p_token VARCHAR(500)
)
BEGIN
    DELETE FROM refresh_tokens
    WHERE token = p_token;
END //

DELIMITER ;