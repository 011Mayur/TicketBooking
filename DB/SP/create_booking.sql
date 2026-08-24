DROP PROCEDURE IF EXISTS create_booking;
DELIMITER //

CREATE PROCEDURE create_booking(
IN p_user_id INT,
IN p_event_id INT,
IN p_quantity INT,
IN p_unit_price DECIMAL(10,2),
IN p_sub_total DECIMAL(10,2),
IN p_bulk_discount_percentage DECIMAL(5,2),
IN p_bulk_discount_amount DECIMAL(10,2),
IN p_coupon_id INT,
IN p_coupon_code VARCHAR(50),
IN p_coupon_discount_percentage DECIMAL(5,2),
IN p_coupon_discount_amount DECIMAL(10,2),
IN p_final_amount DECIMAL(10,2),
IN p_status VARCHAR(20),
IN p_expires_at DATETIME,
IN p_created_at DATETIME,
IN p_discount_type VARCHAR(20),
OUT p_new_id INT,
OUT p_seats_reserved BOOLEAN,
OUT p_coupon_reserved BOOLEAN)
BEGIN
DECLARE rows_updated INT;

DECLARE EXIT HANDLER FOR 1062
BEGIN
SET p_coupon_reserved = FALSE;
SET p_new_id = 0;
ROLLBACK;
END;

SET p_coupon_reserved = TRUE;

START TRANSACTION;

UPDATE events
SET available_seats = available_seats - p_quantity
WHERE Id = p_event_id AND available_seats >= p_quantity;

SET rows_updated = ROW_COUNT();

IF rows_updated = 0 THEN
SET p_seats_reserved = FALSE;
SET p_new_id = 0;
ROLLBACK;
ELSE
SET p_seats_reserved = TRUE;

INSERT INTO bookings (
user_id, event_id, quantity, unit_price, sub_total,
bulk_discount_percentage, bulk_discount_amount,
coupon_id, coupon_code, coupon_discount_percentage, coupon_discount_amount,
final_amount, status, expires_at, is_active, created_at,discount_type
) VALUES (
p_user_id, p_event_id, p_quantity, p_unit_price, p_sub_total,
p_bulk_discount_percentage, p_bulk_discount_amount,
p_coupon_id, p_coupon_code, p_coupon_discount_percentage, p_coupon_discount_amount,
p_final_amount, p_status, p_expires_at, TRUE, p_created_at,p_discount_type
);

SET p_new_id = LAST_INSERT_ID();



COMMIT;
END IF;
END //

DELIMITER ;

select * from bookings