DROP PROCEDURE IF EXISTS get_user_by_email;
DELIMITER //
CREATE PROCEDURE get_user_by_email(IN p_email VARCHAR(320))
BEGIN
SELECT id, first_name, last_name, email,password_hash, role FROM users WHERE email=p_email;
END //

DELIMITER ;
