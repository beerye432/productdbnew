var pg = require("pg");
var async = require("async");

//main routing function, determines view
exports.getSales = function(req, res){
	
	var rows = req.query.rows; //customer or states
	var sorting = req.query.orders; //alpha or top-k
	var category = req.query.sales; //category filers

	req.session.rowType = rows;
	req.session.sortingType = sorting;
	req.session.categoryFilter = category;

	viewStatesTopK(req, res);

	return 0;
}

function viewStatesTopK(req, res){

	var query;

	var categories = [];

	var rows = [];

	var purchases = [];

	var products = [];

	var users = [];

	var display = [];

	var states_json = [];

	var i = 0;

	var r = 0;

	console.log(req.session.col);

	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		
		//categories
		query = client.query("SELECT * FROM categories ORDER BY name;");

		query.on('row', function(row){
			categories.push(row);
		});

		query.on("error", function(err){
			done();
			return res.render("failure", {message: err});
		});

		query.on("end", function(){

			//get top 10 products and their totals
			query = client.query("SELECT products.id as id, products.name as name, CASE WHEN products.id = orders.product_id THEN SUM(orders.price) ELSE 0 END AS total"+ 
								" FROM products LEFT OUTER JOIN orders ON products.id = orders.product_id, categories"+
								" WHERE categories.id = products.category_id AND categories.name LIKE '%"+req.session.categoryFilter+"%'"+
								" GROUP BY products.id, products.name, orders.product_id"+ 
								" ORDER by total DESC"+
								" OFFSET "+req.session.col+" ROWS"+
								" FETCH NEXT 50 ROWS ONLY;");


			query.on("row", function(row){
				products.push(row);
			});

			query.on("error", function(err){
				done();
				return res.render("failure", {message: err});
			});

			query.on("end", function(err){

				query = client.query("SELECT state as name, CASE WHEN users.state = state THEN sum(orders.price) ELSE 0 END AS total"+
									 " FROM users LEFT OUTER JOIN orders ON users.id = orders.user_id, categories, products"+ 
									 " WHERE orders.product_id = products.id AND categories.id = products.category_id AND categories.name LIKE '%"+req.session.categoryFilter+"%'"+
									 " GROUP BY state"+
									 " UNION "+
									 " SELECT state, 0 AS total"+
									 " FROM users"+ 
									 " WHERE users.state NOT IN(SELECT state from users left outer join orders on users.id = orders.user_id, categories, products"+
									 " WHERE orders.product_id = products.id and categories.id = products.category_id and categories.name LIKE '%"+req.session.categoryFilter+"%')"+ 
									 " GROUP BY state"+
									 " ORDER BY total DESC"+
									 " OFFSET "+req.session.row+" ROWS"+
									 " FETCH NEXT 50 ROWS ONLY;");

				query.on("row", function(row){
					users.push(row);
				});

				query.on("error", function(err){
					done();
					return res.render("failure", {message: err + " 352"});
				});

				query.on("end", function(){

					console.log(products);

					i = 0; 

					async.each(users, function(user, callback){

						async.each(products, function(product, callback1){

							query = client.query("SELECT state as name, SUM(orders.price) AS total"+
												" FROM orders LEFT OUTER JOIN users ON orders.user_id = users.id"+
												" WHERE orders.product_id = "+product.id+" AND users.state = '"+user.name+"'"+
												" GROUP BY state;");

							query.on("row", function(row){
								r = 1;
								purchases.push(row); 
							});

							query.on("error", function(err){
								done();
								return res.render("failure", {message: err+ " 361"});
							});

							query.on("end", function(){ //done with product

								if(r == 0){
									purchases.push({name: user.name, total: 0});
								}

								r = 0;

								callback1();
							});

						}, function(err){ //done with user, associate purchases

							users[i].purchases = purchases;

							i++;

							purchases = [];

							callback();
						});

					}, function(err){ //done with all users

						done();

						if(req.session.row == 0 && req.session.col == 0){
							display.push(1);
						}

						return res.render("sales", {categories: categories, products: products, users: users, display: display});
					});
				});
			});
		});
	});
}

exports.viewSim = function(req, res){

	var results = [];

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query(" select p1.name as p1, p2.name as p2, (sum((o1.price)*(o2.price)))/(sum(o4.price)*sum(o3.price)) as diff"+//for each set of two products, calculate difference
								" from orders o1, orders o2, orders o3, orders o4, products p1, products p2, users u1, users u2"+
								" where o1.user_id = u1.id"+ //o1 and o2 are orders that belong to the two users, and the two products in question, help numerator
								" AND o2.user_id = u2.id"+
								" AND o1.product_id = p1.id"+
								" AND o2.product_id = p2.id"+
								" AND u1.id = u2.id"+
								" AND o3.product_id = p1.id"+ //o3 and o4 are orders that belong to two products in question, but no users in particular, help denominator
								" AND o4.product_id = p2.id"+
								" AND o1.id > o2.id"+
								" group by p1.name, p2.name"+ 
								" order by diff DESC"+ 
								" OFFSET 0 ROWS"+ 
								" FETCH NEXT 100 ROWS ONLY;");

		query.on("row", function(row){
			results.push(row);
		});

		query.on("error", function(err){
			done();
			return res.render("failure", {message: err + " 656"});
		});

		query.on("end", function(){
			done();
			return res.render("similar", {results: results});
		});
	});
}