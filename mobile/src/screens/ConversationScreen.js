import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { Avatar } from "../components/Avatar";
import { COLORS } from "../config";

function formatTime(date) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ConversationScreen({ navigation, route }) {
  const user = route.params.user;
  const { authUser, onlineUsers } = useContext(AuthContext);
  const { messages, getMessages, sendMessage, setSelectedUser } =
    useContext(ChatContext);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const listRef = useRef(null);
  const isOnline = onlineUsers.includes(user._id);

  useEffect(() => {
    setSelectedUser(user);
    getMessages(user._id).catch((loadError) =>
      setError(
        loadError.response?.data?.message ||
          loadError.message ||
          "Unable to load messages.",
      ),
    );
    return () => setSelectedUser(null);
  }, [getMessages, setSelectedUser, user]);

  const send = useCallback(
    async (message) => {
      setError("");
      try {
        await sendMessage(user._id, message);
        requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
        return true;
      } catch (sendError) {
        setError(
          sendError.response?.data?.message ||
            sendError.message ||
            "Unable to send your message.",
        );
        return false;
      }
    },
    [sendMessage, user._id],
  );

  const sendText = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    send({ text }).then((sent) => {
      if (!sent) setInput(text);
    });
  };

  const sendImage = async () => {
    setError("");
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError("Allow photo access to send an image.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.55,
        base64: true,
      });
      if (result.canceled) return;
      const image = result.assets?.[0];
      if (!image?.base64) {
        setError("Could not read the selected image. Please try another photo.");
        return;
      }
      await send({ image: `data:${image.mimeType || "image/jpeg"};base64,${image.base64}` });
    } catch (pickerError) {
      setError(pickerError.message || "Unable to select that image.");
    }
  };

  const renderMessage = ({ item }) => {
    const mine = item.senderId === authUser?._id;
    const sender = mine ? authUser : user;
    return (
      <View style={[styles.messageRow, mine ? styles.mineRow : styles.theirRow]}>
        {!mine && <Avatar user={sender} size={27} />}
        <View style={[styles.messageColumn, mine ? styles.alignRight : styles.alignLeft]}>
          <View style={[styles.bubble, mine ? styles.mineBubble : styles.theirBubble]}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.messageImage} />
            ) : (
              <Text style={styles.messageText}>{item.text}</Text>
            )}
          </View>
          <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
        </View>
        {mine && <Avatar user={sender} size={27} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to conversations"
            onPress={() => navigation.goBack()}
            style={styles.back}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Avatar user={user} size={42} />
          <View style={styles.headerInfo}>
            <Text numberOfLines={1} style={styles.userName}>{user.fullName}</Text>
            <Text style={styles.status}>
              {isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        <FlatList
          ref={listRef}
          data={messages.filter(Boolean)}
          keyExtractor={(item, index) => item._id || `${item.createdAt}-${index}`}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Say hello to {user.fullName.split(" ")[0]}</Text>
              <Text style={styles.emptyText}>Your messages are private between you two.</Text>
            </View>
          }
        />

        <View style={styles.composer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose an image"
            onPress={sendImage}
            style={styles.attachButton}
          >
            <Text style={styles.attachText}>＋</Text>
          </Pressable>
          <TextInput
            onChangeText={setInput}
            onSubmitEditing={sendText}
            placeholder="Write a message..."
            placeholderTextColor={COLORS.muted}
            returnKeyType="send"
            style={styles.input}
            value={input}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            onPress={sendText}
            style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}
          >
            <Text style={styles.sendText}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    gap: 11,
  },
  back: { width: 28, alignItems: "flex-start", justifyContent: "center" },
  backText: { color: COLORS.text, fontSize: 34, lineHeight: 36 },
  headerInfo: { flex: 1 },
  userName: { color: COLORS.text, fontSize: 15, fontWeight: "700" },
  status: { color: COLORS.online, fontSize: 12, marginTop: 3 },
  messageList: { paddingHorizontal: 14, paddingVertical: 18, flexGrow: 1 },
  messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 7, marginBottom: 15 },
  mineRow: { justifyContent: "flex-end" },
  theirRow: { justifyContent: "flex-start" },
  messageColumn: { maxWidth: "78%" },
  alignRight: { alignItems: "flex-end" },
  alignLeft: { alignItems: "flex-start" },
  bubble: { borderRadius: 18, overflow: "hidden", paddingHorizontal: 13, paddingVertical: 10 },
  mineBubble: { backgroundColor: COLORS.accent, borderBottomRightRadius: 5 },
  theirBubble: { backgroundColor: COLORS.incoming, borderBottomLeftRadius: 5 },
  messageText: { color: COLORS.text, fontSize: 15, lineHeight: 21 },
  messageImage: { width: 210, height: 190, borderRadius: 11, margin: -4 },
  time: { color: COLORS.muted, fontSize: 10, marginTop: 5, marginHorizontal: 3 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyTitle: { color: COLORS.text, fontWeight: "600", fontSize: 16, textAlign: "center" },
  emptyText: { color: COLORS.muted, marginTop: 7, fontSize: 13, textAlign: "center" },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  attachButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: COLORS.surface,
  },
  attachText: { color: COLORS.accentLight, fontSize: 26, lineHeight: 29 },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: COLORS.accent,
  },
  sendText: { color: "white", fontSize: 23, fontWeight: "700" },
  pressed: { opacity: 0.75 },
  errorBox: { paddingHorizontal: 16, paddingTop: 10 },
  errorText: { color: "#fca5a5", fontSize: 13 },
});
