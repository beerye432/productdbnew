// Node.js Dependencies
const http = require("http");
const path = require("path");

//app dependencies
var express = require('express');
var handlebars = require('express-handlebars');
var pg = require('pg');
var session = require('express-session');
var cookieParser = require('cookie-parser');

var app = express();

var router = {
    index: require("./routes/index"),
    category: require("./routes/category"),
    product: require("./routes/product")
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
app.use(cookieParser());

app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'qwerty'
}));

//session middleware


// Routes
app.get("/", router.index.view); 

app.get("/login", router.index.login);

app.get("/signup", function(req, res){
  res.render("signup");
});

function restrict(req, res, next){
  if(req.session.role == "owner"){
    next();
  }
  else{
    res.redirect("/failure");
  }
}

app.get("/sesserror", function(req, res){

  res.json({message: req.session.err});

  req.session.err = "";

});

app.get("/getname", function(req, res){
  res.json({name: res.session.user});
});

app.get("/failure", function(req, res){
  res.render("failure");
});

app.get("/categories", restrict,  router.category.view);

app.get("/products", restrict, router.product.view);

app.post("/validatelogin", function(req, res){

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

          req.session.regenerate(function(){
            req.session.user = results.rows[0].name;
            req.session.role = results.rows[0].role;

            res.redirect("/");
          }); 
        }
      }
    });
  });
});

app.post("/validate", router.index.validate);

app.post("/addcategory", router.category.add);

app.post("/addproduct", router.product.add);


// Start Server
http.createServer(app).listen(app.get("port"), function() {
    console.log("Express server listening on port " + app.get("port"));
});
