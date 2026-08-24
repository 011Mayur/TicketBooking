DROP PROCEDURE IF EXISTS get_booking_by_order_id
DELIMITER //

CREATE PROCEDURE get_booking_by_order_id(
    IN p_razorpay_order_id VARCHAR(255)
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
WHERE razorpay_order_id = p_razorpay_order_id;

END //

DELIMITER ;