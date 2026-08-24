DROP PROCEDURE IF EXISTS release_booking;
DELIMITER //
CREATE PROCEDURE release_booking(
    IN p_booking_id INT,
    OUT p_released BOOLEAN
)
BEGIN
DECLARE v_event_id INT;
DECLARE v_quantity INT;
DECLARE v_coupon_id INT;

START TRANSACTION;
UPDATE bookings
SET status = 'Cancelled', is_active = FALSE
WHERE Id = p_booking_id AND Status = 'Pending';

IF ROW_COUNT() = 1 THEN
SELECT event_id, quantity, coupon_id
INTO v_event_id, v_quantity, v_coupon_id
FROM bookings WHERE id = p_booking_id;

UPDATE events
SET available_seats = available_seats + v_quantity
WHERE Id = v_event_id;

IF v_coupon_id IS NOT NULL THEN
	DELETE FROM coupon_usages
	WHERE coupon_id = v_coupon_id AND booking_id = p_booking_id;
	END IF;

	SET p_released = TRUE;
ELSE
	SET p_released = FALSE;
    END IF;

    COMMIT;
END //
DELIMITER ;