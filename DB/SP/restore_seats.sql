DROP PROCEDURE IF EXISTS restore_seats;
DELIMITER //

CREATE PROCEDURE restore_seats(
    IN p_event_id INT,
    IN p_quantity INT
)
BEGIN

    UPDATE events
    SET available_seats = available_seats + p_quantity
    WHERE id = p_event_id;

END //

DELIMITER ;