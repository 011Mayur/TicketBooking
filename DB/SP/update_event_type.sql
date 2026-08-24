drop procedure if exists update_event_type;
delimiter //
CREATE PROCEDURE update_event_type(IN p_id INT, IN p_name VARCHAR(255), OUT p_affected INT)
BEGIN
    UPDATE event_types 
    SET name = p_name, updated_at = NOW()
    WHERE id = p_id AND is_active = TRUE;
    SET p_affected = ROW_COUNT();
END //

delimiter ;