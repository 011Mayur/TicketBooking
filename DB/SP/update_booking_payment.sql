DROP PROCEDURE IF EXISTS update_booking_payment;
DELIMITER //
CREATE PROCEDURE update_booking_payment(
    IN p_user_id INT,
    IN p_booking_id INT,
    IN p_razorpay_order_id VARCHAR(255),
    IN p_razorpay_payment_id VARCHAR(255),
    IN p_status VARCHAR(50),
    IN p_updated_at DATETIME
)
BEGIN
    UPDATE bookings
    SET
        razorpay_payment_id = p_razorpay_payment_id,
        razorpay_order_id = p_razorpay_order_id,
        status = p_status,
        updated_at = p_updated_at
    WHERE id = p_booking_id AND user_id = p_user_id;
END //
DELIMITER ;