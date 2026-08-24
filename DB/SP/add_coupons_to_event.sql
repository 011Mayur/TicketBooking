DROP PROCEDURE IF EXISTS add_coupons_to_event
DELIMITER //
CREATE PROCEDURE add_coupons_to_event(
IN p_event_id INT,
IN p_coupon_ids JSON
)
BEGIN
DECLARE EXIT HANDLER FOR SQLEXCEPTION
BEGIN
ROLLBACK;
RESIGNAL;
END;
    
START TRANSACTION;
    
IF NOT EXISTS (SELECT 1 FROM events WHERE id = p_event_id) THEN
SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Event not found';
END IF;
    
   
INSERT INTO event_coupon_codes (event_id, coupon_id)
SELECT p_event_id, coupon_id
FROM JSON_TABLE(
p_coupon_ids,
'$[*]' COLUMNS (coupon_id INT PATH '$')
) jt;
    
    COMMIT;
END //

DELIMITER ;

describe event_coupon_codes