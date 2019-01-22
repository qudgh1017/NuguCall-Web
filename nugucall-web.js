
// 모듈 변수 선언

var fs = require('fs');
var http = require('http');
var path = require('path');
var mysql = require('mysql');
var express = require('express');
var SocketServer = require('net');
var WebSocketServer = require('websocket').server;

// 포트 정의
var SOCKET_UP_PORT = 8081;
var SOCKET_DOWN_PORT = 8082;

var WEB_SERVER_PORT = 8085;

// 컨텐츠가 저장될 기본 경로
var DEFAULT_PATH = "./public/contents/";

// MySQL 통신 변수 선언
var connection = mysql.createConnection({
	host : 'localhost', // 내 컴퓨터
	user : 'root', // 계정
	password : 'root', // 비밀번호
	database : 'nugucall', // 데이터베이스명
	ssl : false
});

// 웹 서버 구동 (안드로이드 & 웹 Back-end DB 통신)
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
var webServer = http.createServer(app);
webServer.listen(WEB_SERVER_PORT, function() {
	console.log("web server started.");
});

app.all('/*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

// 본인 컨텐츠 삭제
app.post("/delete_my_contents", function(request, response) {
	request.on('data', function(data) {
		deleteMyContents(data.toString(), response);
	});
});

// 사용자 컨텐츠 삭제
app.post("/delete_user_contents", function(request, response) {
	request.on('data', function(data) {
		deleteUserContents(data.toString(), response);
	});
});

// 본인 컨텐츠 삽입
app.post("/insert_my_contents", function(request, response) {
	request.on('data', function(data) {
		insertMyContents(data.toString(), response);
	});
});

// 본인 컨텐츠 조회
app.post("/select_my_contents", function(request, response) {
	request.on('data', function(data) {
		selectMyContents(data.toString(), response);
	});
});

// 사용자 컨텐츠 조회
app.post("/select_user_contents", function(request, response) {
	request.on('data', function(data) {
		selectUserContents(data.toString(), response);
	});
});

// 사용자 컨텐츠 개수 조회
app.post("/select_user_contents_count", function(request, response) {
	request.on('data', function(data) {
		selectUserContentsCount(response);
	});
});

// 상대 컨텐츠 조회
app.post("/select_your_contents", function(request, response) {
	request.on('data', function(data) {
		selectYourContents(data.toString(), response);
	});
});

// 본인 컨텐츠 수정
app.post("/update_my_contents", function(request, response) {
	request.on('data', function(data) {
		updateMyContents(data.toString(), response);
	});
});

// 사용자 컨텐츠 수정
app.post("/update_user_contents", function(request, response) {
	request.on('data', function(data) {
		updateUserContents(data.toString(), response);
	});
});

// 사용자 발신기록 삭제
app.post("/delete_user_records", function(request, response) {
	request.on('data', function(data) {
		deleteUserRecords(data.toString(), response);
	});
});

// 본인 발신기록 삽입
app.post("/insert_my_records", function(request, response) {
	request.on('data', function(data) {
		insertMyRecords(data.toString(), response);
	});
});

// 사용자 발신기록 조회
app.post("/select_user_records", function(request, response) {
	request.on('data', function(data) {
		selectUserRecords(data.toString(), response);
	});
});

// 상대 발신기록 조회
app.post("/select_your_records", function(request, response) {
	request.on('data', function(data) {
		selectYourRecords(data.toString(), response);
	});
});

function deleteMyContents(data, response) {
	try {
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
	} catch (e) {
		console.log(e);
	}
}

function deleteUserContents(data, response) {
	try {
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
	} catch (e) {
		console.log(e);
	}
}

function insertMyContents(data, response) {
	try {
		data = JSON.parse(data);

		var sql = "insert into contents (name, phone, text, source, size, imei) values (?, ?, ?, ?, ?, ?)";
		var inserts = [ data.name, data.phone, data.text, data.source, data.size, data.imei ];
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
	} catch (e) {
		console.log(e);
	}
}

function selectMyContents(data, response) {
	try {
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
	} catch (e) {
		console.log(e);
	}
}

function selectUserContents(data, response) {
	try {
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
	} catch (e) {
		console.log(e);
	}
}

function selectUserContentsCount(response) {
	try {
		var sql = "select count(*) from contents";
		var query = mysql.format(sql);

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
	} catch (e) {
		console.log(e);
	}
}

function selectYourContents(data, response) {
	try {
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
	} catch (e) {
		console.log(e);
	}
}

function updateMyContents(data, response) {
	try {
		data = JSON.parse(data);

		var sql = "update contents set name = ?, phone = ?, text = ?, source = ?, size = ? where imei = ?";
		var inserts = [ data.name, data.phone, data.text, data.source, data.size, data.imei ];
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
	} catch (e) {
		console.log(e);
	}
}

function updateUserContents(data, response) {
	try {
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
	} catch (e) {
		console.log(e);
	}
}

function deleteUserRecords(data, response) {
	try {
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
	} catch (e) {
		console.log(e);
	}
}

function insertMyRecords(data, response) {
	try {
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
	} catch (e) {
		console.log(e);
	}
}

function selectUserRecords(data, response) {
	try {
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
	} catch (e) {
		console.log(e);
	}
}

function selectYourRecords(data, response) {
	try {
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
				// console.log(results);
			}
			response.status(200).send(json);
		});
	} catch (e) {
		console.log(e);
	}
}

// 현재 시각을 가져와서 파일 이름으로 설정
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

// 안드로이드 파일 전송
var uploadSocketServer = SocketServer.createServer(function(socket) {

	var fileName;
	var fileSize;
	var writeStream;
	var check;
	var isFileData = false; // 문자열 또는 이진 데이터 구분 

	socket.on('data', function(message) {
		try {
			if (!isFileData) { // 처음에는 문자열 데이터 수신
				var json = JSON.parse(message.toString());
				fileName = json.fileName; // 기존 파일명 + 확장자
				fileName = getCurrentTime() + fileName.substr(fileName.lastIndexOf('.')).toLowerCase(); // 수정 파일명 + 확장자
				fileSize = parseInt(json.fileSize); // 파일 크기

				writeStream = fs.createWriteStream(DEFAULT_PATH + fileName);
				check = 0;
				isFileData = true; // 이진 데이터 수신으로 변경

				var obj = new Object();
				obj.fileName = fileName;
				obj.fileSize = fileSize;
				var str = JSON.stringify(obj);
				socket.write(str + "\n", 'utf8'); // 시작하자 알림
			} else { // 이진 데이터 수신
				writeStream.write(message);
				check += message.length;
				if (check === fileSize) {
					writeStream.end();
					isFileData = false;
					console.log("클라이언트(안드로이드)에서 파일을 업로드하였습니다.");
				}
			}
		} catch (e) {
			console.log(e);
		}
	});

	socket.on('error', function(error) {
		console.log("[Error] UploadSocket " + error);
	});

	socket.on('close', function(error) {

	});
});
uploadSocketServer.listen(SOCKET_UP_PORT);

// 안드로이드 파일 전송
var downloadSocketServer = SocketServer.createServer(function(socket) {

	socket.on('data', function(message) {
		try {
			var json = JSON.parse(message.toString());
			var fileName = json.fileName;
			var fileSize = json.fileSize;

			var readStream = fs.createReadStream(DEFAULT_PATH + fileName);
			readStream.on('data', function(data) {
				socket.write(data);
			});
			readStream.on('end', function() {
				console.log("클라이언트에서 파일을 다운로드하였습니다.");
			});
		} catch (e) {
			console.log(e);
		}
	});

	socket.on('error', function(error) {
		console.log("[Error] DownloadSocket " + error);
	});

	socket.on('close', function(error) {

	});
});
downloadSocketServer.listen(SOCKET_DOWN_PORT);

// 웹 파일 전송
var webSocketServer = new WebSocketServer({
	httpServer : webServer,
});
webSocketServer.on('request', function(request) {

	var socket = request.accept('nugucall', request.origin);

	var fileName;
	var fileSize;
	var writeStream;
	var check;
	var isFileData = false;

	socket.on('message', function(message) {
		try {
			if (!isFileData) {
				var json = JSON.parse(message.utf8Data);
				fileName = json.fileName; // 기존 파일명 + 확장자
				fileName = getCurrentTime() + fileName.substr(fileName.lastIndexOf('.')).toLowerCase(); // 수정 파일명 + 확장자
				fileSize = parseInt(json.fileSize); // 파일 크기

				writeStream = fs.createWriteStream(DEFAULT_PATH + fileName);
				check = 0;
				isFileData = true;

				var obj = new Object();
				obj.fileName = fileName;
				obj.fileSize = fileSize;
				var str = JSON.stringify(obj);
				socket.sendUTF(str);
			} else {
				writeStream.write(message.binaryData);
				check += message.binaryData.length;
				if (check === fileSize) {
					writeStream.end();
					isFileData = false;
					console.log("클라이언트(웹)에서 파일을 업로드하였습니다.");
				}
			}
		} catch (e) {
			console.log(e);
		}
	});

	socket.on('error', function(error) {

	});

	socket.on('close', function(error) {

	});
});