var fs = require('fs'),
    qs = require('qs'),
    BufferStream = require('bufferstream'),
    http = require('http'),
    app = http.createServer(handler).listen(3000),
    io = require('socket.io').listen(app),
    key = require('./config.js'),
    hyperquest = require('hyperquest');


stream_key = key.key.stream;
var apikey = qs.stringify({key : stream_key});
var url = "http://stream.embed.ly?" + apikey;
var uniques = [];
var UNIQUES_SIZE = 300;
var timeout;

io.set('log level', 1);

var bs = new BufferStream({size:'flexible'});
bs.enable();

bs.on("error", function(e){
  console.log(e);
});

function startStream(){
  bs.reset();
  console.log('start stream');
  var r = hyperquest(url);
  r.pipe(bs);
  r.on('close', function(){
    console.log('stream closed');
    process.exit();

  });
  r.on('error', function(err){
    console.log(err.message);
  });
}

function emitUniqueThumb(line){
  var data = JSON.parse(line);
  if(data['embed']){
    var thumb = data['embed']['thumbnail_url'];
    if (uniques.indexOf(thumb) === -1){
      uniques.push(thumb);
      if(uniques.length > UNIQUES_SIZE){
        uniques.shift();
      }
      bs.emit('data',data);
    }
  }
}

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

startStream();

bs.split("\n", function(line){

  if(timeout){
    clearTimeout(timeout)
  }
  timeout = setTimeout(function(){
    console.error('stream timeout occurred');
    process.exit();
  },20000);

  try{
    emitUniqueThumb(line);
  }
  catch(e){
    console.error(e.stack);
    console.log(line.toString());
  }
});

io.sockets.on('connection', function (socket) {
  console.log("socket connected");
  bs.on('data', function(data){
    socket.emit('stream', { data: data });
  });
  socket.on('disconnect', function (socket) {
    console.log('socket closed');
  });
});


