drop procedure if exists get_event_type_by_id;
delimiter //
CREATE PROCEDURE get_event_type_by_id(IN p_id INT)
BEGIN
SELECT id, name, is_active, created_at 
FROM event_types 
WHERE id = p_id AND is_active = TRUE;
END //

delimiter ;