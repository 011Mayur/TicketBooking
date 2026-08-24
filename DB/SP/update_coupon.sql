DROP PROCEDURE IF EXISTS update_coupon
DELIMITER //
CREATE PROCEDURE update_coupon(
    IN p_id INT, IN p_code VARCHAR(30), IN p_discount_percentage DECIMAL(5,2),
    IN p_expiry_date DATETIME, IN p_is_active BOOLEAN
)
BEGIN
    UPDATE coupons
    SET code = p_code, discount_percentage = p_discount_percentage,
        expiry_date = p_expiry_date, is_active = p_is_active
    WHERE id = p_id;
END //

DELIMITER ;