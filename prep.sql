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

 --insert empty stats into row_pre
 insert into row_pre 
 select states.name, states.id, 0 as total, 'all' as cat_name
 from states 
 where states.id not in (select row_pre.id from row_pre);

 --put cells into temp table
 insert into cell_pre
 select row_pre.name, col_pre.id, sum(orders.price) as total, col_pre.cat_name
 from orders left outer join users on users.id = orders.user_id
 left outer join states on states.id = users.state_id, col_pre, row_pre 
 where col_pre.id = product_id and row_pre.name = states.name 
 group by col_pre.id, row_pre.name, col_pre.cat_name
 order by total DESC;

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