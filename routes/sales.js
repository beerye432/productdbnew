var pg = require("pg");

exports.view = function(req, res){

	var categories = [];

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
			done();
			return res.render("sales", {categories: categories});
		});

	});
}