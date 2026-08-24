DELIMITER //
CREATE PROCEDURE ticketmanagement.check_search_next_page_exists(
IN p_search_query VARCHAR(255),
IN p_page INT
)
BEGIN
DECLARE v_page_size INT DEFAULT 4;
DECLARE v_offset INT;
    
SET v_offset = (p_page * v_page_size);
SELECT COUNT(*) as next_page_count
FROM events
WHERE (LOWER(title) LIKE CONCAT('%',LOWER(p_search_query),'%')
OR LOWER(venue) LIKE CONCAT('%',LOWER(p_search_query),'%'))
AND event_date >= NOW()
AND is_active = 1
HAVING COUNT(*) > v_offset;
END //

DELIMITER ;

drop procedure check_search_next_page_exists
