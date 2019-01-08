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

      recieveMessage('<a target=”_blank” href=\"' + urlmsg.url + '\">' + urlmsg.title + '</a>', isOwn, urlmsg.title, urlmsg.author);

    });

    //recieving a raw url
    socket.on('rawurl', function (fullmsg) {
      console.log(fullmsg);
      fullmsg = JSON.parse(fullmsg);
      let isOwn = fullmsg.author.toString() === $('#username').val();
      console.log("Stuff: " + fullmsg);

      recieveMessage('<a target=”_blank” href=\"' + fullmsg.message + '\">' + fullmsg.message + '</a>', isOwn, fullmsg.message, fullmsg.author);

  });

    //recieving a image
    socket.on('image', function (fullmsg) {
      fullmsg = JSON.parse(fullmsg);
      let isOwn = fullmsg.author.toString() === $('#username').val();

      recieveMessage('<img src="' + fullmsg.message + '"></img>', isOwn, fullmsg.message, fullmsg.author);

    });

  });

  function recieveMessage(appendString, isOwn, message, author) {
      if (isOwn) {
        //own message
        $('.msg_history').append('<div class="outgoing_msg"><p>' + appendString + '</p></div>');
      }
      else {
        //message from others
        $('.msg_history').append('<div class="incomming_msg"><p>' + appendString + '</p></div>');
        
        //show a notification
        if (!Notify.needsPermission) {
            doNotification(message, author);
        } else if (Notify.isSupported()) {
            Notify.requestPermission(onPermissionGranted, onPermissionDenied);
        }

      }

      //window.scrollTo(0, document.body.scrollHeight);
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
    doNotification();
}

function onPermissionDenied () {
    console.warn('Permission has been denied by the user');
}
//END functions for notifyjs