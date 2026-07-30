DROP PROCEDURE IF EXISTS get_active_coupons
DELIMITER //
CREATE PROCEDURE get_active_coupons()
BEGIN
    SELECT * FROM coupons WHERE is_active = true AND expiry_date > UTC_TIMESTAMP()  ORDER BY created_at DESC;
END //

DELIMITER ;