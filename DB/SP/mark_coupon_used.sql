DROP PROCEDURE IF EXISTS mark_coupon_used;
DELIMITER //

CREATE PROCEDURE mark_coupon_used(
IN p_booking_id INT,
IN p_used_at DATETIME
)
BEGIN
DECLARE v_coupon_id INT;
DECLARE v_user_id INT;

    SELECT coupon_id, user_id
    INTO v_coupon_id, v_user_id
    FROM bookings
    WHERE id = p_booking_id;

   
IF v_coupon_id IS NOT NULL THEN
 INSERT INTO coupon_usages(coupon_id, user_id, used_at)
 VALUES(v_coupon_id,v_user_id,p_used_at);
 END IF;
END //

DELIMITER ;

select * from bookings where final_amount is not null

select * from coupon_usages