DROP PROCEDURE IF EXISTS get_lock_by_order_id;
DELIMITER //
CREATE PROCEDURE get_lock_by_order_id(IN p_razorpay_order_id VARCHAR(100))
BEGIN
    SELECT
        id, event_id, user_id, quantity, razorpay_order_id, expires_at, created_at,
        unit_price, sub_total, bulk_discount_percentage, bulk_discount_amount,
        coupon_id, coupon_code, coupon_discount_percentage, coupon_discount_amount,
        final_amount, discount_type
    FROM booking_locks
    WHERE razorpay_order_id = p_razorpay_order_id
        AND expires_at > UTC_TIMESTAMP()
    LIMIT 1;
END //
DELIMITER ;