var pg = require("pg");

exports.view = function(req, res){

	//check our session to render either categories or categoriesowner
	res.render("categoriesowner");
}

exports.add = function(req, res){

	var name = req.body.name;
	var description = req.body.description;

	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query("INSERT INTO category VALUES ('"+name+"','"+description+"');");
		done();

		if(err) console.log(err);
		else res.redirect("categoriesowner");
	})
}