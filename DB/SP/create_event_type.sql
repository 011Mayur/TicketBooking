drop procedure if exists create_event_type;
delimiter //
CREATE PROCEDURE create_event_type(IN p_name VARCHAR(255), OUT p_id INT)
BEGIN
INSERT INTO event_types (name, is_active, created_at)
VALUES (p_name, TRUE, NOW());
SET p_id = LAST_INSERT_ID();
END //

delimiter ;