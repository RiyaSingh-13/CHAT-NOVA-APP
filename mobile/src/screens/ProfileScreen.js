import { useContext, useState } from "react";
import {
  ActivityIndicator,
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
import { Avatar } from "../components/Avatar";
import { COLORS } from "../config";

export function ProfileScreen({ navigation }) {
  const { authUser, updateProfile } = useContext(AuthContext);
  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [picture, setPicture] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const choosePicture = async () => {
    setError("");
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError("Allow photo access to choose a profile picture.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.55,
        base64: true,
      });
      if (result.canceled) return;
      const image = result.assets?.[0];
      if (!image?.base64) {
        setError("Could not read the selected image. Please try another photo.");
        return;
      }
      setPicture({
        preview: image.uri,
        data: `data:${image.mimeType || "image/jpeg"};base64,${image.base64}`,
      });
    } catch (pickerError) {
      setError(pickerError.message || "Unable to select that image.");
    }
  };

  const save = async () => {
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await updateProfile({
        fullName: name.trim(),
        bio: bio.trim(),
        ...(picture ? { profilePic: picture.data } : {}),
      });
      navigation.goBack();
    } catch (saveError) {
      setError(
        saveError.response?.data?.message ||
          saveError.message ||
          "Unable to save your profile.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Profile details</Text>
        </View>
        <View style={styles.form}>
          <Pressable onPress={choosePicture} style={styles.photoPicker}>
            {picture ? (
              <Image source={{ uri: picture.preview }} style={styles.photo} />
            ) : (
              <Avatar user={authUser} size={100} />
            )}
            <Text style={styles.changePhoto}>Change photo</Text>
          </Pressable>
          <Text style={styles.label}>NAME</Text>
          <TextInput
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            value={name}
          />
          <Text style={styles.label}>BIO</Text>
          <TextInput
            multiline
            onChangeText={setBio}
            placeholder="A few words about you"
            placeholderTextColor={COLORS.muted}
            style={[styles.input, styles.bio]}
            textAlignVertical="top"
            value={bio}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            disabled={busy}
            onPress={save}
            style={({ pressed }) => [styles.save, pressed && styles.pressed]}
          >
            {busy ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveText}>Save changes</Text>
            )}
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
  },
  back: { width: 42 },
  backText: { color: COLORS.text, fontSize: 34, lineHeight: 36 },
  title: { color: COLORS.text, fontWeight: "700", fontSize: 18 },
  form: { paddingHorizontal: 22, paddingTop: 28 },
  photoPicker: { alignItems: "center", marginBottom: 32 },
  photo: { width: 100, height: 100, borderRadius: 50 },
  changePhoto: { color: COLORS.accentLight, fontWeight: "600", marginTop: 10 },
  label: {
    color: COLORS.muted,
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    color: COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    marginBottom: 22,
  },
  bio: { minHeight: 120 },
  save: {
    backgroundColor: COLORS.accent,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    marginTop: 4,
  },
  saveText: { color: "white", fontSize: 15, fontWeight: "700" },
  pressed: { opacity: 0.8 },
  error: { color: "#fca5a5", marginBottom: 14, lineHeight: 20 },
});
