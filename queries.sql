 
/* product total for state, product tuples */

 select products.name as pname, states.name as sname, sum(orders.price) as total 
 from users left outer join orders on users.id = orders.user_id 
 left outer join states on states.id = users.state_id 
 left outer join products on products.id = orders.user_id 
 group by pname, sname;
 -- union 
 -- select products.name as pname, states.name as sname, 0 as total from users 
 -- left outer join states on states.id = users.state_id, products 
 -- where not exists(select * from orders where orders.product_id = products.id and orders.user_id = users.id) 
 -- order by total DESC;