DROP PROCEDURE IF EXISTS get_user_by_email_role;
DELIMITER //
CREATE PROCEDURE get_user_by_email_role(IN p_email VARCHAR(320),in p_role int)
BEGIN
SELECT id, first_name, last_name, email,password_hash, role FROM users WHERE email=p_email and role = p_role;
END //

DELIMITER ;

call get_user_by_email_role("panchalmayur052@gmail.com",1);

select * from coupons
select * from refresh_tokens
select * from events
