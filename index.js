var isImageUrl = require('is-image-url');
var getTitleAtUrl = require('url-to-title');
var getYouTubeID = require('get-youtube-id');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var messages = new Array();

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

    //checking for a new connection
    socket.on('new connection', function() {
      
    //get id of newly connected client
    var id = socket.id;

    //send old messages to new client 
    for (let i = 0; i < messages.length; i++) {
        let oldmsg = messages[i];

        //only mark the last message as "new"
        if(i === (messages.length - 1)){
          oldmsg = JSON.parse(oldmsg);
          oldmsg.isNew = 1;
          oldmsg = JSON.stringify(oldmsg);
        }

        parseMessage(oldmsg, true, id);
      
    }
  });
  

  socket.on('chat message', function(msg){

    let currentDate = new Date();

    msg = JSON.parse(msg);
    msg.time = currentDate.getTime();
    msg = JSON.stringify(msg);

    //add message to array
    if(!(JSON.parse(msg).message === "")){
      messages.push(msg);
    }

    msg = JSON.parse(msg);
    msg.isNew = 1;
    msg = JSON.stringify(msg);

    //send message out to connected clients
    parseMessage(msg, false);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});

//function to handle the messages on the server
function parseMessage(msg, additional, socketId){

  let chkmsg = JSON.parse(msg);
  chkmsg = chkmsg.message;

  //check if message is empty
  let isEmpty = (chkmsg === "" || !chkmsg.replace(/\s/g, '').length);
  if (!isEmpty && !additional) {
    io.emit('chat message', msg);
  } else {
    io.to(`${socketId}`).emit('chat message', msg);
  }


  //message contains url
  let urlexp = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  let youtubeexp = /(?:youtube\.[a-z]+.?[a-z]+\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/gi;

  if(urlexp.test(chkmsg)) {
    let urls = chkmsg.match(urlexp);
    msg = JSON.parse(msg);

    //handle more one or more url(s) in a message
    urls.forEach(url => {
      //add http:// to url if not present
      url = addhttp(url).toString();

      //build the message
      fullmsg = { "author": msg.author , "message": url, "isNew": msg.isNew };
      fullmsg = JSON.stringify(fullmsg);

      //check if url is image
      if(isImageUrl(url)){
        if (!additional) {
          io.emit('image', fullmsg);
        } else {
          io.to(`${socketId}`).emit('image', fullmsg);
        }

      //check for youtube
      } else if(youtubeexp.test(url)){
        let id = getYouTubeID(url);
        let ytmsg = { "author": msg.author , "id":  id, "isNew": msg.isNew };
        ytmsg = JSON.stringify(ytmsg);
        if (!additional) {
          io.emit('youtube', ytmsg);
        } else {
          io.to(`${socketId}`).emit('youtube', ytmsg);
        }
       
      // if url is "normal" 
      } else {
        //get the title from the webpage
        getTitleAtUrl(url).then(function(title) {
          let urlmsg = { "author": msg.author , "url":  url, "title": title, "isNew": msg.isNew };
          urlmsg = JSON.stringify(urlmsg);
          if (!additional) {
            io.emit('url', urlmsg);
          } else {
            io.to(`${socketId}`).emit('url', urlmsg);
          }

        //if title can't be resolved, fallback to raw url  
        }).catch((err) => {
          fullmsg = { "author": msg.author , "message": url, "isNew": msg.isNew  };
          fullmsg = JSON.stringify(fullmsg);
          if (!additional) {
            io.emit('rawurl', fullmsg);
          } else {
            io.to(`${socketId}`).emit('rawurl', fullmsg);
          }
        });
      }
    });
  }
}

function addhttp(url) {
  if (!/^(f|ht)tps?:\/\//i.test(url)) {
     url = "http://" + url;
  }
  return url;
}