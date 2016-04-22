var pg = require("pg");

exports.view = function(req, res){

	var categories = [];

	var products = [];

	pg.connect(process.env.DATABASE_URL, function(err, client, done){


		var query = client.query("SELECT * FROM category;");

		query.on('row', function(row){
			categories.push(row);
		});

		query = client.query("SELECT * FROM product;");

		query.on('row', function(row){
			products.push(row);
		});

		query.on('end', function(){
			done();
			res.render("products", {products: products, categories: categories});
		});
	});
}

exports.add = function(req, res){

	var name = req.body.name;
	var sku = req.body.sku;
	var category = req.body.category;
	var price = parseFloat(req.body.price);

	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query("INSERT INTO product VALUES ('"+name+"','"+sku+"','"+category+"',"+price+");", function(err, results){

			if(err) console.log(err);

			else{

				client.query("UPDATE category SET pnum = pnum + 1 WHERE name = '"+category+"'");

				done();

				res.redirect("products");
			}
		});
	});	
}

exports.delete = function(req, res){

	var name = req.query.name;

	var category = [];

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query("SELECT category FROM product WHERE name = '"+name+"';");

		query.on('row', function(row){
			category.push(row);
			console.log(category);
		});

		query.on('error', function(error){
			done();
			return res.render("failure", {message: 'Error deleting product!'});
		});

		query = client.query("DELETE FROM product WHERE name='"+name+"';");

		query.on('error', function(error){
			done();
			return res.render("failure", {message: 'Error deleting product!'});
		});

		query = client.query("UPDATE category SET pnum = pnum - 1 WHERE name = '"+category[0].category+"';");

		query.on('end', function(results){

			done();

			res.redirect("products");
		});

	});

/*
		query = client.query("UPDATE")


	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		client.query("SELECT category FROM product WHERE name = '"+name+"';", function(err, results){

			if(err) return res.render("failure", {message: "Failure deleting product"});
			else category.push(results.rows);
		});

		client.query("DELETE FROM product WHERE name='"+name+"';", function(err, results){

			if(err) return res.render("failure", {message: "Failure deleting product"});
		});

		console.log(category);

		client.query("UPDATE category SET pnum = pnum - 1 WHERE name='"+category[0].category+"'");
	});

	*/

}