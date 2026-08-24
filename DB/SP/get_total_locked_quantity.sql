DROP PROCEDURE IF EXISTS get_total_locked_quantity;
DELIMITER //
CREATE PROCEDURE get_total_locked_quantity(
    IN p_event_id INT,
    OUT p_total_quantity INT
)
BEGIN
    SELECT COALESCE(SUM(quantity), 0)
    INTO p_total_quantity
    FROM booking_locks
    WHERE event_id = p_event_id 
        AND expires_at > UTC_TIMESTAMP();
END //
DELIMITER ;
 