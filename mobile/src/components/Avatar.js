import { Image, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../config";

export function Avatar({ user, size = 48 }) {
  const initials = (user?.fullName || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {user?.profilePic ? (
        <Image
          source={{ uri: user.profilePic }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Text style={[styles.initials, { fontSize: Math.max(14, size * 0.32) }]}>
          {initials}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceLight,
    overflow: "hidden",
  },
  initials: { color: COLORS.accentLight, fontWeight: "700" },
});
