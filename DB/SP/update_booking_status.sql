DROP PROCEDURE IF EXISTS update_booking_status;
DELIMITER //

CREATE PROCEDURE update_booking_status (
    IN p_BookingId INT,
    IN p_Status VARCHAR(50)
)
BEGIN
       UPDATE bookings
    SET status = p_Status
    WHERE id = p_BookingId;


END //

DELIMITER ;
