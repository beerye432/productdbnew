var pg = require("pg");

exports.view = function(req, res) {

	res.render("index");
}

exports.login = function(req, res){

	res.render("login");
}

exports.validate = function(req, res){

	var name = req.body.name;
	var role = req.body.role;
	var age = req.body.age;
	var state = req.body.state;

	pg.connect(process.env.DATABASE_URL, function(err, client, done){

		var query = client.query("INSERT INTO users VALUES ('"+name+"','"+role+"',"+age+",'"+state+"');");

		query.on('error', function(error){

			done();

			res.render("failure", {message: "Your signup failed"});
		});

		query.on('end', function(){

			done();

			res.render("failure", {message: "You have successfully signed up"});
		});
	})
}

//{data: [{...}, {...}]} for purposes of using handlebars