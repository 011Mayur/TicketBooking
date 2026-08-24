DROP PROCEDURE IF EXISTS get_active_event_types;
DELIMITER //
CREATE PROCEDURE get_active_event_types()
BEGIN
SELECT id, name
FROM event_types
WHERE is_active = 1
ORDER BY name ASC;
END //

DELIMITER ;


