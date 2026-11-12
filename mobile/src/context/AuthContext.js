import axios from "axios";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import { BACKEND_URL } from "../config";

export const AuthContext = createContext(null);

const api = axios.create({ baseURL: BACKEND_URL });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startupError, setStartupError] = useState("");

  const connectSocket = useCallback(
    (user) => {
      if (!user?._id) return;
      socketRef.current?.disconnect();
      const nextSocket = io(BACKEND_URL, { query: { userId: user._id } });
      nextSocket.on("getOnlineUsers", setOnlineUsers);
      socketRef.current = nextSocket;
      setSocket(nextSocket);
    },
    [],
  );

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (!token) return;

        const { data } = await api.get("/api/auth/check");
        if (data.success && active) {
          setAuthUser(data.user);
          connectSocket(data.user);
        }
      } catch (error) {
        const status = error.response?.status;
        if (status === 401) {
          await SecureStore.deleteItemAsync("token");
        } else if (active) {
          setStartupError(
            error.response?.data?.message ||
              "Could not connect to Chat Nova. Check your connection and try signing in.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    restoreSession();
    return () => {
      active = false;
    };
  }, [connectSocket]);

  useEffect(
    () => () => {
      socketRef.current?.disconnect();
    },
    [],
  );

  const login = useCallback(async (mode, credentials) => {
    const { data } = await api.post(`/api/auth/${mode}`, credentials);
    if (!data.success) {
      throw new Error(data.message || "Unable to sign in.");
    }

    const responseUser = data.userData;
    if (!responseUser || !data.token) {
      throw new Error("The server returned an incomplete sign-in response.");
    }
    const user = { ...responseUser };
    delete user.password;
    await SecureStore.setItemAsync("token", data.token);
    setStartupError("");
    setAuthUser(user);
    connectSocket(user);
  }, [connectSocket]);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync("token");
    socketRef.current?.disconnect();
    socketRef.current = null;
    setSocket(null);
    setOnlineUsers([]);
    setAuthUser(null);
  }, []);

  const updateProfile = useCallback(async (profile) => {
    const { data } = await api.put("/api/auth/update-profile", profile);
    if (!data.success) {
      throw new Error(data.message || "Unable to update your profile.");
    }
    setAuthUser(data.user);
  }, []);

  const value = useMemo(
    () => ({
      api,
      authUser,
      onlineUsers,
      socket,
      isLoading,
      startupError,
      login,
      logout,
      updateProfile,
    }),
    [authUser, onlineUsers, socket, isLoading, startupError, login, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
