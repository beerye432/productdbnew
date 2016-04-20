var pg = require("pg");

exports.view = function(req, res){

	var products = [];

	var categories = [];

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		client.query("SELECT * FROM category", function(err, results){
			if(err) products = {};
			else products[0] = results.rows;
		});

		client.query("SELECT * FROM product", function(err, results){
			done();
			if(err) categories = {};
			else categories[0] = results.rows;
		});

		console.log(products);
		console.log(categories);
		res.render("products", {products: products, categories: categories});
	})
}

exports.add = function(req, res){

	var name = req.body.name;
	var sku = req.body.sku;
	var category = req.body.category;
	var price = parseFloat(req.body.price);

	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query("INSERT INTO product VALUES ('"+name+"','"+sku+"','"+category+"',"+price+");");
		done();

		if(err) console.log(err);
		else res.redirect("products");
	})
}