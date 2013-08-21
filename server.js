var request = require('request'),
    fs = require('fs'),
    qs = require('qs'),
    BufferStream = require('bufferstream'),
    app = require('http').createServer(handler).listen(3000),
    io = require('socket.io').listen(app),
    key = require('./config.js');

stream_key = key.key.stream;
var apikey = qs.stringify({key : stream_key});
var url = "http://stream.embed.ly?" + apikey;

var bs = new BufferStream({size:'flexible'});
bs.enable();

request.get(url).pipe(bs);

bs.split("\n", function(line){
  bs.emit('data',line);
});

io.sockets.on('connection', function (socket) {
  bs.on('data', function(chunk){
    socket.emit('stream', { data: JSON.parse(chunk.toString()) });
  });
});

function handler (req, res) {
  if(req.url === "/thumbnail-river"){
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
          if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
          }
          res.writeHead(200);
          res.end(data);
        });
  }
  else{
    fs.readFile(__dirname + req.url, function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' +req.url);
      }
      res.writeHead(200);
      res.end(data);
    });
  }
}
