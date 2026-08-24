drop procedure if exists create_event_category;
delimiter //
CREATE PROCEDURE create_event_category(
    IN p_name VARCHAR(255),
    IN p_event_type_id INT,
    OUT p_id INT
)
BEGIN
    INSERT INTO event_categories (name, event_type_id, is_active, created_at)
    VALUES (p_name, p_event_type_id, TRUE, NOW());
    SET p_id = LAST_INSERT_ID();
end //

delimiter ;