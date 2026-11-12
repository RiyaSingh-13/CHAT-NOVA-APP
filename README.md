# Chat Nova

Chat Nova consists of a Vite/React web client, an Expo/React Native mobile app,
and an Express/Socket.IO server. Both clients use the same backend and MongoDB
database.

## Configure the backend

Create `server/.env` from `server/.env.example` and fill in your MongoDB,
JWT, and Cloudinary values. Keep `.env` files private; do not commit credentials.

## Install dependencies

From the repository root, install each app's dependencies once:

```sh
npm --prefix server install
npm --prefix client install
npm --prefix mobile install
```

## Run locally

Start each app in its own terminal from the repository root.

**Backend**

```sh
cd server
npm run dev
```

The API and Socket.IO server listen on port 5000 by default. Check
`http://localhost:5000/api/status` to confirm it is running.

**Web client**

```sh
cd client
cp .env.example .env
npm run dev
```

Open the Vite URL shown in the terminal (usually `http://localhost:5173`).
The local API URL is set in `client/.env`.

**Mobile app**

```sh
cd mobile
cp .env.example .env
npm start
```

Set `EXPO_PUBLIC_BACKEND_URL` in `mobile/.env` to an address reachable from the
device. Use `http://10.0.2.2:5000` for an Android emulator, `http://localhost:5000`
for an iOS simulator, or your computer's LAN IP (for example
`http://192.168.1.10:5000`) for a physical device. Ensure the phone and computer
are on the same network.

For web or mobile, create an account before signing in. The backend must be
connected to MongoDB; image sending and profile pictures also require valid
Cloudinary credentials.
# CHAT-NOVA-APP
