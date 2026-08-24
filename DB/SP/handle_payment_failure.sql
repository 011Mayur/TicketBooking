DROP PROCEDURE IF EXISTS handle_payment_failure;
DELIMITER //

CREATE PROCEDURE handle_payment_failure(
IN p_razorpay_order_id VARCHAR(255),
IN p_failure_reason VARCHAR(500),
IN p_updated_at DATETIME
)
BEGIN

DECLARE v_event_id INT;
DECLARE v_quantity INT;


DECLARE EXIT HANDLER FOR SQLEXCEPTION
BEGIN
 ROLLBACK;
 RESIGNAL;
END;

START TRANSACTION;

SELECT event_id, quantity
INTO v_event_id, v_quantity
FROM bookings
WHERE razorpay_order_id = p_razorpay_order_id
FOR UPDATE;

UPDATE events
SET available_seats = available_seats + v_quantity
WHERE id = v_event_id;

UPDATE bookings
SET
status = 'Failed',
payment_failure_reason = p_failure_reason,
updated_at = p_updated_at
WHERE razorpay_order_id = p_razorpay_order_id;

COMMIT;

END //

DELIMITER ;