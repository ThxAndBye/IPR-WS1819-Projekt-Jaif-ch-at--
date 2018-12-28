$(function () {
    var socket = io();

    //sending a message
    $('form').submit(function () {
      fullmsg = { "author": $('#username').val(), "message": $('#m').val() };
      fullmsg = JSON.stringify(fullmsg);

      socket.emit('chat message', fullmsg);
      $('#m').val('');
      return false;
    });

    //recieving a message
    socket.on('chat message', function (fullmsg) {
      fullmsg = JSON.parse(fullmsg);
      let isOwn = fullmsg.author.toString() === $('#username').val();

      sendMessage(fullmsg.message.toString(), isOwn);

    });

    //recieving a url
    socket.on('url', function (fullmsg) {
      fullmsg = JSON.parse(fullmsg);
      let isOwn = fullmsg.author.toString() === $('#username').val();

      sendMessage('<a target=”_blank” href=\"' + fullmsg.message + '\">' + fullmsg.message + '</a>', isOwn);

    });

    //recieving a image
    socket.on('image', function (fullmsg) {
      fullmsg = JSON.parse(fullmsg);
      let isOwn = fullmsg.author.toString() === $('#username').val();

      sendMessage('<img src="' + fullmsg.message + '"></img>', isOwn);

    });



  });

  function sendMessage(appendString, isOwn) {
      if (isOwn) {
        //own message
        $('#messages').append('<li><p align = "right">' + appendString + '</p>');
      }
      else {
        //message from others
        $('#messages').append('<li><p align = "left">' + appendString + '</p>');
      }

      window.scrollTo(0, document.body.scrollHeight);
    }