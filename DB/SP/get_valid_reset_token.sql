DROP PROCEDURE IF EXISTS get_valid_reset_token;
DELIMITER //

CREATE PROCEDURE get_valid_reset_token(IN p_token_hash VARCHAR(64))
BEGIN
SELECT user_id, expires_at, is_used
FROM pass_word_reset_tokens
WHERE token_hash = p_token_hash
LIMIT 1;
END //

DELIMITER ;