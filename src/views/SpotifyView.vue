<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '../supabase.js'

const API_BASE = 'https://maddeth.com'
const WS_URL = 'wss://maddeth.com/websocket/'

export default {
  setup() {
    const nowPlaying = ref(null)        // { isPlaying, progressMs, track: {...} } | null
    const configured = ref(true)         // whether Spotify is configured at all
    const authorized = ref(true)         // whether the broadcaster has authorized
    const showAuthButton = ref(false)    // surfaces "Authorize" for the admin
    const authError = ref('')

    let socket = null
    let reconnectTimer = null
    let reconnectDelay = 1000
    const maxReconnectDelay = 30000
    let heartbeatTimer = null

    // Track display values — flatten the structure for the template
    const trackName = computed(() => nowPlaying.value?.track?.name || '')
    const trackArtists = computed(() => (nowPlaying.value?.track?.artists || []).join(', '))
    const trackAlbum = computed(() => nowPlaying.value?.track?.album || '')
    const trackArt = computed(() => nowPlaying.value?.track?.albumArt || '')
    const isPlaying = computed(() => !!nowPlaying.value?.isPlaying && !!nowPlaying.value?.track)

    async function loadStatus() {
      try {
        const res = await fetch(`${API_BASE}/api/spotify/status`)
        if (!res.ok) return
        const data = await res.json()
        configured.value = !!data.configured
        authorized.value = !!data.authorized
      } catch (err) {
        console.error('spotify status load failed', err)
      }
    }

    async function loadInitial() {
      try {
        const res = await fetch(`${API_BASE}/api/spotify/now-playing`)
        if (res.ok) {
          nowPlaying.value = await res.json()
        }
      } catch (err) {
        console.error('spotify now-playing load failed', err)
      }
    }

    async function checkIfAdmin() {
      // Quietly check whether the viewer is an admin so we can show the auth button.
      // Anonymous viewers (the common case — this is a stream overlay) see nothing.
      try {
        const session = await supabase.auth.getSession()
        if (!session.data.session) return
        const token = session.data.session.access_token
        const res = await fetch(`${API_BASE}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) return
        const user = await res.json()
        if (user?.roles?.isAdmin || user?.roles?.isSuperAdmin) {
          showAuthButton.value = true
        }
      } catch {
        /* viewer isn't logged in — fine */
      }
    }

    async function authorize() {
      authError.value = ''
      try {
        const session = await supabase.auth.getSession()
        if (!session.data.session) {
          authError.value = 'Please log in first'
          return
        }
        const token = session.data.session.access_token
        const res = await fetch(`${API_BASE}/api/spotify/auth`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) {
          authError.value = `Auth request failed (${res.status})`
          return
        }
        const data = await res.json()
        if (data.authorizeUrl) {
          window.location.href = data.authorizeUrl
        }
      } catch (err) {
        authError.value = err.message || 'Authorization failed'
      }
    }

    function startSocket() {
      if (socket && socket.readyState === WebSocket.OPEN) return

      socket = new WebSocket(WS_URL)

      socket.addEventListener('open', () => {
        reconnectDelay = 1000
        startHeartbeat()
      })

      socket.addEventListener('message', (event) => {
        let parsed
        try {
          parsed = JSON.parse(event.data)
        } catch {
          return
        }
        if (parsed.type === 'pong') return
        if (parsed.type === 'batch' && Array.isArray(parsed.messages)) {
          parsed.messages.forEach(processMessage)
          return
        }
        processMessage(parsed)
      })

      socket.addEventListener('close', () => {
        stopHeartbeat()
        scheduleReconnect()
      })

      socket.addEventListener('error', (err) => {
        console.error('spotify ws error', err)
      })
    }

    function processMessage(msg) {
      if (msg.type === 'spotify_now_playing') {
        nowPlaying.value = msg.nowPlaying
      }
    }

    function scheduleReconnect() {
      if (reconnectTimer) clearTimeout(reconnectTimer)
      reconnectTimer = setTimeout(() => {
        startSocket()
        reconnectDelay = Math.min(reconnectDelay * 2 + Math.random() * 1000, maxReconnectDelay)
      }, reconnectDelay)
    }

    function startHeartbeat() {
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

    onMounted(async () => {
      await loadStatus()
      if (configured.value) {
        await loadInitial()
        startSocket()
      }
      if (!authorized.value) {
        await checkIfAdmin()
      }
    })

    onUnmounted(() => {
      stopHeartbeat()
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (socket) socket.close()
    })

    return {
      configured,
      authorized,
      showAuthButton,
      authError,
      isPlaying,
      trackName,
      trackArtists,
      trackAlbum,
      trackArt,
      authorize,
    }
  }
}
</script>

<template>
  <div class="spotify-page">
    <!-- Not configured: only visible to anyone who navigates here -->
    <div v-if="!configured" class="status-card">
      <h1>Spotify not configured</h1>
      <p>Set <code>spotify.enabled = true</code> with credentials in <code>config.json</code> and restart the bot.</p>
    </div>

    <!-- Configured but broadcaster hasn't authorized -->
    <div v-else-if="!authorized" class="status-card">
      <h1>Spotify not connected</h1>
      <p v-if="showAuthButton">Click below to authorize the bot with your Spotify account.</p>
      <p v-else>Waiting for the broadcaster to connect their Spotify account.</p>
      <button v-if="showAuthButton" class="auth-button" @click="authorize">
        Authorize Spotify
      </button>
      <p v-if="authError" class="error">{{ authError }}</p>
    </div>

    <!-- Now playing card — hidden entirely when paused/idle so it's invisible in OBS. -->
    <transition name="fade" mode="out-in">
      <div v-if="authorized && isPlaying" :key="trackName + trackArtists" class="now-playing">
        <div class="art-wrap">
          <img v-if="trackArt" :src="trackArt" alt="" class="art" />
          <div v-else class="art art-placeholder"></div>
        </div>
        <div class="meta">
          <div class="title">{{ trackName }}</div>
          <div class="artist">{{ trackArtists }}</div>
          <div class="album">{{ trackAlbum }}</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.spotify-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: transparent;
  color: #f3f4f6;
  font-family: 'Inter', 'Segoe UI', Tahoma, sans-serif;
}

.now-playing {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem 2.5rem;
  background: rgba(15, 15, 17, 0.92);
  border: 1px solid rgba(29, 185, 84, 0.4);
  border-radius: 1rem;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.55), 0 0 40px rgba(29, 185, 84, 0.12);
  max-width: 720px;
  width: 100%;
}

.now-playing.idle {
  border-color: rgba(120, 120, 130, 0.35);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.art-wrap {
  flex-shrink: 0;
}

.art {
  width: 200px;
  height: 200px;
  border-radius: 0.5rem;
  object-fit: cover;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
}

.art-placeholder {
  background: linear-gradient(135deg, #1f2937, #374151);
}

.meta {
  min-width: 0;
  flex: 1;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.4rem;
  line-height: 1.15;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}

.artist {
  font-size: 1.25rem;
  font-weight: 500;
  color: #1db954;
  margin-bottom: 0.25rem;
}

.album {
  font-size: 0.95rem;
  color: #9ca3af;
  font-style: italic;
}

.status-card {
  background: rgba(25, 25, 32, 0.95);
  border: 1px solid #2c2c36;
  border-radius: 0.75rem;
  padding: 2.5rem 3rem;
  text-align: center;
  max-width: 520px;
}

.status-card h1 {
  margin: 0 0 0.75rem;
  color: #1db954;
}

.status-card p {
  color: #d1d5db;
  margin: 0.5rem 0;
}

.status-card code {
  background: rgba(0, 0, 0, 0.4);
  padding: 0.1rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.9em;
}

.auth-button {
  margin-top: 1rem;
  background: #1db954;
  color: #000;
  border: none;
  padding: 0.75rem 1.75rem;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
}

.auth-button:hover {
  background: #1ed760;
  transform: translateY(-1px);
}

.error {
  color: #f87171;
  margin-top: 0.75rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
