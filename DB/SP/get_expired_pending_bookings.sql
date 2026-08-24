DROP PROCEDURE IF EXISTS get_expired_pending_bookings;
DELIMITER //

CREATE PROCEDURE get_expired_pending_bookings(
    IN p_status VARCHAR(50),
    IN p_now DATETIME
)
BEGIN

SELECT
	id,
	user_id,
	event_id,
	event_title,
	quantity,
	unit_price,
	sub_total,
	bulk_discount_percentage,
	bulk_discount_amount,
	final_amount,
	status,
	expires_at,
	created_at,
	coupon_code,
	coupon_discount_percentage,
	coupon_discount_amount,
	discount_type
FROM bookings
WHERE status = p_status
AND expires_at < p_now;

END //

DELIMITER ;