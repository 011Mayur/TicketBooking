drop procedure if exists get_all_event_types;
delimiter //
CREATE PROCEDURE get_all_event_types()
BEGIN
SELECT 
et.id,
et.name,
COUNT(DISTINCT ec.id) as category_count,
et.created_at
FROM event_types et
LEFT JOIN event_categories ec ON et.id = ec.event_type_id AND ec.is_active = TRUE
WHERE et.is_active = TRUE
GROUP BY et.id, et.name, et.created_at
ORDER BY et.created_at DESC;
END //

delimiter ;