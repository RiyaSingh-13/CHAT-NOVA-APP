import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { api, socket } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const getUsers = useCallback(async () => {
    const { data } = await api.get("/api/messages/users");
    if (!data.success) {
      throw new Error(data.message || "Unable to load your conversations.");
    }
    setUsers(data.users);
    setUnseenMessages(data.unseenMessages || {});
  }, [api]);

  const getMessages = useCallback(
    async (userId) => {
      const { data } = await api.get(`/api/messages/${userId}`);
      if (!data.success) {
        throw new Error(data.message || "Unable to load messages.");
      }
      setMessages(data.messages || []);
      setUnseenMessages((current) => ({ ...current, [userId]: 0 }));
    },
    [api],
  );

  const sendMessage = useCallback(
    async (userId, message) => {
      const { data } = await api.post(`/api/messages/send/${userId}`, message);
      if (!data.success) {
        throw new Error(data.message || "Unable to send your message.");
      }
      setMessages((current) => [...current, data.message]);
    },
    [api],
  );

  useEffect(() => {
    if (!socket) return undefined;

    const handleNewMessage = (incomingMessage) => {
      if (selectedUser?._id === incomingMessage.senderId) {
        setMessages((current) => [...current, { ...incomingMessage, seen: true }]);
        api
          .put(`/api/messages/mark/${incomingMessage._id}`)
          .catch((error) =>
            console.error("Could not mark message as seen:", error.message),
          );
      } else {
        setUnseenMessages((current) => ({
          ...current,
          [incomingMessage.senderId]:
            (current[incomingMessage.senderId] || 0) + 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [api, selectedUser, socket]);

  const value = useMemo(
    () => ({
      users,
      messages,
      selectedUser,
      unseenMessages,
      getUsers,
      getMessages,
      sendMessage,
      setSelectedUser,
    }),
    [
      users,
      messages,
      selectedUser,
      unseenMessages,
      getUsers,
      getMessages,
      sendMessage,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
