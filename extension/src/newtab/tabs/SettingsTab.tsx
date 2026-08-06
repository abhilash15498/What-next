import { useAppData } from '../../lib/AppDataContext';
import { SettingsPanel } from '../../components/SettingsPanel';

export function SettingsTab() {
  const { profile, prefs, updatePrefs, updateProfile, toggleCategory, clearAllData, regenerate } = useAppData();
  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-4">Settings & Privacy</h2>
      <SettingsPanel
        profile={profile}
        prefs={prefs}
        onUpdate={updatePrefs}
        onUpdateProfile={updateProfile}
        onToggleCategory={toggleCategory}
        onClearAll={clearAllData}
        onRegenerate={regenerate}
      />
    </div>
  );
}
