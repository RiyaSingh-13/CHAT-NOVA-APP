import { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { Avatar } from "../components/Avatar";
import { COLORS } from "../config";

export function ChatListScreen({ navigation }) {
  const { authUser, onlineUsers, logout } = useContext(AuthContext);
  const { users, unseenMessages, getUsers, setSelectedUser } =
    useContext(ChatContext);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      setError("");
      await getUsers();
    } catch (loadError) {
      setError(
        loadError.response?.data?.message ||
          loadError.message ||
          "Unable to load conversations.",
      );
    }
  }, [getUsers]);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers]),
  );

  const refresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const filteredUsers = users.filter((user) =>
    (user.fullName || "").toLowerCase().includes(query.trim().toLowerCase()),
  );

  const openConversation = (user) => {
    setSelectedUser(user);
    navigation.navigate("Conversation", { user });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Text style={styles.brandLetter}>N</Text>
          </View>
          <View>
            <Text style={styles.brand}>Chat Nova</Text>
            <Text style={styles.subheading}>Your conversations</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => navigation.navigate("Profile")}
        >
          <Avatar user={authUser} size={44} />
        </Pressable>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          onChangeText={setQuery}
          placeholder="Search people"
          placeholderTextColor={COLORS.muted}
          style={styles.searchInput}
          value={query}
        />
      </View>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadUsers}>
            <Text style={styles.retry}>Try again</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>MESSAGES</Text>
        <Text style={styles.count}>{filteredUsers.length}</Text>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            onRefresh={refresh}
            refreshing={refreshing}
            tintColor={COLORS.accentLight}
          />
        }
        ListEmptyComponent={
          error ? null : (
            <View style={styles.empty}>
              {users.length === 0 ? (
                <ActivityIndicator color={COLORS.accentLight} />
              ) : (
                <>
                  <Text style={styles.emptyTitle}>No matches</Text>
                  <Text style={styles.emptyText}>Try another name.</Text>
                </>
              )}
            </View>
          )
        }
        renderItem={({ item }) => {
          const isOnline = onlineUsers.includes(item._id);
          const unread = unseenMessages[item._id] || 0;
          return (
            <Pressable
              onPress={() => openConversation(item)}
              style={({ pressed }) => [styles.userRow, pressed && styles.pressed]}
            >
              <View style={styles.avatarWrap}>
                <Avatar user={item} size={54} />
                <View
                  style={[styles.status, isOnline ? styles.online : styles.offline]}
                />
              </View>
              <View style={styles.userInfo}>
                <View style={styles.nameLine}>
                  <Text numberOfLines={1} style={styles.userName}>
                    {item.fullName}
                  </Text>
                  {unread > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unread}</Text>
                    </View>
                  )}
                </View>
                <Text numberOfLines={1} style={styles.userStatus}>
                  {isOnline ? "Online" : item.bio || "Tap to start a conversation"}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        }}
      />

      <Pressable
        onPress={async () => {
          try {
            await logout();
          } catch (logoutError) {
            setError(logoutError.message || "Could not sign out.");
          }
        }}
        style={styles.logout}
      >
        <Text style={styles.logoutText}>Sign out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  brandIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.accent,
  },
  brandLetter: { color: "white", fontWeight: "800", fontSize: 22 },
  brand: { color: COLORS.text, fontWeight: "700", fontSize: 19 },
  subheading: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  searchBox: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    height: 48,
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 14,
  },
  searchIcon: { color: COLORS.muted, fontSize: 26, marginRight: 8 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 15 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 10,
  },
  sectionTitle: {
    color: COLORS.muted,
    fontSize: 11,
    letterSpacing: 1.4,
    fontWeight: "700",
  },
  count: { color: COLORS.muted, fontSize: 12 },
  list: { paddingHorizontal: 14, paddingBottom: 90, flexGrow: 1 },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  avatarWrap: { position: "relative" },
  status: {
    position: "absolute",
    width: 13,
    height: 13,
    right: 0,
    bottom: 1,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  online: { backgroundColor: COLORS.online },
  offline: { backgroundColor: COLORS.muted },
  userInfo: { flex: 1, marginLeft: 13 },
  nameLine: { flexDirection: "row", alignItems: "center" },
  userName: { flex: 1, color: COLORS.text, fontSize: 15, fontWeight: "600" },
  userStatus: { color: COLORS.muted, fontSize: 12, marginTop: 5 },
  badge: {
    backgroundColor: COLORS.accent,
    minWidth: 21,
    height: 21,
    paddingHorizontal: 5,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  badgeText: { color: "white", fontSize: 11, fontWeight: "700" },
  chevron: { color: COLORS.muted, fontSize: 26, marginLeft: 8 },
  empty: { alignItems: "center", justifyContent: "center", padding: 40, gap: 8 },
  emptyTitle: { color: COLORS.text, fontWeight: "600" },
  emptyText: { color: COLORS.muted, fontSize: 13 },
  errorBox: { paddingHorizontal: 22, paddingTop: 14 },
  errorText: { color: "#fca5a5", lineHeight: 20 },
  retry: { color: COLORS.accentLight, marginTop: 6, fontWeight: "600" },
  logout: { position: "absolute", bottom: 12, right: 20, padding: 10 },
  logoutText: { color: COLORS.muted, fontSize: 13 },
  pressed: { opacity: 0.75 },
});
