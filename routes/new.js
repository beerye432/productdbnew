var pg = require("pg");


exports.view = function(req, res){
	pg.connect('postgres://localhost:5432/brian', function(err, client, done){

		console.log("connected");
	});
}