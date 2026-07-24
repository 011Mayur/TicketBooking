DROP PROCEDURE IF EXISTS add_user;
DELIMITER //
CREATE PROCEDURE add_user(
IN p_first_name VARCHAR(50),
IN p_last_name VARCHAR(50),
IN p_email VARCHAR(320),
IN p_password_hash LONGTEXT,
IN p_mobile_number VARCHAR(10),
IN P_date_of_birth DATETIME(6),
IN p_role INT,
IN p_gender INT,
IN p_is_active TINYINT(1),
IN p_created_at DATETIME(6),
OUT newId INT
)
BEGIN 
INSERT INTO users(first_name, last_name, password_hash, gender, role, date_of_birth, mobile_number,email,
is_active, created_at)
VALUES
(p_first_name,p_last_name,p_password_hash,p_gender,p_role,p_date_of_birth,p_mobile_number,p_email,p_is_active,p_created_at );
SELECT LAST_INSERT_ID() INTO newId;
END //

DELIMITER ;

