DROP PROCEDURE IF EXISTS check_next_page_exists
DELIMITER //
CREATE PROCEDURE check_next_page_exists(IN p_page INT)
BEGIN
  DECLARE v_offset INT;
  SET v_offset = p_page * 4;
  SELECT COUNT(*) FROM events LIMIT 1 OFFSET v_offset;
END // 
DELIMITER ;

call check_next_page_exists(0)