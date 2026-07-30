DROP PROCEDURE IF EXISTS get_user_by_id
DELIMITER //

CREATE PROCEDURE get_user_by_id(
IN p_user_id INT
)
BEGIN
SELECT id, email,first_name,last_name, password_hash, role
FROM users
WHERE id = p_user_id
LIMIT 1;
END //
DELIMITER ;


