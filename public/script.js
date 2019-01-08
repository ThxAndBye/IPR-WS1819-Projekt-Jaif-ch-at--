$(function () {
    var socket = io();
    Notify.requestPermission();

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

      recieveMessage(fullmsg.message.toString(), isOwn, fullmsg.message, fullmsg.author);

    });

    //recieving a url
    socket.on('url', function (urlmsg) {
      urlmsg = JSON.parse(urlmsg);
      let isOwn = urlmsg.author.toString() === $('#username').val();

      recieveMessage('<a target="_blank" href=\"' + urlmsg.url + '\">' + urlmsg.title + '</a>', isOwn, urlmsg.title, urlmsg.author);

    });

    //recieving a raw url (when url title parsing fails)
    socket.on('rawurl', function (fullmsg) {
      console.log(fullmsg);
      fullmsg = JSON.parse(fullmsg);
      let isOwn = fullmsg.author.toString() === $('#username').val();
      console.log("Stuff: " + fullmsg);

      recieveMessage('<a target="_blank" href=\"' + fullmsg.message + '\">' + fullmsg.message + '</a>', isOwn, fullmsg.message, fullmsg.author);

  });

      //recieving a youtubeid
      socket.on('youtube', function (ytmsg) {
        ytmsg = JSON.parse(ytmsg);
        let isOwn = ytmsg.author.toString() === $('#username').val();
  
        console.log(ytmsg);
        recieveMessage('<iframe id="ytplayer" type="text/html" src="https://www.youtube.com/embed/' + ytmsg.id + '" frameborder="0"></iframe>', isOwn, 'YouTube: ' + ytmsg.id, ytmsg.author);
  
      });

    //recieving a image
    socket.on('image', function (fullmsg) {
      fullmsg = JSON.parse(fullmsg);
      let isOwn = fullmsg.author.toString() === $('#username').val();

      recieveMessage('<img src="' + fullmsg.message + '"></img>', isOwn, fullmsg.message, fullmsg.author);

    });


    //check for ENTER in modal
    $('.modal').keypress(function(e){
      if(e.which == 13) {
        startChat();
      }
    })

    $('#btnLogin').click(function(){
      startChat();
    })

    //function executed after username is entered, checks if name is not empty
    function startChat(){
      if ($('#username').val().replace(/\s/g, '').length) {
        $('.modal').toggle();
        $('#m').focus();

        //notify server of new connection
        socket.emit('new connection');
    }
  }

  });

  //function to add a message to the chat (all parameters are requiered)
  function recieveMessage(appendString, isOwn, message, author) {
      let currentDate = new Date();
      if (isOwn) {
        //own message
        $('.msg_history').append('<div class="outgoing_msg"><p>' + appendString + '</p><span class="time_date_outgoing">' + currentDate.toLocaleTimeString() + ' | ' + currentDate.toDateString() + '</span></div>');
      }
      else {
        //message from others
        $('.msg_history').append('<div class="incomming_msg"><p>' + appendString + '</p><span class="time_date_incomming"> '+ author +' @ ' + currentDate.toLocaleTimeString() + ' | ' + currentDate.toDateString() + '</span></div>');
        
        
        //check if window has focus
        let focused = document.hasFocus();

        //show a notification
        if(!focused) {
          if (!Notify.needsPermission) {
            doNotification(message, author);
          } else if (Notify.isSupported()) {
              Notify.requestPermission(onPermissionGranted, onPermissionDenied);
          }
      }

      }

      //scroll chat to the bottom
      $('html,body').animate({scrollTop: document.body.scrollHeight},"fast");
    }


//functions for notifyjs  
function doNotification (message, author) {
      var myNotification = new Notify(('Jaif Ch@, new message from: ' + author), {
          body: message,
          tag: 'Jaif-Ch-At',
          notifyShow: onShowNotification,
          notifyClose: onCloseNotification,
          notifyClick: onClickNotification,
          notifyError: onErrorNotification,
          timeout: 4
      });

      myNotification.show();
  }

function onShowNotification () {
}

function onCloseNotification () {
}

function onClickNotification () {
}

function onErrorNotification () {
    console.error('Error showing notification. You may need to request permission.');
}

function onPermissionGranted () {
}

function onPermissionDenied () {
    console.warn('Permission has been denied by the user');
}
//END functions for notifyjs
