DROP PROCEDURE IF EXISTS update_booking_razorpay_payment_id;
DELIMITER //

CREATE PROCEDURE update_booking_razorpay_payment_id (
    IN p_BookingId INT,
    IN p_RazorpayPaymentId VARCHAR(100)
)
BEGIN
    UPDATE Bookings
    SET razorpay_payment_id = p_RazorpayPaymentId
    WHERE id = p_BookingId;


END //

DELIMITER ;


