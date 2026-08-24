DROP PROCEDURE IF EXISTS update_event;
DELIMITER // 
CREATE PROCEDURE update_event(
IN p_id INT, IN p_title VARCHAR(200), IN p_artist_name VARCHAR(150), IN p_venue VARCHAR(200),
IN p_event_date DATE, IN p_event_time TIME, IN p_ticket_price DECIMAL(10,2), IN p_total_seats INT,
IN p_bulk_ticket_for_discount INT,IN p_discount_percentage INT,
IN p_poster_image_url LONGTEXT,
IN p_event_category_id INT,
IN p_description VARCHAR(300)
)
BEGIN
DECLARE v_total INT;
DECLARE v_available INT;

SELECT total_seats, available_seats
INTO v_total, v_available
FROM events
WHERE id = p_id;

IF p_total_seats < (v_total - v_available) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Total seats cannot be less than booked seats';
END IF;

UPDATE events
SET title = p_title, artist_name = p_artist_name, venue = p_venue,
event_date = p_event_date, event_time = p_event_time,
ticket_price = p_ticket_price, total_seats = p_total_seats,
bulk_ticket_for_discount = p_bulk_ticket_for_discount,
discount_percentage = p_discount_percentage,
 available_seats = v_available + (p_total_seats - v_total),
 poster_image_url = p_poster_image_url,
 event_category_id = p_event_category_id,
 description = p_description
WHERE id = p_id;

END //

DELIMITER ;

describe events
select * from events

