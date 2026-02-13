<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  setup() {
    const currentGif = ref('')
    const showGif = ref(false)
    const gifQueue = ref([])
    const notificationText = ref('')
    const showNotification = ref(false)
    const notificationQueue = ref([])

    let isPlaying = false
    let server = 'wss://maddeth.com/websocket/'
    const audioQueue = []
    let gifTimeout = null
    let notificationTimeout = null
    let socket = null
    let reconnectTimer = null
    let reconnectDelay = 1000 // Start with 1 second
    const maxReconnectDelay = 30000 // Max 30 seconds
    let heartbeatTimer = null

    function start(server) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        return // Already connected
      }

      socket = new WebSocket('wss://maddeth.com/websocket/');

      socket.addEventListener('open', function (event) {
        console.log('WebSocket connected');
        socket.send('Web Client Connected');

        // Reset reconnect delay on successful connection
        reconnectDelay = 1000;

        // Start client-side heartbeat
        startHeartbeat();
      });

      socket.addEventListener('message', function (event) {
        var newEvent = JSON.parse(event.data)
        console.log('Event from server ', newEvent.type);

        // Handle pong response from server
        if (newEvent.type == "pong") {
          return; // Heartbeat response received
        }

        // Handle batched messages
        if (newEvent.type == "batch") {
          console.log(`Processing batch of ${newEvent.count} messages`);
          newEvent.messages.forEach(msg => processMessage(msg));
          return;
        }

        // Handle single message
        processMessage(newEvent);
      });

      function processMessage(msg) {
        if (msg.type == "redeem") {
          playRedeem(msg.audioUrl)
          if (msg.gifUrl) {
            displayGif(msg.gifUrl, msg.duration || 5000)
          }
        }

        if (msg.type == "gif") {
          displayGif(msg.url, msg.duration || 5000)
        }

        if (msg.type == "tts") {
          playTts(msg.id)
        }

        if (msg.type == "follow") {
          queueNotification(
            `${msg.username} just followed!`,
            msg.audioUrl, msg.gifUrl, msg.duration
          )
        }

        if (msg.type == "sub") {
          const tierLabel = msg.tier === '1' ? '' : ` (Tier ${msg.tier})`
          queueNotification(
            `${msg.username} just subscribed${tierLabel}!`,
            msg.audioUrl, msg.gifUrl, msg.duration
          )
        }

        if (msg.type == "resub") {
          const months = msg.months || 1
          const streak = msg.streak ? ` (${msg.streak} month streak!)` : ''
          queueNotification(
            `${msg.username} resubscribed for ${months} months${streak}!`,
            msg.audioUrl, msg.gifUrl, msg.duration
          )
        }

        if (msg.type == "giftsub") {
          const gifter = msg.isAnonymous ? 'An anonymous gifter' : msg.username
          const total = msg.total > 1 ? ` (${msg.total} total gifts!)` : ''
          queueNotification(
            `${gifter} gifted a sub${total}!`,
            msg.audioUrl, msg.gifUrl, msg.duration
          )
        }
      }

      socket.addEventListener('close', (event) => {
        console.log("WebSocket connection closed", event.code, event.reason)
        stopHeartbeat()
        scheduleReconnect()
      });

      socket.addEventListener('error', (event) => {
        console.error("WebSocket error", event)
      });
    }

    function queueNotification(text, audioUrl, gifUrl, duration) {
      notificationQueue.value.push({ text, audioUrl, gifUrl, duration })
      if (!showNotification.value) {
        dequeueNotification()
      }
    }

    function dequeueNotification() {
      if (notificationQueue.value.length > 0) {
        const notif = notificationQueue.value.shift()
        notificationText.value = notif.text
        showNotification.value = true

        // Play audio if present
        if (notif.audioUrl) {
          playRedeem(notif.audioUrl)
        }

        // Show gif if present
        if (notif.gifUrl) {
          displayGif(notif.gifUrl, notif.duration || 5000)
        }

        // Auto-dismiss notification after duration (or 5 seconds default)
        const displayTime = notif.duration || 5000
        notificationTimeout = setTimeout(() => {
          showNotification.value = false
          notificationText.value = ''

          // Small delay before showing next notification
          setTimeout(() => {
            if (notificationQueue.value.length > 0) {
              dequeueNotification()
            }
          }, 500)
        }, displayTime)
      }
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

    function playRedeem(audioUrl) {
      audioQueue.push(audioUrl);
      if (!isPlaying) {
        isPlaying = true;
        dequeueAudio();
      }
    }

    function playTts(id) {
      audioQueue.push(`https://maddeth.com/tts/${id}`);
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

    function scheduleReconnect() {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }

      console.log(`Scheduling reconnect in ${reconnectDelay}ms`)
      reconnectTimer = setTimeout(() => {
        start(server)
        // Exponential backoff with jitter
        reconnectDelay = Math.min(reconnectDelay * 2 + Math.random() * 1000, maxReconnectDelay)
      }, reconnectDelay)
    }

    function startHeartbeat() {
      // Send ping every 25 seconds (less than server's 30 second timeout)
      heartbeatTimer = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }))
        }
      }, 25000)
    }

    function stopHeartbeat() {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer)
        heartbeatTimer = null
      }
    }

    onMounted(() => {
      start(server)
    })

    onUnmounted(() => {
      if (gifTimeout) {
        clearTimeout(gifTimeout)
      }
      if (notificationTimeout) {
        clearTimeout(notificationTimeout)
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
      stopHeartbeat()
      if (socket) {
        socket.close()
      }
    })

    return {
      currentGif,
      showGif,
      notificationText,
      showNotification
    }
  }
}
</script>

<template>
  <div class="alerts-container">
    <!-- Notification card for follow/sub/resub/giftsub -->
    <transition name="slide-down">
      <div v-if="showNotification" class="notification-card">
        <div class="notification-text">{{ notificationText }}</div>
      </div>
    </transition>

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

/* Notification card */
.notification-card {
  position: fixed;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  background: rgba(24, 24, 27, 0.9);
  border: 2px solid #9146ff;
  border-radius: 12px;
  padding: 20px 40px;
  box-shadow: 0 8px 32px rgba(145, 70, 255, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5);
}

.notification-text {
  color: #ffffff;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
}

/* Fade transition for gif */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide-down transition for notification */
.slide-down-enter-active {
  transition: all 0.4s ease-out;
}

.slide-down-leave-active {
  transition: all 0.3s ease-in;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-30px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

audio {
  display: none;
}
</style>
