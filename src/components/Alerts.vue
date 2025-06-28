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
    const audioUrl = audioQueue.shift();
    const audio = new Audio(audioUrl);
    
    // Start muted to bypass autoplay restrictions
    audio.muted = true;
    audio.volume = 1.0;
    
    audio.onended = () => {
      if (audioQueue.length > 0) {
        dequeueAudio();
      } else {
        isPlaying = false;
      }
    };
    
    audio.onerror = (error) => {
      console.log('Audio error for:', audioUrl);
      if (audioQueue.length > 0) {
        dequeueAudio();
      } else {
        isPlaying = false;
      }
    };
    
    // Play muted first, then unmute
    audio.play().then(() => {
      // Small delay then unmute
      setTimeout(() => {
        audio.muted = false;
      }, 10);
    }).catch((error) => {
      console.log('Muted audio play failed:', error);
      // Fallback to direct play attempt
      audio.muted = false;
      audio.play().catch(e => console.log('Direct play failed:', e));
    });
  }
}
</script>

<template>
  <div class="alerts-container">
    <!-- Hidden audio element to help with autoplay -->
    <audio ref="hiddenAudio" muted autoplay loop>
      <source src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=" type="audio/wav">
    </audio>
  </div>
</template>

<style scoped>
.alerts-container {
  width: 100vw;
  height: 100vh;
  position: relative;
}

audio {
  display: none;
}
</style>