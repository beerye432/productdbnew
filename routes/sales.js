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

	if(rows == "c"){
		if(sorting == "a"){
			viewCustomers(req, res);
		}
		else if(sorting == "t"){
			viewCustomersTopK(req, res);
		}
		else{
			viewCustomers(req, res);
		}
	}
	else{
		viewStates(req, res);
	}

	return 0;
}

//this function handles getting more rows and columns
exports.getmore = function(req, res){

	if(req.body.col){
		req.session.col += 10;
	}
	else if(req.body.row){
		req.session.row += 20;
	}
	else if(req.body.reset){
		req.session.row = 0;
		req.session.col = 0;
	}
	else{
		console.log('nothing');
	}

	return res.redirect("/sales?rows="+req.session.rowType+"&orders="+req.session.sortingType+"&sales="+req.session.categoryFilter);
}

function viewStates(req, res){

	var query;

	var categories = [];

	var rows = [];

	var purchases = [];

	var products = [];

	var states = ["AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","HI","IA","ID", "IL","IN","KS","KY","LA","MA","MD","ME","MH","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY", "OH","OK","OR","PA","PR","PW","RI","SC","SD","TN","TX","UT","VA","VI","VT","WA","WI","WV","WY"];

	var states_json = [];

	var bounds = 0;

	var state_in;

	var users = [];	

	var display = [];

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

			//get appropriate 10 products, ordered by name
			query = client.query("SELECT products.id as id, products.name as name FROM products, categories WHERE categories.id = products.category_id AND categories.name LIKE '%"+req.session.categoryFilter+"%' ORDER BY name OFFSET "+req.session.col+"ROWS FETCH NEXT 10 ROWS ONLY;");

			query.on("row", function(row){
				products.push(row);
			});

			query.on("error", function(err){
				done();
				return res.render("failure", {message: err});
			});

			query.on("end", function(err){

				i = 0;
				
				async.each(states.slice(req.session.row, req.session.row+20), function(state, callback){

					query = client.query("SELECT '"+state+"' as state, products.id as product," 
										+" SUM(CASE WHEN products.id = orders.product_id THEN orders.price ELSE 0 END) as total"
										+" FROM orders, products, users "
										+" WHERE users.state = '"+state+"' AND users.id = orders.user_id AND products.id IN (SELECT products.id FROM products, categories WHERE categories.id = products.category_id AND categories.name LIKE '%"+req.session.categoryFilter+"%' ORDER BY products.name OFFSET "+req.session.col+" ROWS FETCH NEXT "+products.length+" ROWS ONLY)"
										+" GROUP BY products.id order by products.name ASC;");

					query.on("row", function(row){
						purchases.push(row);
					});

					query.on("error", function(err){
						done();
						return res.render("failure", {message: err});
					});

					query.on("end", function(){

						if(purchases.length == 0){

							purchases = Array(products.length).fill({"total": 0});
						}

						state_in =  {"name": state, "purchases": purchases};

						users[i] = state_in;

						i++;

						purchases = [];

						state_in = {};

						callback();
					});

				}, function(err){

					done();

					display = [];

					if(req.session.row == 0 && req.session.col == 0){
						display.push(1);
					}

					return res.render("sales", {categories: categories, products: products, users: users, display: display});

				});

			});

		});
	});
}

function viewCustomers(req, res){

	var query;

	var categories = [];

	var rows = [];

	var purchases = [];

	var products = [];

	var users = [];

	var display = [];

	var i = 0;

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

			//get appropriate 10 products, ordered by name
			query = client.query("SELECT products.id as id, products.name as name FROM products, categories WHERE categories.id = products.category_id AND categories.name LIKE '%"+req.session.categoryFilter+"%' ORDER BY products.name OFFSET "+req.session.col+"ROWS FETCH NEXT 10 ROWS ONLY;");

			query.on("row", function(row){
				products.push(row);
			});

			query.on("error", function(err){
				done();
				return res.render("failure", {message: err});
			});

			query.on("end", function(err){

				//get appropriate 20 users, ordered by name
				query = client.query("SELECT * FROM users ORDER BY name OFFSET "+req.session.row+"ROWS FETCH NEXT 20 ROWS ONLY;");

				query.on("row", function(row){
					users.push(row);
				});

				query.on("error", function(err){
					done();
					return res.render("failure", {message: err});
				});

				query.on("end", function(){

					i = 0; 

					async.each(users, function(user, callback){

						query = client.query("SELECT orders.user_id as user, products.id as product,"
									 		+"SUM(CASE WHEN products.id = orders.product_id THEN orders.price ELSE 0 END) AS total"
									 		+" FROM orders, products"
									 		+" WHERE orders.user_id = "+user.id+" AND products.id IN (SELECT products.id FROM products, categories WHERE categories.id = products.category_id AND categories.name LIKE '%"+req.session.categoryFilter+"%' ORDER BY products.name OFFSET "+req.session.col+" ROWS FETCH NEXT "+products.length+" ROWS ONLY)"
									 		+" GROUP BY products.id, orders.user_id"
									 		+" ORDER BY products.name ASC;");

						query.on("row", function(row){
							purchases.push(row);
						});

						query.on("error", function(err){
							done();
							return res.render("failure", {message: err});
						});

						query.on("end", function(){

							if(purchases.length == 0){

								purchases = Array(products.length).fill({"total": 0});
							}

							users[i].purchases = purchases;

							i++;

							purchases = [];

							callback();
						});

					}, function(err){

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

function viewCustomersTopK(req, res){
	var query;

	var categories = [];

	var rows = [];

	var purchases = [];

	var products = [];

	var users = [];

	var display = [];

	var i = 0;

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
								" FETCH NEXT 10 ROWS ONLY;");


			query.on("row", function(row){
				products.push(row);
			});

			query.on("error", function(err){
				done();
				return res.render("failure", {message: err});
			});

			query.on("end", function(err){

				query = client.query("SELECT users.id as id, users.name as name, CASE WHEN users.id = orders.user_id THEN SUM(orders.price) ELSE 0 END AS total"+
									" FROM users LEFT OUTER JOIN orders ON users.id = orders.user_id, categories, products"+
									" WHERE products.id = orders.product_id AND products.category_id = categories.id AND categories.name LIKE '%"+req.session.categoryFilter+"%'"+
									" GROUP BY users.id, users.name, orders.user_id"+
									" UNION "+
									" SELECT users.id as id, users.name as name, 0 as total"+
									" FROM users "+
									" WHERE NOT EXISTS(SELECT orders.id from orders, products, categories where orders.user_id = users.id AND orders.product_id = products.id AND categories.id = products.category_id AND categories.name LIKE '%"+req.session.categoryFilter+"%')"+
									" GROUP BY users.id, users.name"+
									" ORDER BY total DESC"+
									" OFFSET "+req.session.row+" ROWS"+
									" FETCH NEXT 20 ROWS ONLY;");

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

							query = client.query("SELECT orders.user_id, SUM(orders.price) AS total"+
												" FROM orders"+
												" WHERE orders.user_id = "+user.id+" AND orders.product_id = "+product.id+
												" GROUP BY orders.user_id"+
												" UNION "+
												" SELECT orders.user_id, 0 AS total"+
												" FROM orders"+
												" WHERE NOT EXISTS(SELECT * FROM orders WHERE orders.user_id = "+user.id+" AND orders.product_id = "+product.id+")"+
												" AND orders.user_id = "+user.id+
												" GROUP BY orders.user_id;");

							query.on("row", function(row){
								purchases.push(row); 
							});

							query.on("error", function(err){
								done();
								return res.render("failure", {message: err+ " 361"});
							});

							query.on("end", function(){ //done with product
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

function viewStatesTopK(req, res){

	var query;

	var categories = [];

	var rows = [];

	var purchases = [];

	var products = [];

	var users = [];

	var display = [];

	var states = ["AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","GU","HI","IA","ID", "IL","IN","KS","KY","LA","MA","MD","ME","MH","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY", "OH","OK","OR","PA","PR","PW","RI","SC","SD","TN","TX","UT","VA","VI","VT","WA","WI","WV","WY"];

	var states_json = [];

	var i = 0;

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
								" FETCH NEXT 10 ROWS ONLY;");


			query.on("row", function(row){
				products.push(row);
			});

			query.on("error", function(err){
				done();
				return res.render("failure", {message: err});
			});

			query.on("end", function(err){

				query = client.query("SELECT state as state, CASE WHEN users.state = state THEN sum(orders.price) ELSE 0 END AS total"+
									 " FROM users LEFT OUTER JOIN orders ON users.id = orders.user_id, categories, products"+ 
									 " WHERE orders.product_id = products.id AND categories.id = products.category_id AND categories.name LIKE '%"+req.session.categoryFilter+"%'"+
									 " GROUP BY state"+
									 " UNION "+
									 " SELECT state, 0 AS total"+
									 " FROM users"+ 
									 " WHERE NOT EXISTS(SELECT * FROM orders, products, categories WHERE users.id = orders.user_id AND orders.product_id = products.id AND products.category_id = categories.id AND categories.name LIKE '%"+req.session.categoryFilter+"%')"+ 
									 " GROUP BY state;"+
									 " ORDER BY total DESC"+
									 " OFFSET "+req.session.row+" ROWS"+
									 " FETCH NEXT 20 ROWS ONLY;");

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

							query = client.query("SELECT state, SUM(orders.price) AS total"+
												" FROM orders LEFT OUTER JOIN users ON orders.user_id = users.id"+
												" WHERE orders.product_id = "+product.id+" AND users.state = "+users.state+
												" GROUP BY state;");
												// " UNION "+
												// " SELECT state, 0 AS total"+
												// " FROM users"+
												// " WHERE NOT EXISTS(SELECT * FROM orders WHERE orders.user_id = "+user.id+" AND users.state = "+user.state+")"+
												// " AND orders.user_id = "+user.id+
												// " GROUP BY orders.user_id;");

							query.on("row", function(row){
								purchases.push(row); 
							});

							query.on("error", function(err){
								done();
								return res.render("failure", {message: err+ " 361"});
							});

							query.on("end", function(){ //done with product
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