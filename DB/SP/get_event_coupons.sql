DROP PROCEDURE IF EXISTS get_event_coupons;
DELIMITER //
CREATE PROCEDURE get_event_coupons(IN p_event_id INT)
BEGIN
    SELECT c.id, c.code, c.discount_percentage
    FROM coupons c
    INNER JOIN event_coupon_codes ecc ON c.id = ecc.coupon_id
    WHERE ecc.event_id = p_event_id;
END //
DELIMITER ;

select * from events

select * from 