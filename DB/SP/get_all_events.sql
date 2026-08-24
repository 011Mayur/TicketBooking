DROP PROCEDURE IF EXISTS get_all_events
DELIMITER //
CREATE PROCEDURE get_all_events(IN p_page INT)
BEGIN
  DECLARE v_offset INT;

    SET v_offset = (p_page - 1) * 4;
SELECT id,title, venue, event_date, poster_image_url FROM events where event_date >= NOW()
AND is_active = 1 ORDER BY event_date DESC  LIMIT 4 OFFSET v_offset;
END // 

DELIMITER ;

SELECT * FROM events;

call get_all_events(2);
drop procedure get_all_events
