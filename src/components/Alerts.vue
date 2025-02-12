<script>
let isPlaying = false
let server = 'wss://maddeth.com/websocket/'
const audioQueue = []

start(server)

function start(server) {
  let socket = new WebSocket('wss://maddeth.com/websocket/');
  
  socket.addEventListener('open', function (event) {
    socket.send('Web Client Connected');
  });

  socket.addEventListener('message', function (event) {
    var newEvent = JSON.parse(event.data)
    console.log('Event from server ', newEvent.type);
    //if (newEvent.type == "tts") {
      //  playTts(newEvent.id)
      //}
      if (newEvent.type == "redeem") {
        playRedeem(newEvent.id)
      }
    });
    
  socket.addEventListener('close', (event) => {
    console.log("lost connection to websocket:", socket.readyState)
    setInterval(function () {
      console.log("retry connection to websocket")
      if (socket.readyState === WebSocket.OPEN) {
        return
      } else {
        start(server)
      }
    }, 5000)
  });
}

function playRedeem(id) {
  audioQueue.push(id);
  if (!isPlaying) {
    isPlaying = true;
    dequeueAudio();
  }
}

function playTts(id) {
  audioQueue.push(`tts/${id}.mp3`);
  if (!isPlaying) {
    isPlaying = true;
    dequeueAudio();
  }
}

function dequeueAudio() {
  if (audioQueue.length > 0) {
    const audio = new Audio(audioQueue.shift());
    audio.onended = () => {
      if (audioQueue.length > 0) {
        dequeueAudio();
      } else {
        isPlaying = false;
      }
    };
    audio.onerror = (error) => {
      if (audioQueue.length > 0) {
        dequeueAudio();
      } else {
        isPlaying = false;
      }
    };
    audio.play();
  }
}
</script>

<template>
 <iframe allow="autoplay"></iframe>
</template>