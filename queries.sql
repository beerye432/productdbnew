 
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


/* select products*/
 explain analyze select products.id as id, products.name as name, case when products.id = orders.product_id then sum(orders.price) else 0 end as total 
 from products left outer join orders on products.id = orders.product_id, categories 
 where categories.id = products.category_id and categories.name LIKE '%%' 
 group by products.id, products.name, orders.product_id 
 order by total 
 DESC offset 0 rows fetch next 50 rows only;

 explain analyze select states.name as name, case when users.state_id = states.id then sum(orders.price) else 0 end as total 
 from users left outer join orders ON users.id = orders.user_id LEFT OUTER JOIN states on states.id = users.state_id, categories, products 
 where orders.product_id = products.id and categories.id = products.category_id and categories.name LIKE '%%' 
 group by states.name, users.state_id, states.id 
 order by total desc 
 offset 0 rows 
 fetch next 50 rows only;

 -- Put the top 50 products into temporary table
 insert into col_pre 
 select products.name as name, products.id as id, case when products.id = orders.product_id then sum(orders.price) else 0 end as total 
 from products left outer join orders on products.id = orders.product_id, categories 
 where categories.id = products.category_id and categories.name LIKE '%%' 
 group by products.id, products.name, orders.product_id 
 order by total 
 DESC offset 0 rows fetch next 50 rows only; 

 -- Put the top 50 states into temporary table
 insert into row_pre 
 select states.name as name, states.id as id, case when users.state_id = states.id then sum(orders.price) else 0 end as total 
 from users left outer join orders ON users.id = orders.user_id LEFT OUTER JOIN states on states.id = users.state_id, categories, products 
 where orders.product_id = products.id and categories.id = products.category_id and categories.name LIKE '%%' 
 group by states.name, users.state_id, states.id 
 order by total desc 
 offset 0 rows 
 fetch next 50 rows only;

 --put cells into temp table
 insert into cell_pre
 select col_pre.id, row_pre.name, sum(orders.price) as total 
 from orders left outer join users on users.id = orders.user_id 
 left outer join states on states.id = users.state_id, col_pre, row_pre 
 where col_pre.id = product_id and row_pre.name = states.name 
 group by col_pre.id, row_pre.name 
 order by total DESC;

 --insert empty stats into row_pre
 insert into row_pre 
 select states.name, states.id, 0 as total 
 from states 
 where states.id not in (select row_pre.id from row_pre);

 


