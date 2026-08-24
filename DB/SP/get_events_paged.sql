DROP PROCEDURE IF EXISTS get_events_paged;
DELIMITER //
CREATE  PROCEDURE get_events_paged(
    IN p_sort_column VARCHAR(50),
    IN p_sort_dir VARCHAR(4),
    IN p_page INT,
    IN p_page_size INT,
    IN p_category_id INT
)
BEGIN
    DECLARE v_offset INT;
    DECLARE v_sort_col VARCHAR(50);
    DECLARE v_sort_dir VARCHAR(4);
    DECLARE v_category_id INT;

    SET v_offset = GREATEST((p_page - 1) * p_page_size, 0);
	SET v_category_id = p_category_id;
    SET v_sort_col = CASE p_sort_column
        WHEN 'title' THEN 'e.title'
        WHEN 'eventDate' THEN 'e.event_date'
        WHEN 'ticketPrice' THEN 'e.ticket_price'
        ELSE 'e.event_date'
    END;

    SET v_sort_dir = IF(UPPER(p_sort_dir) = 'DESC', 'DESC', 'ASC');

    SET @sql = CONCAT(
        'SELECT e.id,e.title,e.artist_name,e.venue,e.event_date,e.event_time,e.ticket_price,e.total_seats,e.available_seats,e.is_active,
e.created_at,e.updated_at,e.bulk_ticket_for_discount,e.discount_percentage, e.poster_image_url, e.event_category_id,ec.event_type_id,e.description

 FROM events e inner join event_categories ec on e.event_category_id = ec.id WHERE e.event_category_id = ? AND  e.is_active = TRUE AND e.event_date >= NOW()',
        ' ORDER BY ', v_sort_col, ' ', v_sort_dir,
        ' LIMIT ? OFFSET ?'
    );

    PREPARE stmt FROM @sql;
    SET @page_size = p_page_size;
    SET @offset = v_offset;
    SET @v_category_id =v_category_id;
    EXECUTE stmt USING @v_category_id, @page_size, @offset;
    DEALLOCATE PREPARE stmt;
END //

DELIMITER ;

SELECT * FROM coupons
SELECT * FROM EVENTS
SELECT * FROM event_coupon_codes