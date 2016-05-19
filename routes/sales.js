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

	if(rows == "s"){
		viewStates(req, res);
	}
	else{
		viewCustomers(req, res);
	}
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

	var states = ["AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","GU","HI","IA","ID", "IL","IN","KS","KY","LA","MA","MD","ME","MH","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY", "OH","OK","OR","PA","PR","PW","RI","SC","SD","TN","TX","UT","VA","VI","VT","WA","WI","WV","WY"];

	var states_json = [];

	var bounds = 0;

	var state_in;

	var users = [];	

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		//categories
		query = client.query("SELECT * FROM categories;");

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
										+" WHERE users.state = '"+state+"' AND users.id = orders.user_id AND products.id IN (SELECT products.id from products ORDER BY name OFFSET "+req.session.col+" ROWS fetch next 10 rows only)"
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

							purchases = [{"total": 0},{"total": 0},{"total": 0},{"total": 0},{"total": 0},{"total": 0},{"total": 0},{"total": 0},{"total": 0},{"total": 0},];
						}

						state_in =  {"name": state, "purchases": purchases};

						users[i] = state_in;

						console.log(i + " " + users[i].purchases);

						i++;

						purchases = [];

						state_in = {};

						callback();
					});

				}, function(err){

					done();

					return res.render("sales", {categories: categories, products: products, users: users});

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

	var i = 0;

	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		
		//categories
		query = client.query("SELECT * FROM categories;");

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
									 		+" WHERE orders.user_id = "+user.id+" AND products.id IN (SELECT products.id FROM products ORDER BY name OFFSET "+req.session.col+" ROWS FETCH NEXT 10 ROWS ONLY)"
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

								purchases = [{"total": 0},{"total": 0},{"total": 0},{"total": 0},{"total": 0},{"total": 0},{"total": 0},{"total": 0},{"total": 0},{"total": 0},];
							}

							users[i].purchases = purchases;

							console.log(i + " " + users[i].purchases);

							i++;

							purchases = [];

							callback();
						});

					}, function(err){

						done();

						return res.render("sales", {categories: categories, products: products, users: users});

					});
				});
			});
		});
	});
}