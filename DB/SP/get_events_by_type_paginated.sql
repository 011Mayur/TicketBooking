DROP PROCEDURE IF EXISTS get_events_by_type_paginated;
DELIMITER //
CREATE PROCEDURE get_events_by_type_paginated(
IN p_type_id INT,
IN p_page INT
)
BEGIN
DECLARE v_page_size INT DEFAULT 4;
DECLARE v_offset INT;
SET v_offset = (p_page - 1) * v_page_size;

SELECT e.id, e.title, e.venue, e.event_date, e.poster_image_url
FROM events e
INNER JOIN event_categories ec ON ec.id = e.event_category_id
WHERE e.is_active = 1
AND e.event_date >= CURDATE()
AND (p_type_id IS NULL OR ec.event_type_id = p_type_id)
ORDER BY e.event_date ASC
LIMIT v_page_size OFFSET v_offset;

END //

DELIMITER ;
