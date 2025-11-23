import { useEffect, useState } from "react";
import { createCodeChallengePair } from "./auth/pkce";

const CLIENT_ID = "9add85a82f364f7191cf181f1bdefa2d"; // <- paste from dashboard
const REDIRECT_URI = "http://127.0.0.1:5173/callback";
const SCOPES = [
  "user-read-email",
  "user-top-read",
  "user-read-recently-played"
];

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [topTracks, setTopTracks] = useState([]);

  // 1) When user clicks login
  const handleLogin = async () => {
    const { verifier, challenge } = await createCodeChallengePair();

    // save verifier for later (in memory or localStorage)
    window.localStorage.setItem("spotify_code_verifier", verifier);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: SCOPES.join(" "),
      redirect_uri: REDIRECT_URI,
      code_challenge_method: "S256",
      code_challenge: challenge,
    });

    window.location = "https://accounts.spotify.com/authorize?" + params.toString();
  };

  // 2) On callback, exchange code for access token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code) return;

    const fetchToken = async () => {
      const verifier = window.localStorage.getItem("spotify_code_verifier");
      if (!verifier) return;

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
        window.history.replaceState({}, document.title, "/"); // clean URL
      }
    };

    fetchToken();
  }, []);

  // 3) Once we have a token, fetch profile + top tracks
  useEffect(() => {
    if (!accessToken) return;

    const fetchData = async () => {
      const headers = { Authorization: `Bearer ${accessToken}` };

      // current user profile
      const profileRes = await fetch("https://api.spotify.com/v1/me", { headers });
      const profileData = await profileRes.json();
      setProfile(profileData);

      // top tracks (long_term ~ "all time")
      const topRes = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=long_term", { headers });
      const topData = await topRes.json();
      setTopTracks(topData.items || []);
    };

    fetchData();
  }, [accessToken]);

  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="p-8 rounded-2xl bg-slate-900 shadow-xl text-center space-y-4">
          <h1 className="text-3xl font-bold">Wrapify</h1>
          <p className="text-sm text-slate-300">
            Get your Spotify-style wrap any time you want.
          </p>
          <button
            onClick={handleLogin}
            className="mt-4 px-6 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 font-semibold"
          >
            Log in with Spotify
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Wrapify – early alpha</h1>

      {profile && (
        <div className="mb-8 flex items-center gap-4">
          {profile.images && profile.images[0] && (
            <img
              src={profile.images[0].url}
              alt="avatar"
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <p className="text-xl font-semibold">{profile.display_name}</p>
            <p className="text-sm text-slate-400">{profile.email}</p>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-3">Top Tracks – All Time</h2>
      <ol className="space-y-2">
        {topTracks.map((t, i) => (
          <li key={t.id} className="flex justify-between bg-slate-900/60 p-3 rounded-xl">
            <div>
              <span className="mr-3 text-slate-400">#{i + 1}</span>
              <span className="font-medium">{t.name}</span>
              <span className="text-slate-400 text-sm">
                {"  –  "}{t.artists.map(a => a.name).join(", ")}
              </span>
            </div>
            <a
              href={t.external_urls.spotify}
              target="_blank"
              rel="noreferrer"
              className="text-xs underline text-emerald-400"
            >
              Open in Spotify
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default App;
