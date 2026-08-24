
DELIMITER //
DROP PROCEDURE IF EXISTS create_reset_token;
CREATE PROCEDURE create_reset_token(
IN p_user_id INT,
IN p_token_hash VARCHAR(64),
IN p_expires_at DATETIME,
IN p_created_at DATETIME
)
BEGIN
UPDATE pass_word_reset_tokens
SET is_used = TRUE
WHERE user_id = p_user_id AND is_used = FALSE;
INSERT INTO pass_word_reset_tokens (user_id, token_hash, expires_at,created_at)
VALUES (p_user_id, p_token_hash, p_expires_at,p_created_at);
END //
 
DELIMITER ;


describe pass_word_reset_tokens;

select * from pass_word_reset_tokens