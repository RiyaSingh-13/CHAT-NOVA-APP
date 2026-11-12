# Chat Nova Mobile

This is the React Native companion app for the existing Chat Nova web client.
It uses Expo and shares the existing backend API and Socket.IO service; the web
client remains unchanged.

## Run locally

```sh
cd mobile
npm install
npm start
```

Open the project in Expo Go, or run `npm run ios` / `npm run android` with the
corresponding simulator or native toolchain installed.

By default, the app connects to `https://chat-nova-bk.onrender.com`. To use a
local backend, create `mobile/.env` and set `EXPO_PUBLIC_BACKEND_URL` to an
address reachable from the device, for example `http://192.168.1.10:5000`.
Do not use `localhost` from a physical phone; use the development computer's
LAN address instead.

The mobile app includes sign-up and sign-in, secure token persistence, live
online status and incoming messages, searchable conversations, text and image
messages, and profile editing. The backend must be running and reachable for
these features to work.
