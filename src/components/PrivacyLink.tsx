import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, pressed } from "../theme";

export const PRIVACY_URL = "https://inmybar.app/privacy.html";

export async function openPrivacyPolicy(open = Linking.openURL): Promise<boolean> {
  try {
    await open(PRIVACY_URL);
    return true;
  } catch {
    return false;
  }
}

export function PrivacyLink() {
  const [failed, setFailed] = useState(false);
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Политика конфиденциальности — открыть в браузере"
        onPress={async () => setFailed(!(await openPrivacyPolicy()))}
        style={({ pressed: isPressed }) => [styles.link, isPressed && { opacity: pressed.opacity }]}
      >
        <Text style={styles.text}>Политика конфиденциальности ↗</Text>
      </Pressable>
      {failed ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          Не удалось открыть страницу. Адрес: {PRIVACY_URL}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "flex-start", gap: 4 },
  link: { minHeight: 44, justifyContent: "center", paddingVertical: 8 },
  text: { color: colors.teal, fontSize: 14, fontWeight: "700", textDecorationLine: "underline" },
  error: { color: colors.danger, fontSize: 13 },
});
