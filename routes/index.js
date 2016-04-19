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

//{data: [{...}, {...}]} for purposes of using handlebars