var pg = require("pg");

exports.view = function(req, res){

	var categories = [];

	var products = [];

	var search = req.query.product;

	var category = req.query.cat;

	req.session.category = category;

	req.session.product = search;

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query("SELECT * FROM category;");

		query.on('row', function(row){
			categories.push(row);
		});

		query.on("error", function(err){
			done();
			return res.render("failure", {message: err});
		});

		query.on('end', function(){

			query = client.query("SELECT * FROM product WHERE name LIKE '%"+search+"%' AND category LIKE '%"+category+"%';");

			query.on('row', function(row){
				products.push(row);
			});

			query.on("error", function(err){
				done();
				return res.render("failure", {message: err});
			});

			query.on('end', function(){
				done();
				res.render("products", {products: products, categories: categories});
			});
		});
	});
}

exports.browse = function(req, res){

	var categories = [];

	var products = [];

	var search = req.query.product;

	var category = req.query.cat;

	req.session.category = category;

	req.session.product = search;

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query("SELECT * FROM category;");

		query.on('row', function(row){
			categories.push(row);
		});

		query.on("error", function(err){
			done();
			return res.render("failure", {message: err});
		});

		query.on('end', function(){

			query = client.query("SELECT * FROM product WHERE name LIKE '%"+search+"%' AND category LIKE '%"+category+"%';");

			query.on('row', function(row){
				products.push(row);
			});

			query.on("error", function(err){
				done();
				return res.render("failure", {message: err});
			});

			query.on('end', function(){
				done();
				res.render("browseproducts", {products: products, categories: categories});
			});
		});
	});
}

exports.search = function(req, res){

	var category = req.body.category;

	var product = req.body.search;

	res.redirect("/products?cat="+category+"&product="+product);

}

exports.searchcustomer = function(req, res){

	var category = req.body.category;

	var product = req.body.search;

	res.redirect("/browseproducts?cat="+category+"&product="+product);
}

exports.viewcart = function(req, res){

	var currentProduct = [];

	var cart = [];

	var name = req.query.name; //name of current item

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query("SELECT * FROM product WHERE name = '"+name+"'");

		query.on('row', function(row){
			currentProduct.push(row);
		});

		query.on("error", function(err){
			done();
			return res.render("failure", {message: err});
		});

		query.on('end', function(){

			query = client.query("SELECT * FROM cart WHERE name = '"+req.session.user+"'");

			query.on('row', function(row){
				cart.push(row);
			});

			query.on("error", function(err){
				done();
				return res.render("failure", {message: err});
			});

			query.on('end', function(){
				done();
				res.render("productorder", {current: currentProduct, cart: cart});
			});
		});
	});
}

exports.buycart = function(req, res){

	var cart = [];

	var total = 0;

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query("SELECT * FROM cart WHERE name = '"+req.session.user+"'");

		query.on('row', function(row){
			cart.push(row);
		});

		query.on("error", function(err){
			done();
			return res.render("failure", {message: err});
		});

		query.on('end', function(){
			done();
			
			for(var i = 0; i < cart.length; i++){
				cart[i].total = cart[i].price * cart[i].quantity;
				total += cart[i].price * cart[i].quantity;
			}

			res.render("buycart", {cart: cart, total: total.toFixed(2)});
		});
	});
}

exports.addtocart = function(req, res){

	var quantity = req.body.quantity; 
	var pname = req.body.name;
	var name = req.session.user;
	var price = parseFloat(req.body.price);
	var sku = req.body.sku;

	var cart = [];

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query("SELECT * FROM cart WHERE name = '"+name+"' AND pname = '"+pname+"';");

		query.on('row', function(row){
			cart.push(row);
		});

		query.on("error", function(err){
			return res.render("failure", {message: "There was a problem adding to cart"});
		});

		query.on("end", function(err){

			//first time item is added to cart
			if(cart.length == 0){

				query = client.query("INSERT INTO cart VALUES('"+name+"', '"+pname+"', "+price+", "+quantity+", '"+sku+"');");

				query.on('error', function(err){
					res.render("failure", {message: err + "here"});
				});

				query.on('end', function(){
					done();
					res.redirect("/products?cat=&product=");
				});
			}
			//adding additional quantity onto existing cart item
			else{

				query = client.query("UPDATE cart SET quantity = quantity +"+quantity+" WHERE name = '"+name+"' AND pname = '"+pname+"';");

				query.on('error', function(err){
					res.render("failure", {message: err});
				});

				query.on('end', function(){
					done();
					res.redirect("/products?cat=&product=");
				});
			}
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

			if(err){

				req.session.err = "Failure to insert new product";

				res.redirect("/products?cat="+req.session.category+"&product="+req.session.product);
			}

			else{

				client.query("UPDATE category SET pnum = pnum + 1 WHERE name = '"+category+"'");

				done();

				req.session.err = "Product inserted successfully";

				res.redirect("/products?cat="+req.session.category+"&product="+req.session.product);
			}
		});
	});	
}

exports.update = function(req, res){

	var name = req.body.name;
	var price = parseFloat(req.body.price);
	var nameO = req.body.nameO;
	var sku = req.body.sku;
	var category = req.body.category;

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query("UPDATE product SET name = '"+name+"', sku = '"+sku+"', category = '"+category+"', price = "+price+" WHERE name = '"+nameO+"';");

		query.on('error', function(error){
			done();
			req.session.err = "Failure to update product";
			res.redirect("/products?cat="+req.session.category+"&product="+req.session.product);
		});

		query.on('end', function(){
			done();
			res.redirect("/products?cat="+req.session.category+"&product="+req.session.product);
		});
	});
}

exports.delete = function(req, res){

	var name = req.query.name;

	var category = [];

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		//select product name, save category
		var query = client.query("SELECT category FROM product WHERE name = '"+name+"';");

		query.on('row', function(row){
			category.push(row);
		});

		query.on('error', function(error){
			done();
			return res.render("failure", {message: 'Error deleting product!'});
		});

		query.on('end', function(results){

			//delete product
			query = client.query("DELETE FROM product WHERE name='"+name+"';");

			query.on('error', function(error){
				done();
				return res.render("failure", {message: 'Error deleting product!'});
			});

			query.on('end', function(results){

				//update category count
				query = client.query("UPDATE category SET pnum = pnum - 1 WHERE name = '"+category[0].category+"';");

				query.on('error', function(error){
					done();
					res.render("failure", {message: error});
				});

				query.on('end', function(){

					done();
					res.redirect("/products?cat="+req.session.category+"&product="+req.session.product);
				});
			});
		});
	});
}

exports.browsecategory = function(req, res){

	var name = req.query.cat;

	var category = [];

	var products = [];

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query("SELECT * FROM category");

		query.on('row', function(row){
			category.push(row);
		});

		query.on('error', function(error){
			done();
			return res.render("failure", {message: error});
		});

		query.on('end', function(){

			query = client.query("SELECT * FROM product WHERE category='"+name+"';");

			query.on('row', function(row){
				products.push(row);
			});

			query.on('error', function(error){
				done();
				return res.render("failure", {message: error});
			});

			query.on('end', function(){
				res.render("productbrowse", {categories: category, products: products});
			});
		});
	})
}

exports.checkout = function(req, res){

	var card = req.body.creditcard;

	var cart = [];

	var total = 0;

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query("SELECT * FROM cart WHERE name = '"+req.session.user+"'");

		query.on('row', function(row){
			cart.push(row);
		});

		query.on('error', function(error){
			done();
			return res.render("failure", {message: error});
		});

		query.on('end', function(){

			for(var i = 0; i < cart.length; i++){
				cart[i].total = cart[i].price * cart[i].quantity;
				total += cart[i].price * cart[i].quantity;
			}

			res.render("confirmation", {cart: cart, total: total.toFixed(2)});

			//insert into cartdata the data from the purchased cart and a timestamp
			query = client.query("INSERT INTO cartdata SELECT name, pname, price, quantity, CURRENT_TIMESTAMP, sku FROM cart WHERE name = '"+req.session.user+"';");

			query.on('error', function(error){
				done();
				return res.render("failure", {message: error});
			});

			query.on('end', function(){
				query = client.query("DELETE FROM cart WHERE name = '"+req.session.user+"';");

				query.on('error', function(error){
					done();
					return res.render("failure", {message: error});
				});

				query.on('end', function(){
					done();
	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query("SELECT * FROM category;");

		query.on('row', function(row){
			categories.push(row);
		});

		query.on("error", function(err){
			done();
			return res.render("failure", {message: err});
		});

		query.on('end', function(){

			query = client.query("SELECT * FROM product WHERE name LIKE '%"+search+"%' AND category LIKE '%"+category+"%';");

			query.on('row', function(row){
				products.push(row);
			});

			query.on("error", function(err){
				done();
				return res.render("failure", {message: err});
			});

			query.on('end', function(){
				done();
				res.render("products", {products: products, categ
				});
			});
		});
	});
}
