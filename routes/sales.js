var pg = require("pg");
var async = require("async");

exports.view = function(req, res){

	var row_type = req.body.rows;

	var query;

	var categories = [];

	var rows = [];

	var purchases = [];

	var stateList = ["AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","GU","HI","IA","ID", "IL","IN","KS","KY","LA","MA","MD","ME","MH","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY", "OH","OK","OR","PA","PR","PW","RI","SC","SD","TN","TX","UT","VA","VI","VT","WA","WI","WV","WY"];

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		//states
		if(rows == "s"){

			
		}
		
		//Customers
		query = client.query("SELECT * FROM categories;");

		query.on('row', function(row){
			categories.push(row);
		});

		query.on("error", function(err){
			done();
			return res.render("failure", {message: err});
		});

		query.on('end', function(){
			
			query = client.query("SELECT * FROM users ORDER BY name OFFSET "+req.session.row+"ROWS FETCH NEXT 20 ROWS ONLY;");

			query.on('row', function(row){
				rows.push(row);
			});

			query.on('error', function(err){
				done();
				return res.render("failure", {message: err});
			});

			query.on('end', function(){

				var i = 0;

				async.eachSeries(rows, function(user, callback) {

					purchases = [];
				   
					query = client.query("SELECT * FROM orders, products WHERE user_id='"+user.id+"' AND  ORDER BY product_id OFFSET "+req.session.col+"ROWS FETCH NEXT 10 ROWS ONLY;");

					query.on('row', function(row){
						purchases.push(row);
					});

					query.on('error', function(err){
						done();
						return res.render("failure", {message: err});
					});

					query.on('end', function(){

						rows[i].purchases = purchases;

						i++;

						console.log("success");

						callback();

					});
				}, function(err){

					done();
					return res.render("sales", {categories: categories, rows: rows});

				});
			});
		});
	});


} 

exports.view2 = function(req, res){

	var query;

	var categories = [];

	var rows = [];

	var purchases = [];

	var products = [];

	var users = [];

	var i = 0;

	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		
		//Customers
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
			query = client.query("SELECT * FROM products ORDER BY name OFFSET "+req.session.col+"ROWS FETCH NEXT 10 ROWS ONLY;");

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

						purchases = [];

						query = client.query("SELECT orders.user_id as user, products.id as product,"
									 		+"SUM(CASE WHEN products.id = orders.product_id THEN orders.price ELSE 0 END) AS total"
									 		+" FROM orders, products"
									 		+" WHERE orders.user_id = "+user.id+" AND products.id IN (SELECT products.id FROM products ORDER BY name OFFSET "+req.session.row+" ROWS FETCH NEXT 10 ROWS ONLY)"
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

							users[i].purchases = purchases;

							i++;

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


exports.getsales = function(req, res){
	return res.redirect("sales");
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

	return res.redirect("/sales");
}