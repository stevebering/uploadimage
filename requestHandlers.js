var exec = require("child_process").exec;
var querystring = require("querystring"),
			fs = require("fs"),
			formidable = require("formidable");

function start(response, request) {
	console.log("Request handler 'start' was called.");

	var body = '<html>' + 
		'<head>' + 
		'<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' + 
		'</head>' + 
		'<body>' + 
		'<form action="/upload" enctype="multipart/form-data" method="post">' + 
		'<input type="file" name="upload"></input>' + 
		'<input type="submit" value="Upload File" />' +
		'</form>' +
		'</body>' + 
		'</html>';

		response.writeHead(200, {"Content-Type": "text/html"});
		response.write(body);
		response.end();
}

function list(response, request) {
	console.log("Request handler 'list' was called.");

	exec("dir",
		{ timeout: 10000, maxBuffer: 20000*1024 },
		function (error, stdout, stderr) {
			response.writeHead(200, {"Content-Type": "text/plain"});
			response.write(stdout);
			response.end();
		})
}

function upload(response, request) {
	console.log("Request handler 'upload' was called.");
	var fileSaveAsName = "/tmp/test.png";
	var form = new formidable.IncomingForm();
	console.log("about to parse");
	form.parse(request, function(error, fields, files) {
		console.log("parsing done");

		/* since these files could be on another drive, we cannot rename, 
		   so we will read the file contents, then write to our new file */
		fs.readFile(files.upload.path, function(err, data) {
			if (err) throw err;
			console.log("reading file contents from " + files.upload.path);
			fs.writeFile(fileSaveAsName, data, function(err) {
				if (err) throw err;
				console.log("writing file contents to " + fileSaveAsName);
				fs.unlink(files.upload.path, function(err) {
					if (err) throw err;
					console.log("removed file at " + files.upload.path);
				});	
			});
		});

		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("Received image:<br />" + 
			"<img src='/show' />");
		response.end();
	});
}

function show(response, request) {
	console.log("Request handler 'show' was called.");
	fs.readFile("/tmp/test.png", "binary", function(error, file) {
		if (error) {
			response.writeHead(500, {"Content-Type": "text/plain"});
			response.write(error + "\n");
			response.end();
		} else {
			response.writeHead(200, {"Content-Type": "image/png"});
			response.write(file, "binary");
			response.end();
		}
	});
}

exports.start = start;
exports.upload = upload;
exports.list = list;
exports.show = show;