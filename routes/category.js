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
		done();products

		if(err) req.session.err = "Failure to insert new product";
		else res.redirect("categories");
	});
}

exports.delete = function(req, res){

	var name = req.query.name;

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		client.query("SELECT * FROM product WHERE name = '"+name+"';", function(err, results){

			if(err){
				res.render('failure', {message: err});
			}
			else{
				if(results.rows.length != 0){
					return res.render('failure', {message: 'There are still products left in this category!'});
				}
			}
		});

		client.query("DELETE FROM category WHERE name='"+name+"';", function(err, results){

			done();

			if(err){
				req.session.err = "Can't Delete that!";
				res.redirect("categories");
			}
			else res.redirect("categories");

		});
	});
}