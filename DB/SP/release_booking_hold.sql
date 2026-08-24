DROP PROCEDURE IF EXISTS release_booking_hold;
DELIMITER //
CREATE PROCEDURE release_booking_hold(
    IN p_booking_id INT,
    IN p_status VARCHAR(20),
    OUT p_released BOOLEAN
)
BEGIN
DECLARE v_event_id INT;
DECLARE v_quantity INT;

START TRANSACTION;

SELECT event_id, quantity
INTO v_event_id, v_quantity
FROM bookings 
WHERE id = p_booking_id AND Status = 'Pending';

IF ROW_COUNT() = 1 THEN
    
    UPDATE bookings
    SET status = p_status, IsActive = FALSE
    WHERE id = p_booking_id;
    
    -- Release seats
    UPDATE events
    SET available_seats = available_seats + v_quantity
    WHERE id = v_event_id;
    
    SET p_released = TRUE;
ELSE
    SET p_released = FALSE;
END IF;

COMMIT;
END //
DELIMITER ;

select * from bookings