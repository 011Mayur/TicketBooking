DROP PROCEDURE IF EXISTS check_event_category_deletable;
DELIMITER //
CREATE PROCEDURE check_event_category_deletable(
IN p_event_category_id INT,
OUT p_can_delete BOOLEAN,
OUT p_active_event_count INT,
OUT p_past_event_count INT,
OUT p_reason VARCHAR(255)
)
BEGIN
SELECT COUNT(*) INTO p_active_event_count
FROM events
WHERE event_category_id = p_event_category_id 
AND is_active = TRUE 
AND CONCAT(event_date, ' ', TIME_FORMAT(event_time, '%H:%i:%s')) > NOW();

SELECT COUNT(*) INTO p_past_event_count
FROM events
WHERE event_category_id = p_event_category_id 
AND (is_active = FALSE OR CONCAT(event_date, ' ', TIME_FORMAT(event_time, '%H:%i:%s')) <= NOW());

IF p_active_event_count > 0 THEN
SET p_can_delete = FALSE;
SET p_reason = CONCAT(p_active_event_count, ' active/future events exist. Cannot delete.');
ELSE
SET p_can_delete = TRUE;
SET p_reason = 'Can be deleted';
END IF;
END //
DELIMITER ;