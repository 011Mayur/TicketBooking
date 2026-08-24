DROP PROCEDURE IF EXISTS get_all_coupons
DELIMITER //
CREATE PROCEDURE get_all_coupons()
BEGIN
    SELECT * FROM coupons ORDER BY created_at DESC;
END //

DELIMITER ;

describe coupons
get_coupon_by_code
call get_all_coupons
sele