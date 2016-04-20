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

	//console.log("INSERT INTO users VALUES ('"+name+"','"+role+"',"+age+",'"+state+"');");

	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query("INSERT INTO users VALUES ('"+name+"','"+role+"',"+age+",'"+state+"');");
		done();

		if(err) res.render('failure', err);
		else res.render('index');
	})
}

exports.validatelogin = function(req, res){

	var name = req.body.name;

	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query("SELECT * FROM users WHERE name = '"+name+"';", function(err, results){

			done();

			if(err){
				res.render('login', err);
			}
			else{
				if(results.rows.length == 0){
					res.render('login', {message: 'There is no user named ' + name + ' in the database'});
				}
				else{
					res.render('index');
				}
			}
		});
	});
}

//{data: [{...}, {...}]} for purposes of using handlebars