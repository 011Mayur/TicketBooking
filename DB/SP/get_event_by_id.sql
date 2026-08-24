DROP PROCEDURE IF EXISTS get_event_by_id;
DELIMITER //
CREATE PROCEDURE get_event_by_id(IN p_id INT) 
BEGIN 
SELECT e.id,e.title,e.artist_name,e.venue,e.event_date,e.event_time,e.ticket_price,e.total_seats,e.available_seats,e.is_active,
e.created_at,e.updated_at,e.bulk_ticket_for_discount,e.discount_percentage, e.poster_image_url, e.event_category_id,e.description,ec.event_type_id

 FROM events e inner join event_categories ec on e.event_category_id = ec.id  WHERE e.id = p_id;
END //

DELIMITER ;

call get_event_by_id(3)

select * from event_categories

select * from event_categories