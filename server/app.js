var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sys = require('sys');
var exec = require('child_process').exec;


function puts(error, stdout, stderr) {sys.puts(stdout)}

var beatIndex = 0;
var beats = [{
	tempo:2,
	intensity:.8
},{
	tempo:8,
	intensity:.8
},{
	tempo:16,
	intensity:.8
},{
	tempo:16,
	intensity:.4
},{
	tempo:16,
	intensity:.8
},{
	tempo:8,
	intensity:0
}];


// ROUTES
app.get('/message', function(req, res){
	res.json({});
	console.log(req.query);
	exec("curl -i -X PUT https://api-m2x.att.com/v1/feeds/700fcfecb399a980fdfd01761d7717a8/streams/pulse-data/value -H \"X-M2X-KEY: 6940c60b4add59b2e1dcfbe35a81724f\" -H \"Content-Type: application/json\" -d '{ \"value\": "+req.query.tempo+" }'", puts);
	io.emit('message', req.query);
});


app.get('/next', function(req, res){
	res.json({});
	var nextBeat = beats[beatIndex];
	beatIndex++;
	if(beatIndex >= beats.length) {
		beatIndex = 0;
	}
	exec("curl -i -X PUT https://api-m2x.att.com/v1/feeds/700fcfecb399a980fdfd01761d7717a8/streams/pulse-data/value -H \"X-M2X-KEY: 6940c60b4add59b2e1dcfbe35a81724f\" -H \"Content-Type: application/json\" -d '{ \"value\": "+nextBeat.tempo+" }'", puts);
	io.emit('message', nextBeat);
});



app.use(express.static(__dirname));

app.get('/', function(req, res){
	res.sendfile('index.html');
});

// SOCKETS
io.on('connection', function(socket){
	socket.on('disconnect', function(){
	});
	socket.on('message', function(msg){
		io.emit('message', msg);
	});
});

http.listen(80, function(){
	console.log('listening on port 80');
});
