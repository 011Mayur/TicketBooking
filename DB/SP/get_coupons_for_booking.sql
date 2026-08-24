DROP PROCEDURE IF EXISTS TicketManagement.get_coupons_for_booking;
DELIMITER //
CREATE PROCEDURE TicketManagement.get_coupons_for_booking(IN p_event_id INT,IN p_user_id INT )
BEGIN
SELECT
    c.id,
    c.code,
    c.discount_percentage,
    EXISTS (
        SELECT 1
        FROM coupon_usages cu
        WHERE cu.coupon_id = c.id
          AND cu.user_id = p_user_id
    ) AS is_used
FROM coupons c
WHERE c.id IN (
    SELECT coupon_id
    FROM event_coupon_codes
    WHERE event_id = p_event_id
);
END //

DELIMITER ;


select * from coupons;
select * from event_coupon_codes  where event_id=1;
CALL get_coupons_for_booking(8,3)

select * from coupon_usages;