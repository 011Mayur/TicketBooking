DELIMITER //

CREATE PROCEDURE ticketmanagement.search_events(
IN p_search_query VARCHAR(255),
IN p_page INT
)
BEGIN
DECLARE v_page_size INT DEFAULT 4;
DECLARE v_offset INT;
SET v_offset = (p_page - 1) * v_page_size;
SELECT 
id,
title,
event_date,
venue,
poster_image_url
FROM events
WHERE 
(LOWER(title) LIKE CONCAT('%', LOWER(p_search_query), '%')
OR LOWER(venue) LIKE CONCAT('%', LOWER(p_search_query), '%'))
AND event_date >= NOW()
AND is_active = 1
ORDER BY event_date DESC
LIMIT v_page_size OFFSET v_offset;
END //

DELIMITER ;
use  ticketmanagement
select * from events;
drop procedure search_events