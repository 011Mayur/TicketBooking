DROP PROCEDURE IF EXISTS delete_lock_by_order_id;
DELIMITER //
CREATE PROCEDURE delete_lock_by_order_id(
    IN p_razorpay_order_id VARCHAR(100),
    OUT p_deleted BOOLEAN
)
BEGIN
    DELETE FROM booking_locks 
    WHERE razorpay_order_id = p_razorpay_order_id;
    
    SET p_deleted = (ROW_COUNT() > 0);
END //
DELIMITER ;