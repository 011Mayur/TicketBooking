
DROP PROCEDURE IF EXISTS create_coupon
DELIMITER //

CREATE PROCEDURE create_coupon(
    IN p_code VARCHAR(30), IN p_discount_percentage DECIMAL(5,2),
    IN p_expiry_date DATETIME,IN p_is_active BOOLEAN,IN p_created_at DATETIME, OUT p_new_id INT
)
BEGIN
    INSERT INTO coupons (code, discount_percentage, expiry_date,is_active,created_at)
    VALUES (p_code, p_discount_percentage, p_expiry_date,p_is_active,p_created_at);
    SET p_new_id = LAST_INSERT_ID();
END //

DELIMITER ;