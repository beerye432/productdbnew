 
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
 select products.name as name, products.id as id, case when products.id = orders.product_id then sum(orders.price) else 0 end as total, categories.name
 from products left outer join orders on products.id = orders.product_id, categories 
 where categories.id = products.category_id
 group by products.id, products.name, orders.product_id, categories.name
 order by total DESC;

 -- Put the top 50 states into temporary table
 insert into row_pre 
 select states.name as name, states.id as id, case when users.state_id = states.id then sum(orders.price) else 0 end as total, 'all' as cat_name
 from users left outer join orders ON users.id = orders.user_id LEFT OUTER JOIN states on states.id = users.state_id, categories, products 
 where orders.product_id = products.id and categories.id = products.category_id and categories.name LIKE '%%' 
 group by states.name, users.state_id, states.id 
 order by total desc 
 offset 0 rows 
 fetch next 50 rows only;

 --put cells into temp table
 insert into cell_pre
 select row_pre.name, col_pre.id, sum(orders.price) as total, col_pre.cat_name
 from orders left outer join users on users.id = orders.user_id
 left outer join states on states.id = users.state_id, col_pre, row_pre 
 where col_pre.id = product_id and row_pre.name = states.name 
 group by col_pre.id, row_pre.name, col_pre.cat_name
 order by total DESC;

 --insert empty stats into row_pre
 insert into row_pre 
 select states.name, states.id, 0 as total, 'all' as cat_name
 from states 
 where states.id not in (select row_pre.id from row_pre);

 --insert col/cat pairs into row_pre
 insert into row_pre
 select states.name as name, states.id as id, sum(orders.price) as total, categories.name 
 from categories inner join products on categories.id = products.category_id 
 inner join orders on orders.product_id = products.id inner join users on users.id = orders.user_id 
 inner join states on states.id = users.state_id 
 group by states.name, states.id, categories.name 
 order by total DESC;

 --insert empty col/cat pairs into row_per
 insert into row_pre
 select states.name as name, states.id as id, 0 as total, categories.name 
 from categories, states 
 where not exists (select name, cat_name from row_pre where name = states.name and cat_name = categories.name);

--update rows, psuedo:
UPDATE rows_pre
SET rows_pre.total=(SELECT log.price
FROM log left outer join users on log.user_id = users.id
WHERE users.state_id = rows_pre.id) + rows_pre.total;

--update cols, psuedo:
UPDATE cols_pre
SET cols_pre.total =(SELECT log.price
FROM log
WHERE log.product_id = cols_pre.id) + cols_pre.total;

--update cells, psudeo:
UPDATE cells_pre
SET cells_pre.total = (select log.price
from log left outer join users on users.id = logs.user_id
left outer join states on states.id = users.state_id
where cells_pre.name = states.name AND cells_pre.id = logs.product_id) + cells_pre.total;

