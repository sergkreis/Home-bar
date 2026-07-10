import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { SaveUserProfileInput, UserProfile } from "../services/userProfileService";
import { colors, pressed, radii, spacing } from "../theme";

type SyncStatus = "local" | "remote" | "syncing" | "error";
type ProfileSyncStatus = "idle" | "loading" | "saving" | "saved" | "error";

type AccountPanelProps = {
  authUserEmail?: string;
  barSyncError: string | null;
  barSyncStatus: SyncStatus;
  favoritesSyncError: string | null;
  favoritesSyncStatus: SyncStatus;
  isAuthLoading: boolean;
  isSupabaseConfigured: boolean;
  onOpenAuth: () => void;
  onSaveProfile: (profile: SaveUserProfileInput) => Promise<void>;
  onSignOut: () => Promise<void>;
  profile: UserProfile;
  profileError: string | null;
  profileMessage: string | null;
  profileSyncStatus: ProfileSyncStatus;
};

function getSyncLabel(syncStatus: SyncStatus) {
  if (syncStatus === "remote") {
    return "В аккаунте";
  }

  if (syncStatus === "syncing") {
    return "Синхронизация";
  }

  if (syncStatus === "error") {
    return "Нужна проверка";
  }

  return "На устройстве";
}

function getProfileStatusLabel(syncStatus: ProfileSyncStatus) {
  if (syncStatus === "loading") {
    return "Загрузка";
  }

  if (syncStatus === "saving") {
    return "Сохраняем";
  }

  if (syncStatus === "saved") {
    return "Сохранено";
  }

  if (syncStatus === "error") {
    return "Нужна проверка";
  }

  return "Готово";
}

function getBirthDateValidationError(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

  if (!match) {
    return "Дата рождения должна быть в формате ГГГГ-ММ-ДД.";
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  const isRealDate =
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;

  if (!isRealDate || year < 1900) {
    return "Проверь дату рождения.";
  }

  const today = new Date();
  const todayUtc = new Date(Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ));

  if (parsed > todayUtc) {
    return "Дата рождения не может быть в будущем.";
  }

  const minBirthDate = new Date(Date.UTC(
    todayUtc.getUTCFullYear() - 18,
    todayUtc.getUTCMonth(),
    todayUtc.getUTCDate(),
  ));

  if (parsed > minBirthDate) {
    return "Приложение рассчитано на пользователей 18+.";
  }

  return null;
}

export function AccountPanel({
  authUserEmail,
  barSyncError,
  barSyncStatus,
  favoritesSyncError,
  favoritesSyncStatus,
  isAuthLoading,
  isSupabaseConfigured,
  onOpenAuth,
  onSaveProfile,
  onSignOut,
  profile,
  profileError,
  profileMessage,
  profileSyncStatus,
}: AccountPanelProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [birthDate, setBirthDate] = useState(profile.birthDate);
  const birthDateError = getBirthDateValidationError(birthDate);
  const canSaveProfile =
    Boolean(authUserEmail) &&
    profileSyncStatus !== "loading" &&
    profileSyncStatus !== "saving" &&
    !birthDateError;

  useEffect(() => {
    setDisplayName(profile.displayName);
    setBirthDate(profile.birthDate);
  }, [profile.birthDate, profile.displayName]);

  const submitProfile = () => {
    if (!canSaveProfile) {
      return;
    }

    onSaveProfile({
      birthDate,
      displayName,
    });
  };

  if (!isSupabaseConfigured) {
    return (
      <View style={styles.accountBox}>
        <View style={styles.statusRow}>
          <View style={styles.statusCopy}>
            <Text style={styles.statusTitle}>Аккаунты не включены</Text>
            <Text style={styles.accountText}>
              Бар и избранное сохраняются на устройстве. Для production нужно задать Supabase env и выполнить SQL-схему.
            </Text>
          </View>
          <Text style={styles.localBadge}>Локально</Text>
        </View>
      </View>
    );
  }

  if (!authUserEmail) {
    return (
      <View style={styles.accountBox}>
        <View style={styles.statusRow}>
          <View style={styles.statusCopy}>
            <Text style={styles.statusTitle}>Войти в аккаунт</Text>
            <Text style={styles.accountText}>
              После входа приложение покажет бар и избранное из аккаунта. Локальные гостевые напитки останутся на устройстве.
            </Text>
          </View>
          <Text style={styles.localBadge}>Гость</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onOpenAuth}
          style={({ pressed: isPressed }) => [
            styles.primaryButton,
            isPressed && { opacity: pressed.opacity },
          ]}
        >
          <Text style={styles.primaryButtonText}>Войти или создать аккаунт</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.accountBox}>
      <View style={styles.statusRow}>
        <View style={styles.statusCopy}>
          <Text style={styles.statusTitle}>{displayName.trim() || authUserEmail}</Text>
          <Text style={styles.accountText}>{authUserEmail}</Text>
        </View>
        <Text style={styles.syncBadge}>Аккаунт</Text>
      </View>

      <View style={styles.syncGrid}>
        <View style={styles.syncItem}>
          <Text style={styles.syncTitle}>Бар</Text>
          <Text style={[styles.syncState, barSyncStatus === "error" && styles.errorState]}>
            {getSyncLabel(barSyncStatus)}
          </Text>
        </View>
        <View style={styles.syncItem}>
          <Text style={styles.syncTitle}>Избранное</Text>
          <Text style={[styles.syncState, favoritesSyncStatus === "error" && styles.errorState]}>
            {getSyncLabel(favoritesSyncStatus)}
          </Text>
        </View>
        <View style={styles.syncItem}>
          <Text style={styles.syncTitle}>Профиль</Text>
          <Text style={[styles.syncState, profileSyncStatus === "error" && styles.errorState]}>
            {getProfileStatusLabel(profileSyncStatus)}
          </Text>
        </View>
      </View>

      <View style={styles.formBlock}>
        <View style={styles.field}>
          <Text style={styles.label}>Имя</Text>
          <TextInput
            accessibilityLabel="Имя"
            autoCapitalize="words"
            onChangeText={setDisplayName}
            placeholder="Как тебя показывать в приложении"
            placeholderTextColor={colors.textDim}
            style={styles.input}
            value={displayName}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Дата рождения</Text>
          <TextInput
            accessibilityLabel="Дата рождения"
            inputMode="numeric"
            onChangeText={setBirthDate}
            placeholder="ГГГГ-ММ-ДД"
            placeholderTextColor={colors.textDim}
            style={[styles.input, birthDateError && styles.inputError]}
            value={birthDate}
          />
          <Text style={styles.hint}>Формат: 1990-05-24. Нужна для 18+.</Text>
        </View>
      </View>

      {birthDateError ? (
        <Text accessibilityLiveRegion="polite" style={styles.errorText}>{birthDateError}</Text>
      ) : null}
      {barSyncError ? <Text accessibilityLiveRegion="polite" style={styles.errorText}>{barSyncError}</Text> : null}
      {favoritesSyncError ? <Text accessibilityLiveRegion="polite" style={styles.errorText}>{favoritesSyncError}</Text> : null}
      {profileError ? <Text accessibilityLiveRegion="polite" style={styles.errorText}>{profileError}</Text> : null}
      {profileMessage ? <Text accessibilityLiveRegion="polite" style={styles.messageText}>{profileMessage}</Text> : null}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSaveProfile }}
          disabled={!canSaveProfile}
          onPress={submitProfile}
          style={({ pressed: isPressed }) => [
            styles.primaryButton,
            !canSaveProfile && styles.primaryButtonDisabled,
            isPressed && canSaveProfile && { opacity: pressed.opacity },
          ]}
        >
          <Text style={[styles.primaryButtonText, !canSaveProfile && styles.primaryButtonTextDisabled]}>
            {profileSyncStatus === "saving" ? "Сохраняем" : "Сохранить профиль"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onSignOut}
          style={({ pressed: isPressed }) => [
            styles.secondaryButton,
            isPressed && { opacity: pressed.opacity },
          ]}
        >
          <Text style={styles.secondaryButtonText}>{isAuthLoading ? "Выходим" : "Выйти"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  accountBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  statusCopy: {
    flex: 1,
    gap: 4,
  },
  statusTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
  },
  accountText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  localBadge: {
    color: colors.text,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.pill,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 11,
    fontWeight: "900",
  },
  syncBadge: {
    color: colors.success,
    backgroundColor: colors.successBg,
    borderRadius: radii.pill,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 11,
    fontWeight: "900",
  },
  syncGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  syncItem: {
    flexGrow: 1,
    flexBasis: 150,
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: spacing.md,
    gap: 4,
  },
  syncTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  syncState: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: "900",
  },
  errorState: {
    color: colors.danger,
  },
  formBlock: {
    gap: spacing.md,
  },
  field: {
    gap: 6,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
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
  inputError: {
    borderColor: colors.danger,
  },
  hint: {
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 17,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  primaryButton: {
    flexGrow: 1,
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
  secondaryButton: {
    flexGrow: 1,
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
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
