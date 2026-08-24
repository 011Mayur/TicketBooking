drop procedure if exists check_event_category_deletability;
delimiter //
CREATE PROCEDURE check_event_category_deletability(
    IN p_id INT,
    OUT p_active_count INT,
    OUT p_past_count INT
)
BEGIN
    SELECT 
        COUNT(CASE WHEN is_active = TRUE AND CONCAT(event_date, ' ', TIME_FORMAT(event_time, '%H:%i:%s')) > NOW() THEN 1 END),
        COUNT(CASE WHEN is_active = FALSE OR CONCAT(event_date, ' ', TIME_FORMAT(event_time, '%H:%i:%s')) <= NOW() THEN 1 END)
    INTO p_active_count, p_past_count
    FROM events
    WHERE event_category_id = p_id;
end //

delimiter ;