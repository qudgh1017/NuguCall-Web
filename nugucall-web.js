var fs = require('fs');
var http = require('http');
var path = require('path');
var mysql = require('mysql');
var express = require('express');
var SocketServer = require('net');
var WebSocketServer = require('websocket').server;

var SOCKET_UP_PORT = 8081;
var SOCKET_DOWN_PORT = 8082;

var WEB_SERVER_PORT = 8085;

var DEFAULT_PATH = "./public/contents/";

var connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : 'root',
	database : 'nugucall',
	ssl : false
});

var app = express();
app.use(express.static(path.join(__dirname, 'public')));
var webServer = http.createServer(app);
webServer.listen(WEB_SERVER_PORT, function() {
	console.log("web server started.");
});

app.post("/delete_my_contents", function(request, response) {
	request.on('data', function(data) {
		deleteMyContents(data.toString(), response);
	});
});

app.post("/delete_user_contents", function(request, response) {
	request.on('data', function(data) {
		deleteUserContents(data.toString(), response);
	});
});

app.post("/insert_my_contents", function(request, response) {
	request.on('data', function(data) {
		insertMyContents(data.toString(), response);
	});
});

app.post("/select_my_contents", function(request, response) {
	request.on('data', function(data) {
		selectMyContents(data.toString(), response);
	});
});

app.post("/select_user_contents", function(request, response) {
	request.on('data', function(data) {
		selectUserContents(data.toString(), response);
	});
});

app.post("/select_your_contents", function(request, response) {
	request.on('data', function(data) {
		selectYourContents(data.toString(), response);
	});
});

app.post("/update_my_contents", function(request, response) {
	request.on('data', function(data) {
		updateMyContents(data.toString(), response);
	});
});

app.post("/update_user_contents", function(request, response) {
	request.on('data', function(data) {
		updateUserContents(data.toString(), response);
	});
});

app.post("/delete_user_records", function(request, response) {
	request.on('data', function(data) {
		deleteUserRecords(data.toString(), response);
	});
});

app.post("/insert_my_records", function(request, response) {
	request.on('data', function(data) {
		insertMyRecords(data.toString(), response);
	});
});

app.post("/select_user_records", function(request, response) {
	request.on('data', function(data) {
		selectUserRecords(data.toString(), response);
	});
});

app.post("/select_your_records", function(request, response) {
	request.on('data', function(data) {
		selectYourRecords(data.toString(), response);
	});
});

function deleteMyContents(data, response) {
	data = JSON.parse(data);

	var sql = "delete from contents where imei = ?";
	var inserts = [ data.imei ];
	var query = mysql.format(sql, inserts);

	connection.query(query, function(error, results, fields) {
		var json = new Object();
		if (error) {
			json.result = 0;
			console.log("[DB Error] " + error);
		} else {
			json.result = 1;
		}
		response.status(200).send(json);
	});
}

function deleteUserContents(data, response) {
	data = JSON.parse(data);

	var sql = "delete from contents where id = ?";
	var inserts = [ data.id ];
	var query = mysql.format(sql, inserts);

	connection.query(query, function(error, results, fields) {
		var json = new Object();
		if (error) {
			json.result = 0;
			console.log("[DB Error] " + error);
		} else {
			json.result = 1;
		}
		response.status(200).send(json);
	});
}

function insertMyContents(data, response) {
	data = JSON.parse(data);

	var sql = "insert into contents (name, phone, text, source, imei) values (?, ?, ?, ?, ?)";
	var inserts = [ data.name, data.phone, data.text, data.source, data.imei ];
	var query = mysql.format(sql, inserts);

	connection.query(query, function(error, results, fields) {
		var json = new Object();
		if (error) {
			json.result = 0;
			console.log("[DB Error] " + error);
		} else {
			json.result = 1;
		}
		response.status(200).send(json);
	});
}

function selectMyContents(data, response) {
	data = JSON.parse(data);

	var sql = "select * from contents where imei = ?";
	var inserts = [ data.imei ];
	var query = mysql.format(sql, inserts);

	connection.query(query, function(error, results, fields) {
		var json = new Object();
		if (error) {
			json.result = 0;
			console.log("[DB Error] " + error);
		} else {
			json.result = 1;
			json.items = results;
		}
		response.status(200).send(json);
	});
}

function selectUserContents(data, response) {
	data = JSON.parse(data);

	var sql = "select * from contents order by id desc limit ?, ?";
	var inserts = [ data.start, data.count ];
	var query = mysql.format(sql, inserts);

	connection.query(query, function(error, results, fields) {
		var json = new Object();
		if (error) {
			json.result = 0;
			console.log("[DB Error] " + error);
		} else {
			json.result = 1;
			json.items = results;
		}
		response.status(200).send(json);
	});
}

function selectYourContents(data, response) {
	data = JSON.parse(data);

	var sql = "select * from contents where phone = ?";
	var inserts = [ data.phone ];
	var query = mysql.format(sql, inserts);

	connection.query(query, function(error, results, fields) {
		var json = new Object();
		if (error) {
			json.result = 0;
			console.log("[DB Error] " + error);
		} else {
			json.result = 1;
			json.items = results;
		}
		response.status(200).send(json);
	});
}

function updateMyContents(data, response) {
	data = JSON.parse(data);

	var sql = "update contents set name = ?, phone = ?, text = ?, source = ? where imei = ?";
	var inserts = [ data.name, data.phone, data.text, data.source, data.imei ];
	var query = mysql.format(sql, inserts);

	connection.query(query, function(error, results, fields) {
		var json = new Object();
		if (error) {
			json.result = 0;
			console.log("[DB Error] " + error);
		} else {
			json.result = 1;
		}
		response.status(200).send(json);
	});
}

function updateUserContents(data, response) {
	data = JSON.parse(data);

	var sql = "update contents set name = ?, phone = ?, text = ?, source = ?, imei = ? where id = ?";
	var inserts = [ data.name, data.phone, data.text, data.source, data.imei, data.id ];
	var query = mysql.format(sql, inserts);

	connection.query(query, function(error, results, fields) {
		var json = new Object();
		if (error) {
			json.result = 0;
			console.log("[DB Error] " + error);
		} else {
			json.result = 1;
		}
		response.status(200).send(json);
	});
}

function deleteUserRecords(data, response) {
	data = JSON.parse(data);

	var sql = "delete from records where id = ?";
	var inserts = [ data.id ];
	var query = mysql.format(sql, inserts);

	connection.query(query, function(error, results, fields) {
		var json = new Object();
		if (error) {
			json.result = 0;
			console.log("[DB Error] " + error);
		} else {
			json.result = 1;
		}
		response.status(200).send(json);
	});
}

function insertMyRecords(data, response) {
	data = JSON.parse(data);

	var sql = "insert into records (sender, receiver, imei, time) values (?, ?, ?, ?)";
	var inserts = [ data.sender, data.receiver, data.imei, data.time ];
	var query = mysql.format(sql, inserts);

	connection.query(query, function(error, results, fields) {
		var json = new Object();
		if (error) {
			json.result = 0;
			console.log("[DB Error] " + error);
		} else {
			json.result = 1;
		}
		response.status(200).send(json);
	});
}

function selectUserRecords(data, response) {
	data = JSON.parse(data);

	var sql = "select * from records order by id desc limit ?, ?";
	var inserts = [ data.start, data.count ];
	var query = mysql.format(sql, inserts);

	connection.query(query, function(error, results, fields) {
		var json = new Object();
		if (error) {
			json.result = 0;
			console.log("[DB Error] " + error);
		} else {
			json.result = 1;
			json.items = results;
		}
		response.status(200).send(json);
	});
}

function selectYourRecords(data, response) {
	data = JSON.parse(data);

	var sql = "select c.imei, r.imei from contents c, records r where c.phone = ? and r.sender = ? and r.receiver = ?";
	var inserts = [ data.sender, data.sender, data.receiver ];
	var query = mysql.format(sql, inserts);

	connection.query(query, function(error, results, fields) {
		var json = new Object();
		if (error) {
			json.result = 0;
			console.log("[DB Error] " + error);
		} else {
			// 조작 여부 판단이 필요함. 현재는 미구현 상태.
			json.result = 1;
			console.log(results);
		}
		response.status(200).send(json);
	});
}

function getCurrentTime() {
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
	if (month < 10) {
		month = "0" + month;
	}
	if (day < 10) {
		day = "0" + day;
	}
	if (hours < 10) {
		hours = "0" + hours;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	return year + "" + month + "" + day + "" + hours + "" + minutes + "" + seconds;
}

var uploadSocketServer = SocketServer.createServer(function(socket) {

	var fileName;
	var fileSize;
	var writeStream;
	var check;
	var isFileData = false;

	socket.on('data', function(message) {
		if (!isFileData) {
			var json = JSON.parse(message.toString());
			fileName = json.fileName; // 기존 파일명 + 확장자
			fileName = getCurrentTime() + fileName.substr(fileName.lastIndexOf('.')).toLowerCase(); // 수정 파일명 + 확장자
			fileSize = parseInt(json.fileSize); // 파일 크기
			writeStream = fs.createWriteStream(DEFAULT_PATH + fileName);
			check = 0;
			isFileData = true;
			
			var obj = new Object();
			obj.fileName = fileName;
			socket.write(obj + "\n", 'utf8');
		} else {
			writeStream.write(message);
			check += message.length;
			if (check === fileSize) {
				writeStream.end();
				isFileData = false;
				console.log("클라이언트에서 파일을 업로드하였습니다.");
			}
		}
	});

	socket.on('error', function(error) {
		console.log("[Error] UploadSocket " + error);
	});

	socket.on('close', function(error) {

	});
});
uploadSocketServer.listen(SOCKET_UP_PORT);

var downloadSocketServer = SocketServer.createServer(function(socket) {

	socket.on('data', function(message) {
		var json = JSON.parse(message.toString());
		var fileName = json.fileName;
		
		var stats = fs.statSync(DEFAULT_PATH + fileName);
		
		var obj = new Object();
		obj.fileSize = stats.size;
		socket.write(obj + "\n", 'utf8');
		
		var readStream = fs.createReadStream(DEFAULT_PATH + fileName);
		
		readStream.on('data', function(data) {
			socket.write(data);
		});
		readStream.on('end', function() {
			console.log("클라이언트에서 파일을 다운로드하였습니다.");
		});
	});

	socket.on('error', function(error) {
		console.log("[Error] DownloadSocket " + error);
	});

	socket.on('close', function(error) {

	});
});
downloadSocketServer.listen(SOCKET_DOWN_PORT);

var webSocketServer = new WebSocketServer({
	httpServer : webServer,
});
webSocketServer.on('request', function(request) {

	var socket = request.accept('nugucall', request.origin);

	socket.on('message', function(message) {

	});

	socket.on('error', function(error) {
		console.log("[Error] WebSocket Error: " + error.message);
	});

	socket.on('close', function(error) {

	});
});