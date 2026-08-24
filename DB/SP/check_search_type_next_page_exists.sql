DROP PROCEDURE IF EXISTS check_search_type_next_page_exists;
DELIMITER //
CREATE PROCEDURE check_search_type_next_page_exists(
IN p_search_query VARCHAR(255),
IN p_type_id INT,
IN p_page INT
)
BEGIN
DECLARE v_page_size INT DEFAULT 4;
DECLARE v_offset INT;
SET v_offset = p_page * v_page_size;

SELECT COUNT(*) FROM (
SELECT e.id
FROM events e
INNER JOIN event_categories ec ON ec.id = e.event_category_id
WHERE e.is_active = 1
AND (p_type_id IS NULL OR ec.event_type_id = p_type_id)
AND (e.title LIKE CONCAT('%', p_search_query, '%')
OR e.venue LIKE CONCAT('%', p_search_query, '%'))
ORDER BY e.event_date ASC
LIMIT v_page_size OFFSET v_offset
) AS next_page;
END //
DELIMITER ;