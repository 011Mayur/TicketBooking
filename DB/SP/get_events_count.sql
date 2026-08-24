DROP PROCEDURE IF EXISTS get_events_count;
DELIMITER //
CREATE PROCEDURE get_events_count(IN p_event_category_id INT)
BEGIN
  
        SELECT COUNT(*) AS total FROM events WHERE is_active = TRUE  AND event_date >= NOW() AND event_category_id = p_event_category_id;
 
END //

DELIMITER ;

use ticketmanagement

select * from event_categories

SELECT NOW()