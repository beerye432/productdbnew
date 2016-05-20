var async = require("async");

var a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

var b = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

async.each(a, function(a, callback1){

	async.each(b, function(b, callback2){

		console.log("a: " + a + " b: " + b);

		callback2();

	}, function(err){

		callback1();

	});

}, function(err){

	console.log("all done");
});

//NESTED ASYNC