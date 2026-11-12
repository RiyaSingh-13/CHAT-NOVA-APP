import { useContext } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import { ChatProvider } from "./src/context/ChatContext";
import { AuthScreen } from "./src/screens/AuthScreen";
import { ChatListScreen } from "./src/screens/ChatListScreen";
import { ConversationScreen } from "./src/screens/ConversationScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { COLORS } from "./src/config";

const Stack = createNativeStackNavigator();

function NavigationRoot() {
  const { authUser, isLoading } = useContext(AuthContext);
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.accentLight} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        ...DarkTheme,
        colors: { ...DarkTheme.colors, background: COLORS.background },
      }}
    >
      <Stack.Navigator
        key={authUser ? "authenticated" : "unauthenticated"}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: "fade",
        }}
      >
        {authUser ? (
          <>
            <Stack.Screen name="ChatList" component={ChatListScreen} />
            <Stack.Screen name="Conversation" component={ConversationScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ChatProvider>
          <NavigationRoot />
        </ChatProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
});
