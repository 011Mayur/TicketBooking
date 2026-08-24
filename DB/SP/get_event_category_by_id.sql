drop procedure if exists get_event_category_by_id;
delimiter //
CREATE PROCEDURE get_event_category_by_id(IN p_id INT)
BEGIN
    SELECT id, name, event_type_id, is_active, created_at
    FROM event_categories
    WHERE id = p_id AND is_active = TRUE;
end //

delimiter ;