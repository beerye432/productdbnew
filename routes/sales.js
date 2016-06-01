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
		if(sorting == "a"){
			viewStates(req, res);
		}
		else if(sorting == "t"){
			viewStatesTopK(req, res);
		}
		else{
			viewStates(req, res);
		}
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

exports.getCategories = function(req, res){

	var cats = [];

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query("SELECT name FROM categories ORDER BY name");

		query.on("row", function(row){
			cats.push(row);
		});

		query.on("error", function(err){
			return res.render("failure", {message: err});
		});

		query.on("end", function(){
			done();
			return res.json(cats);
		});
	});
}

exports.getHeaders = function(req, res){

	var rows = [];

	var cols = [];

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		//fetch the top 50 products of a certain category (if applicable)
		var query = client.query("SELECT * FROM col_pre WHERE col_pre.cat_name LIKE '%"+req.session.categoryFilter+"%' ORDER BY total DESC FETCH NEXT 50 ROWS ONLY;");

		query.on("row", function(row){
			cols.push(row);
		});

		query.on("error", function(err){
			return res.render("failure", {message: err});
		});

		query.on("end", function(){

			if(req.session.categoryFilter == ""){
				req.session.categoryFilter = "all";
			}

			//fetch the 50 states, and their totals taking into account sales filtering
			query = client.query("SELECT * FROM row_pre WHERE row_pre.cat_name LIKE '%"+req.session.categoryFilter+"%';");

			query.on("row", function(row){
				rows.push(row);
			});

			query.on("error", function(err){
				return res.render("failure", {message: err});
			});

			query.on("end", function(){

				if(req.session.categoryFilter == "all"){
					req.session.categoryFilter = "";
				}

				req.session.topFifty = rows; //update the session's top 50, will check later
				done();
				return res.json({rows: rows, cols: cols});
			});
		});
	});
}

exports.getCells = function(req, res){

	var cells = [];

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query("SELECT * FROM cell_pre;");

		query.on("row", function(row){
			cells.push(row);
		});

		query.on("error", function(err){
			return res.render("failure", {message: err});
		});

		query.on("end", function(){
			done();
			return res.json(cells);
		});
	});
}

exports.getUpdates = function(req, res){

	var updates = [];

	var changes = [];

	var difference = [];

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query("SELECT logs.product_id as id, states.name as name, price as total"+
								" FROM orders INNER JOIN users ON orders.user_id = users.id INNER JOIN states ON states.id = users.state_id"+
								" FETCH NEXT 50 ROWS ONLY;");

		query.on("row", function(row){
			updates.push(row);
		});

		query.on("error", function(err){
			return res.render("failure", {message: err});
		});

		query.on("end", function(){

			//update rows for "all" category
			query = client.query("UPDATE row_pre"+
								" SET row_pre.total = "+
								" (SELECT log.price "+
								" FROM log LEFT OUTER JOIN users on log.users_id = users.id"+
								" LEFT OUTER JOIN states on states.id = users.state_id"+
								" LEFT OUTER JOIN products on log.product_id = products.id"+
								" LEFT OUTER JOIN categories ON categories.id = products.category_id"+
								" WHERE states.name = row_pre.name AND log.product_id = row_pre.id AND category.name = 'all') + row_pre.total;");

			query.on("error", function(err){
				return res.render("failure", {message: err});
			});

			query.on("end", function(err){

				//update rows for specific category
				query = client.query("UPDATE row_pre"+
								" SET row_pre.total = "+
								" (SELECT log.price "+
								" FROM log LEFT OUTER JOIN users on log.users_id = users.id"+
								" LEFT OUTER JOIN states on states.id = users.state_id"+
								" LEFT OUTER JOIN products on log.product_id = products.id"+
								" LEFT OUTER JOIN categories ON categories.id = products.category_id"+
								" WHERE states.name = row_pre.name AND log.product_id = row_pre.id AND category.name = row_pre.cat_name) + row_pre.total;");
				
				query.on("error", function(err){
					return res.render("failure", {message: err});
				});

				query.on("end", function(err){
					
					//update product columns
					query = client.query("UPDATE col_pre"+
										" SET cols_pre.total ="+
										" (SELECT log.price FROM log"+
										" WHERE users.log.product_id = cols_pre.id)"+
										" + cols_pre.total;");

					query.on("error", function(err){
						return res.render("failure", {message: err});
					});

					query.on("end", function(){

						//update cells
						query = client.query("UPDATE cells_pre"+
											" SET cells_pre.total = (select log.price"+
											" from log left outer join users on users.id = logs.user_id"+
											" left outer join states on states.id = users.state_id"+
											" where cells_pre.name = states.name AND cells_pre.id = logs.product_id) + cells_pre.total;");
						
						query.on("error", function(err){
							return res.render("failure", {message: err});
						});

						query.on("end", function(){

							query = client.query("SELECT * FROM col_pre WHERE col_pre.cat_name LIKE '%"+req.session.categoryFilter+"%' ORDER BY total DESC FETCH NEXT 50 ROWS ONLY;");

							query.on("row", function(row){
								changes.push(row);
							});

							query.on("error", function(err){
								return res.render("failure", {message: err});
							});

							query.on("end", function(){

								var found = false;

								for(var i = 0; i < req.session.topFifty; i++){
									for(var j = 0; j < changes; j++){
										if(req.session.topFifty[i].name == changes[j].name){
											found = true;
										}
									}

									if(found == false){
										difference.push(req.session.topFifty[i]);
									}

									found = false;
								}

								done();

								return res.json({changes: difference, updates: updates});
							});
						});
					});
				});
			});
		});
	});
}

exports.getUpdatesWIP = function(req, res){

	var updates = [];

	var changes = [];

	var difference = [];

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query("SELECT log.product_id as id, products.name as pname, states.name as name, log.price as total"+
								" FROM products inner join log on log.product_id = products.id INNER JOIN users ON log.user_id = users.id INNER JOIN states ON states.id = users.state_id;");

		query.on("row", function(row){
			updates.push(row);
		});

		query.on("error", function(err){
			done();
			return res.render("failure", {message: err});
		});

		query.on("end", function(){

			//update rows for "all" category
			query = client.query("UPDATE row_pre"+
								" SET row_pre.total = total + t"+
								" FROM (SELECT states.name as sname, sum(log.price) as t"+
								" FROM log INNER JOIN users on log.users_id = users.id"+
								" INNER states on states.id = users.state_id GROUP BY sname) z"+
								" WHERE z.sname = row_pre.name and row_pre.cat_name = 'all';");

			query.on("error", function(err){
				done();
				return res.render("failure", {message: err});
			});

			query.on("end", function(){

				//update rows for specific categories
				query = client.query("UPDATE row_pre"+
									" set total = total + t"+
									" FROM (select states.name as sname, categories.name as cname, sum(log.price) as t"+
									" from log inner join users on log.user_id = users.id"+
									" inner join states on users.state_id = states.id"+ 
									" inner join products on products.id = log.product_id"+ 
									" inner join categories on categories.id = products.category_id"+ 
									" group by sname, cname) z"+
									" where z.sname = row_pre.name AND row_pre.cat_name = z.cname;");

				query.on("error", function(err){
					done();
					return res.render("failure", {message: err});
				});

				query.on("end", function(){

					//update product columns
					query = client.query("UPDATE col_pre"+
										" set total = total + t"+
										" from (select log.product_id as id, sum(log.price) as t"+
										" from log group by log.product_id) z"+
										" where z.id = col_pre.id;");

					query.on("error", function(err){
						done();
						return res.render("failure", {message: err});
					});

					query.on("end", function(){

						//update cells
						query = client.query("UPDATE cell_pre"+
											" set total = total + t"+
											" FROM (select states.name as sname, log.product_id as id, sum(log.price) as t"+
											" FROM log inner join users on users.id = log.user_id inner join states on states.id = users.state_id"+
											" GROUP BY states.name, log.product_id) z"+
											" WHERE z.sname = cell_pre.name AND z.id = cell_pre.id;");

						query.on("error", function(err){
							done();
							return res.render("failure", {message: err});
						});

						query.on("end", function(){

							//get current top 50 after updates
							query = client.query("SELECT * FROM col_pre WHERE col_pre.cat_name LIKE '%"+req.session.categoryFilter+"%' ORDER BY total DESC FETCH NEXT 50 ROWS ONLY;");

							query.on("row", function(row){
								changes.push(row);
							});

							query.on("error", function(err){
								done();
								return res.render("failure", {message: err});
							});

							query.on("end", function(){

								console.log("made it");

								//top 50 compares
								var found = false;

								for(var i = 0; i < req.session.topFifty; i++){
									for(var j = 0; j < changes; j++){
										if(req.session.topFifty[i].name == changes[j].name){
											found = true;
										}
									}

									if(found == false){
										difference.push(req.session.topFifty[i]);
									}

									found = false;
								}

								done();

								console.log("difference" + difference);

								return res.json({changes: difference, updates: updates});
							});
						});
					});
				});
			});
		});
	});
}

exports.runProc = function(req, res){

	var max = [];

	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		
		//get max_id from orders
		var query = client.query("SELECT MAX(id) FROM orders;");

		query.on('row', function(row){
			max.push(row);
		});

		query.on("error", function(err){
			done();
			return res.render("failure", {message: err});
		});

		query.on("end", function(){

			//run procedure
			query = client.query("SELECT proc_insert_orders(10, 100);");

			query.on("error", function(err){
				done();
				return res.render("failure", {message: err});
			});

			query.on("end", function(){

				//insert into log new orders
				query = client.query("INSERT INTO log SELECT * FROM orders WHERE id > "+max[0].max+";");

				query.on("error", function(err){
					done();
					return res.render("failure", {message: err});
				});

				query.on("end", function(){
					done();
					return;
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

				query = client.query("SELECT states.name as name, CASE WHEN users.state_id = states.id THEN sum(orders.price) ELSE 0 END AS total"+
									 " FROM users LEFT OUTER JOIN orders ON users.id = orders.user_id LEFT OUTER JOIN states on states.id = users.state_id, categories, products"+ 
									 " WHERE orders.product_id = products.id AND categories.id = products.category_id AND categories.name LIKE '%"+req.session.categoryFilter+"%'"+
									 " GROUP BY states.name, users.state_id, states.id"+
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

							query = client.query("SELECT states.name as name, orders.product_id as pname, SUM(orders.price) AS total"+
												" FROM orders LEFT OUTER JOIN users ON orders.user_id = users.id LEFT OUTER JOIN states on users.state_id = states.id"+
												" WHERE orders.product_id = "+product.id+" AND states.name = '"+user.name+"'"+
												" GROUP BY states.name, orders.product_id;");

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
									purchases.push({name: user.name, pname: product.id, total: 0});
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