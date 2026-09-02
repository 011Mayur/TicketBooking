DROP PROCEDURE IF EXISTS create_booking_lock;
DELIMITER //

CREATE PROCEDURE create_booking_lock(
    IN p_event_id INT,
    IN p_user_id INT,
    IN p_quantity INT,
    IN p_razorpay_order_id VARCHAR(255),
    IN p_expires_at DATETIME,
    IN p_unit_price DECIMAL(10,2),
    IN p_sub_total DECIMAL(10,2),
    IN p_bulk_discount_percentage DECIMAL(5,2),
    IN p_bulk_discount_amount DECIMAL(10,2),
    IN p_coupon_id INT,
    IN p_coupon_code VARCHAR(50),
    IN p_coupon_discount_percentage DECIMAL(5,2),
    IN p_coupon_discount_amount DECIMAL(10,2),
    IN p_final_amount DECIMAL(10,2),
    IN p_discount_type VARCHAR(50),
    OUT p_new_id INT
)
BEGIN
    DECLARE v_available_seats INT;
    DECLARE v_total_locked INT;

    -- Start transaction to ensure atomicity
    START TRANSACTION;

    -- Get total seats for the event (Pessimistic Lock using FOR UPDATE to block concurrent checkouts)
    SELECT available_seats INTO v_available_seats 
    FROM events 
    WHERE id = p_event_id 
    FOR UPDATE;

    -- Get currently locked seats (excluding expired)
    SELECT COALESCE(SUM(quantity), 0) INTO v_total_locked 
    FROM booking_locks 
    WHERE event_id = p_event_id 
      AND expires_at > UTC_TIMESTAMP();

    -- Check if enough seats remain
    IF (v_available_seats - v_total_locked) >= p_quantity THEN
        -- Sufficient seats available, create the lock
        INSERT INTO booking_locks (
            event_id, user_id, quantity, razorpay_order_id, expires_at, created_at,
            unit_price, sub_total, bulk_discount_percentage, bulk_discount_amount,
            coupon_id, coupon_code, coupon_discount_percentage, coupon_discount_amount,
            final_amount, discount_type
        ) VALUES (
            p_event_id, p_user_id, p_quantity, p_razorpay_order_id, p_expires_at, UTC_TIMESTAMP(),
            p_unit_price, p_sub_total, p_bulk_discount_percentage, p_bulk_discount_amount,
            p_coupon_id, p_coupon_code, p_coupon_discount_percentage, p_coupon_discount_amount,
            p_final_amount, p_discount_type
        );
        
        SET p_new_id = LAST_INSERT_ID();
        COMMIT;
    ELSE
        -- Not enough seats left! Rollback and throw exception
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Not enough seats available';
    END IF;
END //

DELIMITER ;


select * from bookings
select * from events