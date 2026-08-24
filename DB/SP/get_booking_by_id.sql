DROP PROCEDURE IF EXISTS get_booking_by_id;
DELIMITER //
CREATE PROCEDURE get_booking_by_id(
IN p_id INT
)
BEGIN
SELECT
b.id AS id,
b.user_id AS user_id,
b.event_id AS event_id,
e.title AS event_title,
b.quantity AS quantity,
b.unit_price AS unit_price,
b.sub_total AS sub_total,
b.bulk_discount_percentage AS bulk_discount_percentage,
b.bulk_discount_amount AS bulk_discount_amount,
b.coupon_code AS coupon_code,
b.coupon_discount_percentage AS coupon_discount_percentage,
b.coupon_discount_amount AS coupon_discount_amount,
b.final_amount AS final_amount,
b.status AS status,
b.expires_at AS expires_at,
b.created_at AS created_at,
b.discount_type AS discount_type
FROM bookings b
JOIN events e ON e.id = b.event_id
WHERE b.id = p_id;
END //

DELIMITER ;

select * from bookings