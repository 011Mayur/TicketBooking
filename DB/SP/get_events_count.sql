DROP PROCEDURE IF EXISTS get_events_count;
DELIMITER //
CREATE PROCEDURE get_events_count(IN p_search VARCHAR(200))
BEGIN
    SET @search_param = CONCAT('%', IFNULL(p_search, ''), '%');
    IF p_search IS NOT NULL AND p_search != '' THEN
        SELECT COUNT(*) AS total FROM events
        WHERE is_active = TRUE AND (title LIKE @search_param OR artist_name LIKE @search_param OR venue LIKE @search_param);
    ELSE
        SELECT COUNT(*) AS total FROM events WHERE is_active = TRUE;
    END IF;
END //

DELIMITER ;