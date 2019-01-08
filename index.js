var isImageUrl = require('is-image-url');
var getTitleAtUrl = require('url-to-title');
var getYouTubeID = require('get-youtube-id');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

//routes for files
app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/pages/index.html');
});

app.get('/styles.css', function(req, res){
  res.sendFile(__dirname + '/public/style.css');
});

app.get('/favicon.ico', function(req, res){
  res.sendFile(__dirname + '/views/icons/favicon.ico');
});

app.get('/paper-plane.svg', function(req, res){
  res.sendFile(__dirname + '/views/icons/paper-plane.svg');
});

app.get('/script.js', function(req, res){
  res.sendFile(__dirname + '/public/script.js');
});

app.get('/notify.js', function(req, res){
  res.sendFile(__dirname + '/public/notify.js');
});

//socket io handling
io.on('connection', function(socket){
  socket.on('chat message', function(msg){

    let chkmsg = JSON.parse(msg);
    chkmsg = chkmsg.message;
    let isEmpty = (chkmsg === "" || !chkmsg.replace(/\s/g, '').length);
    if (!isEmpty) io.emit('chat message', msg);

    //message contains url
    let expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    let youtube = /(?:youtube\.[a-z]+.?[a-z]+\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/gi;

    if(expression.test(chkmsg)) {
      let urls = chkmsg.match(expression);
      msg = JSON.parse(msg);

      //handle more one or more url(s) in a message
      urls.forEach(url => {
        //add http:// to url if not present
        url = addhttp(url).toString();

        //build the message
        fullmsg = { "author": msg.author , "message": url };
        fullmsg = JSON.stringify(fullmsg);

        //check if url is image
        if(isImageUrl(url)){
          io.emit('image', fullmsg);

        //check for youtube
        } else if(youtube.test(url)){
          let id = getYouTubeID(url);
          let ytmsg = { "author": msg.author , "id":  id};
          ytmsg = JSON.stringify(ytmsg);
          io.emit('youtube', ytmsg);
         
        // if url is "normal" 
        } else {
          //get the title from the webpage
          getTitleAtUrl(url).then(function(title) {
            let urlmsg = { "author": msg.author , "url":  url, "title": title };
            urlmsg = JSON.stringify(urlmsg);
            io.emit('url', urlmsg);

          //if title can't be resolved, fallback to raw url  
          }).catch((err) => {
            fullmsg = { "author": msg.author , "message": url };
            fullmsg = JSON.stringify(fullmsg);
            io.emit('rawurl', fullmsg);
          });
        }
      });
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
