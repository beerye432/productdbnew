var pg = require("pg");

exports.view = function(req, res){

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var products = {};

		var categories = {};

		client.query("SELECT * FROM category", function(err, results){
			if(err) products = {};
			else products = results.rows;
		});

		client.query("SELECT * FROM product", function(err, results){
			done();
			if(err) categories = {};
			else categories = results.rows;
		});

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