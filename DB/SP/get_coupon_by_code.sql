DROP PROCEDURE IF EXISTS get_coupon_by_id
DELIMITER //
CREATE PROCEDURE get_coupon_by_id(IN p_id INT)
BEGIN
    SELECT * FROM coupons WHERE id = p_id AND is_active = TRUE;
END //

DELIMITER ;

SELECT * from coupons
