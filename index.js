var isImageUrl = require('is-image-url');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/pages/index.html');
});

app.get('/styles.css', function(req, res){
  res.sendFile(__dirname + '/public/style.css');
});

app.get('/script.js', function(req, res){
  res.sendFile(__dirname + '/public/script.js');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){

    let chkmsg = JSON.parse(msg);
    let isEmpty = (chkmsg.message === "" || !chkmsg.message.replace(/\s/g, '').length);
    if (!isEmpty) io.emit('chat message', msg);

    //message contains url
    let expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    let regex = new RegExp(expression);

    if(expression.test(msg)) {
      url = msg.match(expression);
      url = addhttp(url);
      url = url.toString();

      msg = JSON.parse(msg);

      fullmsg = { "author": msg.author , "message": url };
      fullmsg = JSON.stringify(fullmsg);

      //check if url is image
      if(isImageUrl(url)){
        io.emit('image', fullmsg);
      }
      else{
        io.emit('url', fullmsg);
      }

    }

  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});


function addhttp(url) {
  if (!/^(f|ht)tps?:\/\//i.test(url)) {
     url = "http://" + url;
  }
  return url;
}
