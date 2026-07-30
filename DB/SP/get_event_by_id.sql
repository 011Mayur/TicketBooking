DROP PROCEDURE IF EXISTS get_event_by_id;
DELIMITER //
CREATE PROCEDURE get_event_by_id(IN p_id INT) 
BEGIN 
SELECT * FROM events WHERE id = p_id;
END //

DELIMITER ;

call get_event_coupons(8)