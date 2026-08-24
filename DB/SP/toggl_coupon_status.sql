DROP PROCEDURE IF EXISTS toggl_coupon_status
DELIMITER //
CREATE PROCEDURE toggl_coupon_status(IN p_id INT)
BEGIN
    UPDATE coupons SET is_active = NOT is_active WHERE id = p_id;
END //

DELIMITER ;

select * from users;