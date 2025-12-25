# 🎧 Wrapify

**Wrapify** is an always-on Spotify Wrapped–style web app that lets users explore their listening habits anytime — not just once a year.


---

## 🚀 Features

- 🔄 **Real-Time Data** from Spotify Web API
- 🎶 **Recently Played Tracks** 
- 🔝 **Top Tracks** 
- 🎤 **Top Artists** 
- 🎼 **Top Genres**  
- 💿 **Top Albums (All Time)**  
- ⚡ Fast, client-side rendered UI

---

## 🛠 Tech Stack

- **React (Vite)**
- **Spotify Web API**
- **OAuth 2.0 with PKCE (Proof Key for Code Exchange)**
- **JavaScript (ES6+)**
- **CSS-in-JS (inline styles + animations)**
- **Vercel** for deployment

---

## 🔐 Authentication Flow (PKCE)

Wrapify uses **Spotify’s recommended PKCE OAuth flow**:

1. Generate a secure `code_verifier`
2. Hash it → `code_challenge`
3. Redirect user to Spotify login
4. Spotify redirects back with `?code=`
5. Exchange code + verifier for an access token
6. Use token to fetch user data

This ensures **secure authentication without exposing secrets** in the frontend.

---

## 🌐 API Scopes Used

```txt
user-read-email
user-top-read
user-read-recently-played

```

---

## 🧠 Key Learnings & Takeaways

- How to implement OAuth 2.0 PKCE from scratch
- How Spotify Web API differs across endpoints
- Handling auth redirects, callbacks, and tokens
- Managing multiple independent time ranges in React
- Safely parsing API responses (non-JSON error handling)
- Deriving insights (genres & albums) without direct API support
- Deploying a frontend-only OAuth app on Vercel

---

## 🍴Quick Setup Instructions:
1. Clone this repo and cd into the project directory.
2. Run `npm install` to install dependencies
3. Create a Spotify Developer app and get your client ID 
4. Run `npm run dev -- --host 127.0.0.1 --port 5173` to start the dev server.
5. Login into the same account as used in your Spotify Developer app.
6. Enjoy exploring your Spotify listening data!

## 📄 License

This project is licensed under the *MIT License*.
