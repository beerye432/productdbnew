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
		client.query("INSERT INTO category VALUES ('"+name+"','"+description+"', 0);");
		done();

		if(err) req.session.err = "Failure to insert new product";
		else res.redirect("categories");
	});
}

exports.delete = function(req, res){

	var name = req.query.name;

	var products = [];

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query("SELECT * FROM product WHERE name = '"+name+"';");

		query.on('row', function(row){
			products.push(row);
		});

		query.on('error', function(error){
			done();
			return res.render("failure", {message: error});
		});

		query.on('end', function(){

			if(products.length > 0){
				done();
				res.render("failure", {message: "You can't delete a category with products still inside"});
			}
			else{
				query = client.query("DELETE FROM category WHERE name='"+name+"';");

				query.on('error', function(error){
					done();
					return res.render("failure", {message: error});
				});

				query.on('end', function(){
					done();
					res.redirect("categories")
				});
			}
		});
	});
}