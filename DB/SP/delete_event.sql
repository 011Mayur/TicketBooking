DROP PROCEDURE IF EXISTS delete_event 
DELIMITER //
CREATE PROCEDURE delete_event(IN p_id INT)
BEGIN
    UPDATE events SET is_active = FALSE WHERE id = p_id;
END //

DELIMITER ;