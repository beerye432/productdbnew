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
		client.query("INSERT INTO product VALUES ('"+name+"','"+sku+"','"+category+"',"+price+");");
		done();

		if(err) console.log(err);
		else res.redirect("products");
	});
}