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

      recieveMessage(fullmsg.message.toString(), isOwn);

    });

    //recieving a url
    socket.on('url', function (urlmsg) {
      urlmsg = JSON.parse(urlmsg);
      let isOwn = urlmsg.author.toString() === $('#username').val();

      recieveMessage('<a target=”_blank” href=\"' + urlmsg.url + '\">' + urlmsg.title + '</a>', isOwn);

    });

    //recieving a raw url
    socket.on('rawurl', function (fullmsg) {
      console.log(fullmsg);
      fullmsg = JSON.parse(fullmsg);
      let isOwn = fullmsg.author.toString() === $('#username').val();
      console.log("Stuff: " + fullmsg);

      recieveMessage('<a target=”_blank” href=\"' + fullmsg.message + '\">' + fullmsg.message + '</a>', isOwn);

  });

    //recieving a image
    socket.on('image', function (fullmsg) {
      fullmsg = JSON.parse(fullmsg);
      let isOwn = fullmsg.author.toString() === $('#username').val();

      recieveMessage('<img src="' + fullmsg.message + '"></img>', isOwn);

    });



  });

  function recieveMessage(appendString, isOwn) {
      if (isOwn) {
        //own message
        $('.msg_history').append('<div class="outgoing_msg"><p>' + appendString + '</p><span class="time_date"> 11:01 AM    |    June 9</span></div>');
      }
      else {
        //message from others
        $('.msg_history').append('<div class="incomming_msg"><p>' + appendString + '</p><span class="time_date"> 11:01 AM    |    June 9</span></div>');
      }

      window.scrollTo(0, document.body.scrollHeight);
    }