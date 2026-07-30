DROP PROCEDURE IF EXISTS get_events_paged;
DELIMITER //
CREATE PROCEDURE get_events_paged(
    IN p_search VARCHAR(200),
    IN p_sort_column VARCHAR(50),
    IN p_sort_dir VARCHAR(4),
    IN p_page INT,
    IN p_page_size INT
)
BEGIN
    DECLARE v_offset INT;
    DECLARE v_sort_col VARCHAR(50);
    DECLARE v_sort_dir VARCHAR(4);

    SET v_offset = GREATEST((p_page - 1) * p_page_size, 0);

    SET v_sort_col = CASE p_sort_column
        WHEN 'title' THEN 'title'
        WHEN 'artistName' THEN 'artist_name'
        WHEN 'venue' THEN 'venue'
        WHEN 'eventDate' THEN 'event_date'
        WHEN 'ticketPrice' THEN 'ticket_price'
        WHEN 'totalSeats' THEN 'total_seats'
        ELSE 'event_date'
    END;

    SET v_sort_dir = IF(UPPER(p_sort_dir) = 'DESC', 'DESC', 'ASC');
    SET @search_param = CONCAT('%', IFNULL(p_search, ''), '%');

    SET @sql = CONCAT(
        'SELECT * FROM events WHERE is_active = TRUE',
        IF(p_search IS NOT NULL AND p_search != '',
           ' AND (title LIKE ? OR artist_name LIKE ? OR venue LIKE ?)', ''),
        ' ORDER BY ', v_sort_col, ' ', v_sort_dir,
        ' LIMIT ? OFFSET ?'
    );

    PREPARE stmt FROM @sql;
    SET @page_size = p_page_size;
    SET @offset = v_offset;

    IF p_search IS NOT NULL AND p_search != '' THEN
        EXECUTE stmt USING @search_param, @search_param, @search_param, @page_size, @offset;
    ELSE
        EXECUTE stmt USING @page_size, @offset;
    END IF;
    DEALLOCATE PREPARE stmt;
END //

DELIMITER ;