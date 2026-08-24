DROP PROCEDURE IF EXISTS get_active_locks_by_event_id;
DELIMITER //
CREATE PROCEDURE get_active_locks_by_event_id(
    IN p_event_id INT
)
BEGIN
    SELECT 
        id, event_id, user_id, quantity, razorpay_order_id, expires_at, created_at
    FROM booking_locks
    WHERE event_id = p_event_id 
        AND expires_at > UTC_TIMESTAMP()
    ORDER BY created_at DESC;
END //
DELIMITER ;