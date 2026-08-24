drop procedure if exists check_event_type_deletability;
delimiter //
CREATE PROCEDURE check_event_type_deletability(IN p_id INT, OUT p_category_count INT)
BEGIN
    SELECT COUNT(*) INTO p_category_count
    FROM event_categories
    WHERE event_type_id = p_id AND is_active = TRUE;
END //

delimiter ;