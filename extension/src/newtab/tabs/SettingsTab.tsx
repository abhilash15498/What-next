import { useAppData } from '../../lib/AppDataContext';
import { SettingsPanel } from '../../components/SettingsPanel';

export function SettingsTab() {
  const { prefs, updatePrefs, toggleCategory, clearAllData, regenerate } = useAppData();
  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-4">Settings & Privacy</h2>
      <SettingsPanel
        prefs={prefs}
        onUpdate={updatePrefs}
        onToggleCategory={toggleCategory}
        onClearAll={clearAllData}
        onRegenerate={regenerate}
      />
    </div>
  );
}
