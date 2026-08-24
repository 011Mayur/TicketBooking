DROP PROCEDURE IF EXISTS get_my_bookings;

DELIMITER //

CREATE PROCEDURE get_my_bookings(IN p_user_id INT)
BEGIN
SELECT
b.id AS booking_id,
b.event_id AS event_id,
e.title AS event_title,
e.event_date AS event_date,
e.event_time AS event_time,
e.venue  AS venue,
b.quantity AS quantity,
b.final_amount AS final_amount,
b.status AS status
FROM bookings b
INNER JOIN events e ON e.id = b.event_id
WHERE b.user_id = p_user_id
ORDER BY b.created_at DESC;
END //

DELIMITER ;

select * from bookings
select * from events