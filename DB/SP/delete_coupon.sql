DROP PROCEDURE IF EXISTS delete_coupon
DELIMITER //
CREATE PROCEDURE delete_coupon(IN p_id INT)
BEGIN
    UPDATE coupons SET is_active = FALSE WHERE id = p_id;
END //

DELIMITER ;

select * from users;