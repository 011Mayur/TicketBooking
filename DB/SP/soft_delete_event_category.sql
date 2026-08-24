drop procedure if exists soft_delete_event_category;
delimiter //
CREATE PROCEDURE soft_delete_event_category(
    IN p_id INT,
    OUT p_affected INT
)
BEGIN
    UPDATE event_categories 
    SET is_active = FALSE, updated_at = NOW()
    WHERE id = p_id;
    SET p_affected = ROW_COUNT();
end //

delimiter ;
