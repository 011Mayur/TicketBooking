drop procedure if exists get_categories_by_event_type;
delimiter //
CREATE PROCEDURE get_categories_by_event_type(IN p_event_type_id INT)
BEGIN
    SELECT 
        ec.id,
        ec.name,
        ec.event_type_id,
        ec.created_at
    FROM event_categories ec
    WHERE ec.event_type_id = p_event_type_id AND ec.is_active = TRUE
    ORDER BY ec.created_at DESC;
end //

delimiter ;