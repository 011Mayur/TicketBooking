DROP PROCEDURE IF EXISTS check_event_type_deletable;
DELIMITER //
CREATE PROCEDURE check_event_type_deletable(
    IN p_event_type_id INT,
    OUT p_can_delete BOOLEAN,
    OUT p_category_count INT,
    OUT p_reason VARCHAR(255)
)
BEGIN
    SELECT COUNT(*) INTO p_category_count
    FROM event_categories
    WHERE event_type_id = p_event_type_id AND is_active = TRUE;

    IF p_category_count > 0 THEN
        SET p_can_delete = FALSE;
        SET p_reason = CONCAT(p_category_count, ' active categories exist. Delete all categories first.');
    ELSE
        SET p_can_delete = TRUE;
        SET p_reason = 'Can be deleted';
    END IF;
END //
DELIMITER ;