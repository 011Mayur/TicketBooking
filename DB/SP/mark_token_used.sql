DROP PROCEDURE IF EXISTS mark_token_used;
DELIMITER //

CREATE PROCEDURE mark_token_used(IN p_token_hash VARCHAR(64))
BEGIN
    UPDATE pass_word_reset_tokens SET is_used = TRUE WHERE token_hash = p_token_hash;
END //

DELIMITER ;
