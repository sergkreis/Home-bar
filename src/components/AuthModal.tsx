import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Eye from "lucide-react-native/dist/cjs/icons/eye";
import EyeOff from "lucide-react-native/dist/cjs/icons/eye-off";

import { AuthMode } from "../hooks/useAuth";
import { colors, pressed, radii, spacing } from "../theme";

type AuthModalProps = {
  authError: string | null;
  authMessage: string | null;
  authMode: AuthMode;
  isAuthLoading: boolean;
  onClose: () => void;
  onResetPassword: (email: string) => Promise<void>;
  onSetAuthMode: (mode: AuthMode) => void;
  onSignIn: (
    email: string,
    password: string,
    rememberSession?: boolean,
  ) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  onUpdatePassword: (password: string) => Promise<void>;
  visible: boolean;
};

function getModeTitle(authMode: AuthMode) {
  if (authMode === "sign-up") {
    return "Создать аккаунт";
  }

  if (authMode === "reset-password") {
    return "Восстановить пароль";
  }

  if (authMode === "update-password") {
    return "Новый пароль";
  }

  return "Войти";
}

function getModeText(authMode: AuthMode) {
  if (authMode === "reset-password") {
    return "Пришлем ссылку для восстановления на почту.";
  }

  if (authMode === "update-password") {
    return "После перехода из письма задай новый пароль.";
  }

  return "Вход откроет бар и избранное именно из аккаунта. Локальные гостевые напитки не переносятся автоматически.";
}

export function AuthModal({
  authError,
  authMessage,
  authMode,
  isAuthLoading,
  onClose,
  onResetPassword,
  onSetAuthMode,
  onSignIn,
  onSignUp,
  onUpdatePassword,
  visible,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const passwordInputRef = useRef<TextInput>(null);
  const passwordRepeatInputRef = useRef<TextInput>(null);
  const isSignUp = authMode === "sign-up";
  const isReset = authMode === "reset-password";
  const isUpdatePassword = authMode === "update-password";
  const passwordsMatch =
    password.length >= 6 && (!isSignUp || password === passwordRepeat);
  const canSubmit =
    !isAuthLoading &&
    (isReset
      ? email.trim().length > 0
      : isUpdatePassword
        ? password.length >= 6
        : email.trim().length > 0 && passwordsMatch);

  useEffect(() => {
    if (!visible) {
      setPassword("");
      setPasswordRepeat("");
      setIsPasswordVisible(false);
    }
  }, [visible]);

  const submit = () => {
    if (!canSubmit) {
      return;
    }

    if (isReset) {
      onResetPassword(email.trim());
      return;
    }

    if (isUpdatePassword) {
      onUpdatePassword(password);
      return;
    }

    if (isSignUp) {
      onSignUp(email.trim(), password);
      return;
    }

    onSignIn(email.trim(), password, rememberSession);
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.backdrop}
          keyboardShouldPersistTaps="handled"
          style={styles.modalScroll}
        >
          <View style={styles.dialog}>
            <View style={styles.headerRow}>
              <View style={styles.headerCopy}>
                <Text accessibilityRole="header" style={styles.title}>{getModeTitle(authMode)}</Text>
                <Text style={styles.text}>{getModeText(authMode)}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Закрыть окно входа"
                onPress={onClose}
                style={({ pressed: isPressed }) => [
                  styles.closeButton,
                  isPressed && { opacity: pressed.opacity },
                ]}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>

            {!isUpdatePassword ? (
              <View style={styles.modeRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: authMode === "sign-in" }}
                  onPress={() => onSetAuthMode("sign-in")}
                  style={({ pressed: isPressed }) => [
                    styles.modeButton,
                    authMode === "sign-in" && styles.modeButtonActive,
                    isPressed && { opacity: pressed.opacity },
                  ]}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      authMode === "sign-in" && styles.modeButtonTextActive,
                    ]}
                  >
                    Войти
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: authMode === "sign-up" }}
                  onPress={() => onSetAuthMode("sign-up")}
                  style={({ pressed: isPressed }) => [
                    styles.modeButton,
                    authMode === "sign-up" && styles.modeButtonActive,
                    isPressed && { opacity: pressed.opacity },
                  ]}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      authMode === "sign-up" && styles.modeButtonTextActive,
                    ]}
                  >
                    Создать
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: authMode === "reset-password" }}
                  onPress={() => onSetAuthMode("reset-password")}
                  style={({ pressed: isPressed }) => [
                    styles.modeButton,
                    authMode === "reset-password" && styles.modeButtonActive,
                    isPressed && { opacity: pressed.opacity },
                  ]}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      authMode === "reset-password" &&
                        styles.modeButtonTextActive,
                    ]}
                  >
                    Сброс
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {!isUpdatePassword ? (
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  accessibilityLabel="Email"
                  autoCapitalize="none"
                  autoComplete="email"
                  inputMode="email"
                  onChangeText={setEmail}
                  onSubmitEditing={() => {
                    if (isReset) {
                      submit();
                      return;
                    }

                    passwordInputRef.current?.focus();
                  }}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.textDim}
                  returnKeyType={isReset ? "go" : "next"}
                  style={styles.input}
                  textContentType="emailAddress"
                  value={email}
                />
              </View>
            ) : null}

            {!isReset ? (
              <View style={styles.field}>
                <Text style={styles.label}>{isUpdatePassword ? "Новый пароль" : "Пароль"}</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    ref={passwordInputRef}
                    accessibilityLabel={isUpdatePassword ? "Новый пароль" : "Пароль"}
                    autoCapitalize="none"
                    autoComplete={isSignUp || isUpdatePassword ? "new-password" : "password"}
                    onChangeText={setPassword}
                    onSubmitEditing={() => {
                      if (isSignUp) {
                        passwordRepeatInputRef.current?.focus();
                        return;
                      }

                      submit();
                    }}
                    placeholder="Минимум 6 символов"
                    placeholderTextColor={colors.textDim}
                    returnKeyType={isSignUp ? "next" : "go"}
                    secureTextEntry={!isPasswordVisible}
                    style={[styles.input, styles.passwordInput]}
                    textContentType={isSignUp || isUpdatePassword ? "newPassword" : "password"}
                    value={password}
                  />
                  <Pressable
                    accessibilityLabel={isPasswordVisible ? "Скрыть пароль" : "Показать пароль"}
                    accessibilityRole="button"
                    onPress={() => setIsPasswordVisible((current) => !current)}
                    style={({ pressed: isPressed }) => [
                      styles.passwordToggle,
                      isPressed && { opacity: pressed.opacity },
                    ]}
                  >
                    {isPasswordVisible ? (
                      <EyeOff color={colors.textMuted} size={21} strokeWidth={2.2} />
                    ) : (
                      <Eye color={colors.textMuted} size={21} strokeWidth={2.2} />
                    )}
                  </Pressable>
                </View>
              </View>
            ) : null}

            {isSignUp ? (
              <View style={styles.field}>
                <Text style={styles.label}>Повтори пароль</Text>
                <TextInput
                  ref={passwordRepeatInputRef}
                  accessibilityLabel="Повтори пароль"
                  autoCapitalize="none"
                  autoComplete="new-password"
                  onChangeText={setPasswordRepeat}
                  onSubmitEditing={submit}
                  placeholder="Тот же пароль ещё раз"
                  placeholderTextColor={colors.textDim}
                  returnKeyType="go"
                  secureTextEntry={!isPasswordVisible}
                  style={styles.input}
                  textContentType="newPassword"
                  value={passwordRepeat}
                />
              </View>
            ) : null}

            {!isSignUp && !isReset && !isUpdatePassword ? (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: rememberSession }}
                onPress={() => setRememberSession((current) => !current)}
                style={({ pressed: isPressed }) => [
                  styles.rememberRow,
                  isPressed && { opacity: pressed.opacity },
                ]}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberSession && styles.checkboxChecked,
                  ]}
                >
                  {rememberSession ? (
                    <Text style={styles.checkboxText}>✓</Text>
                  ) : null}
                </View>
                <Text style={styles.rememberText}>Не выходить из аккаунта</Text>
              </Pressable>
            ) : null}

            {isSignUp &&
            passwordRepeat.length > 0 &&
            password !== passwordRepeat ? (
              <Text accessibilityLiveRegion="polite" style={styles.errorText}>Пароли не совпадают.</Text>
            ) : null}
            {authError ? (
              <Text accessibilityLiveRegion="polite" style={styles.errorText}>{authError}</Text>
            ) : null}
            {authMessage ? (
              <Text accessibilityLiveRegion="polite" style={styles.messageText}>{authMessage}</Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSubmit }}
              disabled={!canSubmit}
              onPress={submit}
              style={({ pressed: isPressed }) => [
                styles.primaryButton,
                !canSubmit && styles.primaryButtonDisabled,
                isPressed && canSubmit && { opacity: pressed.opacity },
              ]}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  !canSubmit && styles.primaryButtonTextDisabled,
                ]}
              >
                {isAuthLoading
                  ? "Проверяем"
                  : isReset
                    ? "Отправить письмо"
                    : isUpdatePassword
                      ? "Сохранить пароль"
                      : isSignUp
                        ? "Создать аккаунт"
                        : "Войти"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  modalScroll: {
    flex: 1,
  },
  backdrop: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceTranslucentSoft,
    padding: spacing.md,
    paddingVertical: spacing.xl,
  },
  dialog: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 29,
  },
  text: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLight,
  },
  closeButtonText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 28,
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
  },
  modeButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLight,
  },
  modeButtonActive: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.surfaceDark,
  },
  modeButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  modeButtonTextActive: {
    color: colors.textInverse,
  },
  input: {
    color: colors.text,
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  field: {
    gap: 6,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
  },
  passwordRow: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 56,
  },
  passwordToggle: {
    position: "absolute",
    right: 1,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "flex-start",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLight,
  },
  checkboxChecked: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.surfaceDark,
  },
  checkboxText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 16,
  },
  rememberText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceDark,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.borderStrong,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  primaryButtonTextDisabled: {
    color: colors.textDim,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  messageText: {
    color: colors.success,
    fontSize: 13,
    lineHeight: 18,
  },
});
