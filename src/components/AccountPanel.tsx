import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type AuthMode = "sign-in" | "sign-up";

type AccountPanelProps = {
  authError: string | null;
  authMessage: string | null;
  authMode: AuthMode;
  authUserEmail?: string;
  isAuthLoading: boolean;
  isSupabaseConfigured: boolean;
  syncError: string | null;
  syncStatus: "local" | "remote" | "syncing" | "error";
  onSetAuthMode: (mode: AuthMode) => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignOut: () => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
};

function getSyncLabel(syncStatus: AccountPanelProps["syncStatus"]) {
  if (syncStatus === "remote") {
    return "Сохранено в аккаунте";
  }

  if (syncStatus === "syncing") {
    return "Синхронизируем";
  }

  if (syncStatus === "error") {
    return "Нужна повторная синхронизация";
  }

  return "Сохранено на устройстве";
}

export function AccountPanel({
  authError,
  authMessage,
  authMode,
  authUserEmail,
  isAuthLoading,
  isSupabaseConfigured,
  syncError,
  syncStatus,
  onSetAuthMode,
  onSignIn,
  onSignOut,
  onSignUp,
}: AccountPanelProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isSignUp = authMode === "sign-up";
  const canSubmit = email.trim().length > 0 && password.length >= 6 && !isAuthLoading;

  const submit = () => {
    if (!canSubmit) {
      return;
    }

    if (isSignUp) {
      onSignUp(email.trim(), password);
      return;
    }

    onSignIn(email.trim(), password);
  };

  if (!isSupabaseConfigured) {
    return (
      <View style={styles.accountBox}>
        <View style={styles.statusRow}>
          <Text style={styles.statusTitle}>Аккаунт</Text>
          <Text style={styles.localBadge}>Локально</Text>
        </View>
        <Text style={styles.accountText}>
          Бар сохраняется на этом устройстве. Для облачной синхронизации добавь Supabase env-переменные.
        </Text>
      </View>
    );
  }

  if (authUserEmail) {
    return (
      <View style={styles.accountBox}>
        <View style={styles.statusRow}>
          <View style={styles.statusCopy}>
            <Text style={styles.statusTitle}>{authUserEmail}</Text>
            <Text style={styles.accountText}>{getSyncLabel(syncStatus)}</Text>
          </View>
          <Text style={[styles.syncBadge, syncStatus === "error" && styles.syncBadgeError]}>
            {syncStatus === "error" ? "Ошибка" : "Аккаунт"}
          </Text>
        </View>
        {syncError ? <Text style={styles.errorText}>{syncError}</Text> : null}
        <Pressable accessibilityRole="button" onPress={onSignOut} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{isAuthLoading ? "Выходим" : "Выйти"}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.accountBox}>
      <View style={styles.statusRow}>
        <View style={styles.statusCopy}>
          <Text style={styles.statusTitle}>Сохранить бар</Text>
          <Text style={styles.accountText}>Войди или создай аккаунт, чтобы перенести бар на другое устройство.</Text>
        </View>
        <Text style={styles.localBadge}>{getSyncLabel(syncStatus)}</Text>
      </View>

      <View style={styles.modeRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onSetAuthMode("sign-in")}
          style={[styles.modeButton, !isSignUp && styles.modeButtonActive]}
        >
          <Text style={[styles.modeButtonText, !isSignUp && styles.modeButtonTextActive]}>Войти</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onSetAuthMode("sign-up")}
          style={[styles.modeButton, isSignUp && styles.modeButtonActive]}
        >
          <Text style={[styles.modeButtonText, isSignUp && styles.modeButtonTextActive]}>Создать</Text>
        </Pressable>
      </View>

      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        inputMode="email"
        onChangeText={setEmail}
        placeholder="email"
        placeholderTextColor="#6f7d90"
        style={styles.input}
        value={email}
      />
      <TextInput
        autoCapitalize="none"
        autoComplete="password"
        onChangeText={setPassword}
        placeholder="пароль от 6 символов"
        placeholderTextColor="#6f7d90"
        secureTextEntry
        style={styles.input}
        value={password}
      />

      {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
      {authMessage ? <Text style={styles.messageText}>{authMessage}</Text> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSubmit }}
        disabled={!canSubmit}
        onPress={submit}
        style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
      >
        <Text style={[styles.primaryButtonText, !canSubmit && styles.primaryButtonTextDisabled]}>
          {isAuthLoading ? "Проверяем" : isSignUp ? "Создать аккаунт" : "Войти"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  accountBox: {
    backgroundColor: "#121923",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2f3d4a",
    padding: 12,
    gap: 10,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  statusCopy: {
    flex: 1,
    gap: 3,
  },
  statusTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "900",
  },
  accountText: {
    color: "#9fb0c5",
    fontSize: 13,
    lineHeight: 18,
  },
  localBadge: {
    color: "#dce4ef",
    backgroundColor: "#17212b",
    borderRadius: 8,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: "900",
  },
  syncBadge: {
    color: "#7ce0ab",
    backgroundColor: "#142922",
    borderRadius: 8,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: "900",
  },
  syncBadgeError: {
    color: "#ffc3c3",
    backgroundColor: "#3a1f22",
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
  },
  modeButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#405061",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#17212b",
  },
  modeButtonActive: {
    backgroundColor: "#52c4c8",
    borderColor: "#52c4c8",
  },
  modeButtonText: {
    color: "#dce4ef",
    fontSize: 13,
    fontWeight: "900",
  },
  modeButtonTextActive: {
    color: "#0d2022",
  },
  input: {
    color: "#f8fafc",
    backgroundColor: "#101720",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#405061",
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  primaryButton: {
    minHeight: 46,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4b860",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonDisabled: {
    backgroundColor: "#303846",
  },
  primaryButtonText: {
    color: "#151922",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  primaryButtonTextDisabled: {
    color: "#8591a3",
  },
  secondaryButton: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#405061",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#17212b",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  secondaryButtonText: {
    color: "#dce4ef",
    fontSize: 13,
    fontWeight: "900",
  },
  errorText: {
    color: "#ffc3c3",
    fontSize: 13,
    lineHeight: 18,
  },
  messageText: {
    color: "#7ce0ab",
    fontSize: 13,
    lineHeight: 18,
  },
});
