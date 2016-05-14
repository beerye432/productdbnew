var pg = require("pg");
var async = require("async");

exports.view = function(req, res){

	var categories = [];

	var rows = [];

	var purchases = [];

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query("SELECT * FROM categories;");

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
				   
					query = client.query("SELECT * FROM orders WHERE user_id='"+user.id+"' ORDER BY product_id OFFSET "+req.session.col+"ROWS FETCH NEXT 10 ROWS ONLY;");

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
					});
				}, function done() {

					done();
					return res.render("sales", {categories: categories, rows: rows});

				});
			});
		});
	});
}