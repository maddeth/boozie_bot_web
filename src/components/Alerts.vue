<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  setup() {
    const currentGif = ref('')
    const showGif = ref(false)
    const gifQueue = ref([])
    
    let isPlaying = false
    let server = 'wss://maddeth.com/websocket/'
    const audioQueue = []
    let gifTimeout = null

    function start(server) {
      let socket = new WebSocket('wss://maddeth.com/websocket/');
      
      socket.addEventListener('open', function (event) {
        socket.send('Web Client Connected');
      });

      socket.addEventListener('message', function (event) {
        var newEvent = JSON.parse(event.data)
        console.log('Event from server ', newEvent.type);
        
        if (newEvent.type == "redeem") {
          playRedeem(newEvent.id)
          // Check if this redeem has an associated gif
          if (newEvent.gifUrl) {
            displayGif(newEvent.gifUrl, newEvent.duration || 5000)
          }
        }
        
        if (newEvent.type == "gif") {
          displayGif(newEvent.url, newEvent.duration || 5000)
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

    function displayGif(url, duration) {
      gifQueue.value.push({ url, duration })
      if (!showGif.value) {
        dequeueGif()
      }
    }

    function dequeueGif() {
      if (gifQueue.value.length > 0) {
        const gif = gifQueue.value.shift()
        currentGif.value = gif.url
        showGif.value = true
        
        gifTimeout = setTimeout(() => {
          showGif.value = false
          currentGif.value = ''
          
          // Small delay before showing next gif
          setTimeout(() => {
            if (gifQueue.value.length > 0) {
              dequeueGif()
            }
          }, 500)
        }, gif.duration)
      }
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

    onMounted(() => {
      start(server)
    })

    onUnmounted(() => {
      if (gifTimeout) {
        clearTimeout(gifTimeout)
      }
    })

    return {
      currentGif,
      showGif
    }
  }
}
</script>

<template>
  <div class="alerts-container">
    <!-- Gif display overlay -->
    <transition name="fade">
      <div v-if="showGif" class="gif-overlay">
        <img :src="currentGif" alt="Alert animation" class="alert-gif" />
      </div>
    </transition>
    
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
  overflow: hidden;
}

.gif-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  z-index: 1000;
}

.alert-gif {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.5));
}

/* Fade transition for smooth gif appearance/disappearance */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

audio {
  display: none;
}
</style>