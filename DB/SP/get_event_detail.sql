drop procedure if exists get_event_detail;
delimiter //
create procedure get_event_detail(
in p_id int
)
begin 
select id,title,artist_name, venue, event_date, event_time, poster_image_url,ticket_price, available_seats,bulk_ticket_for_discount,
discount_percentage,description from events where id = p_id;
end //

delimiter ;

describe events

select * from events