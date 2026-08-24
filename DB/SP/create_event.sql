DROP PROCEDURE IF EXISTS TicketManagement.create_event;
DELIMITER //
CREATE PROCEDURE TicketManagement.create_event(
IN p_title VARCHAR(200), IN p_artist_name VARCHAR(150), IN p_venue VARCHAR(200),
IN p_event_date DATE, IN p_event_time TIME, IN p_ticket_price DECIMAL(10,2),
IN p_total_seats INT,IN p_is_active BOOLEAN,IN p_created_at DATETIME(6),IN p_bulk_ticket_for_discount INT,IN p_discount_percentage INT,
IN p_poster_image_url LONGTEXT,
IN p_event_category_id INT,
IN p_description VARCHAR(300),
OUT p_new_id INT
)
BEGIN
INSERT INTO events (title, artist_name, venue, event_date, event_time, ticket_price, total_seats, available_seats,is_active,
created_at,bulk_ticket_for_discount,discount_percentage,poster_image_url,event_category_id,description)
VALUES (p_title, p_artist_name, p_venue, p_event_date, p_event_time, p_ticket_price, p_total_seats,
 p_total_seats,p_is_active,p_created_at,p_bulk_ticket_for_discount,p_discount_percentage,p_poster_image_url,p_event_category_id,p_description);
SET p_new_id = LAST_INSERT_ID();
END //

DELIMITER ;


select * from events