var pg = require("pg");

exports.view = function(req, res){

	var categories = [];

	pg.connect(process.env.DATABASE_URL, function(err, client, done){


		var query = client.query("SELECT * FROM categories;");

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

	if(name == "" || description == ""){
		req.session.err = "Failure to insert new category";
		return res.redirect("categories");
	}

	pg.connect(process.env.DATABASE_URL, function(err, client, done){


		var query = client.query("INSERT INTO categories VALUES ('"+name+"','"+description+"');");

		query.on("error", function(error){

			done();

			req.session.err = "Failure to insert new category";

			res.redirect("categories");
		});

		query.on("end", function(){

			done();

			req.session.err = "Category added successfully";

			res.redirect("categories");
		});
	});
}

exports.update = function(req, res){

	var name = req.body.name;

	var description = req.body.desc;

	var nameO = req.body.nameO;

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query("UPDATE categories SET name = '"+name+"', description = '"+description+"' WHERE name = '"+nameO+"';");

		query.on('error', function(error){
			done();

			req.session.err = "Failure to update category";

			res.redirect("categories");
		});

		query.on('end', function(){

			done();

			res.redirect("categories");
		});
	});
}

exports.delete = function(req, res){

	var name = req.query.name;

	var products = [];

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query("SELECT * FROM products WHERE category = '"+name+"';");

		query.on('row', function(row){
			products.push(row);
		});

		query.on('error', function(error){

			done();

			req.session.err = "Failure deleting category";

			return res.render("categories");
		});

		query.on('end', function(){

			if(products.length > 0){

				done();

				req.session.err = "Can't delete a category with products still inside";

				res.redirect("categories");
			}
			else{
				query = client.query("DELETE FROM category WHERE name='"+name+"';");

				query.on('error', function(error){

					done();

					req.session.err = "Error deleting category";

					res.redirect("categories");
				});

				query.on('end', function(){

					done();

					req.session.err = "Category delete successfully";

					res.redirect("categories");
				});
			}
		});
	});
}