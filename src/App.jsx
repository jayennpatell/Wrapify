import { useEffect, useState } from "react";

const CLIENT_ID = "efbb0aad9f8a439fb9f7b774e17e96d4"; 
const REDIRECT_URI = "http://127.0.0.1:5173/callback"

const SCOPES = [
  "user-read-email",
  "user-top-read",
  "user-read-recently-played",
];

// --- PKCE HELPERS ---

// create hashkey for authentication
function generateRandomString(length = 64) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest("SHA-256", data);
}

function base64urlencode(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function createCodeChallengePair() {
  const verifier = generateRandomString(64);
  const hash = await sha256(verifier);
  const challenge = base64urlencode(hash);
  return { verifier, challenge };
}

// --- APP ---

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1) User clicks login
  const handleLogin = async () => {
    const { verifier, challenge } = await createCodeChallengePair();
    window.localStorage.setItem("spotify_code_verifier", verifier);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: SCOPES.join(" "),
      redirect_uri: REDIRECT_URI,
      code_challenge_method: "S256",
      code_challenge: challenge,
    });

    window.location.href =
      "https://accounts.spotify.com/authorize?" + params.toString();
  };

  // 2) On /callback, exchange ?code=... for token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code) return;

    const fetchToken = async () => {
      try {
        const verifier = window.localStorage.getItem("spotify_code_verifier");
        if (!verifier) {
          console.error("Missing code verifier");
          return;
        }

        const body = new URLSearchParams({
          client_id: CLIENT_ID,
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
          code_verifier: verifier,
        });

        const res = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });

        const data = await res.json();
        if (data.access_token) {
          setAccessToken(data.access_token);
          window.history.replaceState({}, document.title, "/");
        } else {
          console.error("Token error:", data);
        }
      } catch (err) {
        console.error("Token fetch failed:", err);
      }
    };

    fetchToken();
  }, []);

  // 3) Once we have token, get profile + top tracks
  useEffect(() => {
    if (!accessToken) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${accessToken}` };

        const meRes = await fetch("https://api.spotify.com/v1/me", { headers });
        const meData = await meRes.json();
        setProfile(meData);

        const topRes = await fetch(
          "https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=medium_term",
          { headers }
        );
        const topData = await topRes.json();
        setTopTracks(topData.items || []);
      } catch (err) {
        console.error("Data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  // --- UI ---

  if (!accessToken) {
    // Login screen (centered)
    return (
      <main
        style={{
          minHeight: "100vh",
          width: "100vw",
          background: "#020617",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "2rem",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "2000px",   // ⬅️ INCREASED from 800px to 1100px
            textAlign: "-webkit-center",
            margin: "auto",    // ⬅️ ensures PERFECT center
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
            }}
          >
            Wrapify
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#cbd5f5",
              marginBottom: "1.5rem",
            }}
          >
            Get your Spotify-style wrap any time you want.
          </p>
          <button
            onClick={handleLogin}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              background: "linear-gradient(135deg,#22c55e,#0ea5e9)",
              color: "white",
            }}
          >
            Log in with Spotify
          </button>
        </div>
      </main>
    );
  }

  // Logged-in screen (CENTERED version)
  return (
    <main
        style={{
          minHeight: "100vh",
          width: "100vw",
          background: "#020617",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "2rem",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "2000px",   // ⬅️ INCREASED from 800px to 1100px
            textAlign: "-webkit-center",
            margin: "auto",    // ⬅️ ensures PERFECT center
          }}
        >
        <header style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
            }}
          >
            Wrapify – Alpha
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
            Your always-on Spotify wrap (MVP).
          </p>
        </header>

        {profile && (
          <section
            style={{
              marginBottom: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            {profile.images && profile.images[0] && (
              <img
                src={profile.images[0].url}
                alt="avatar"
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "999px",
                  objectFit: "cover",
                }}
              />
            )}
            <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
              {profile.display_name}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
              {profile.email}
            </div>
          </section>
        )}

        <section>
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            Top Tracks – All Time
          </h2>

          {loading && (
            <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
              Loading your stats…
            </p>
          )}

          {!loading && topTracks.length === 0 && (
            <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
              No top tracks found. Try listening more on Spotify 😈
            </p>
          )}

          <ol
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {topTracks.map((track, index) => (
              <li
                key={track.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.9rem",
                  background: "rgba(15,23,42,0.9)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.85rem",
                      width: "1.5rem",
                      textAlign: "right",
                    }}
                  >
                    #{index + 1}
                  </span>
                  {track.album?.images?.[2] && (
                    <img
                      src={track.album.images[2].url}
                      alt="cover"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "0.5rem",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <div>
                    <div
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        marginBottom: "0.1rem",
                      }}
                    >
                      {track.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#9ca3af",
                      }}
                    >
                      {track.artists.map((a) => a.name).join(", ")}
                    </div>
                  </div>
                </div>
                <a
                  href={track.external_urls?.spotify}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: "0.75rem",
                    color: "#22c55e",
                    textDecoration: "underline",
                    whiteSpace: "nowrap",
                    marginLeft: "0.5rem",
                  }}
                >
                  Open
                </a>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}

export default App;
