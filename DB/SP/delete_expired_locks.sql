DROP PROCEDURE IF EXISTS delete_expired_locks;
DELIMITER //
CREATE PROCEDURE delete_expired_locks(
    OUT p_deleted_count INT
)
BEGIN
    DELETE FROM booking_locks 
    WHERE expires_at <= UTC_TIMESTAMP();
    
    SET p_deleted_count = ROW_COUNT();
END //
DELIMITER ;