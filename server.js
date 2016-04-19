// Node.js Dependencies
const http = require("http");
const path = require("path");

//app dependencies
var express = require('express');
var handlebars = require('express-handlebars');
var pg = require('pg');
var sessions = require('express-session');

var app = express();

var router = {
    index: require("./routes/index")
};

var parser = {
    body: require("body-parser")
};

// Middleware
app.set("port", process.env.PORT || 3000);
app.engine("html", handlebars());
app.set("view engine", "html");
app.set("views", __dirname + "/views");
app.use(express.static(path.join(__dirname, "public")));
app.use(parser.body.urlencoded({ extended: true }));
app.use(parser.body.json());

// Routes
app.get("/", router.index.view); 

app.get("/login", router.index.login);

app.get("/signup", function(req, res){
  res.render("signup");
});

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('index', {results: result.rows} ); }
    });
  });
})

app.get('/create', function(result, res){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query('INSERT INTO test_table VALUES (1);');
		done();
		if(err) console.error(err);
		else res.render('index');
	})
})

app.post("/validate", router.index.validate);

// Start Server
http.createServer(app).listen(app.get("port"), function() {
    console.log("Express server listening on port " + app.get("port"));
});
