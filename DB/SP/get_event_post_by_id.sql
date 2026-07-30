DROP PROCEDURE IF EXISTS get_event_post_by_id
DELIMITER //
CREATE PROCEDURE get_event_poster_by_id(IN p_event_id INT)
BEGIN
 SELECT poster_image_url FROM events WHERE id = p_event_id;
END //

DELIMITER ;


