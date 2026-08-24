DROP PROCEDURE IF EXISTS get_event_by_id_summary_page;
DELIMITER //
CREATE PROCEDURE get_event_by_id_summary_page(IN p_event_id INT)
BEGIN
SELECT id,title,venue,event_date, event_time,artist_name,ticket_price FROM events where id = p_event_id;
END //

DELIMITER ;

SELECT * FROM events

call get_event_by_id_summary_page(4)