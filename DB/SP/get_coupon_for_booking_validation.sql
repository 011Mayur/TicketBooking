DROP PROCEDURE IF EXISTS get_coupon_for_booking_validation;
DELIMITER //
CREATE PROCEDURE get_coupon_for_booking_validation(
IN p_code VARCHAR(50),
IN p_event_id INT,
IN p_user_id INT
)
BEGIN
SELECT
c.id AS id,
c.code AS code,
c.discount_percentage AS discount_percentage,
c.expiry_date AS expiry_date,
c.is_active AS is_active,
EXISTS (
SELECT 1 FROM event_coupon_codes ecc
WHERE ecc.coupon_id = c.id AND ecc.event_id = p_event_id
) AS is_linked_to_event,
EXISTS (
SELECT 1 FROM coupon_usages cu
WHERE cu.coupon_id = c.Id AND cu.user_id = p_user_id
) AS already_used_by_user
FROM coupons c
WHERE c.code = p_code;
END //

DELIMITER ;

select * from coupon_usages