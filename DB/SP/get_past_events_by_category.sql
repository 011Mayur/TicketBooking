drop procedure if exists get_past_events_by_category;
delimiter //
CREATE PROCEDURE get_past_events_by_category(IN p_category_id INT)
BEGIN
    SELECT 
        id,
        title,
        artist_name,
        venue,
        event_date,
        event_time,
        ticket_price,
        total_seats,
        available_seats,
        is_active,
        updated_at
    FROM events
    WHERE event_category_id = p_category_id 
      AND (is_active = FALSE OR CONCAT(event_date, ' ', TIME_FORMAT(event_time, '%H:%i:%s')) <= NOW())
    ORDER BY event_date DESC;
end //

delimiter ;