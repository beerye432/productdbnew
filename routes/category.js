var pg = require("pg");

exports.view = function(req, res){

	var categories = [];

	pg.connect(process.env.DATABASE_URL, function(err, client, done){


		var query = client.query("SELECT * FROM category;");

		query.on('row', function(row){
			categories.push(row);
		});

		query.on('end', function(){
			done();
			res.render("categories", {categories: categories});
		});
	});
}

exports.add = function(req, res){

	var name = req.body.name;
	var description = req.body.description;

	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query("INSERT INTO category VALUES ('"+name+"','"+description+"');");
		done();

		if(err) console.log(err);
		else res.redirect("categories");
	})
}