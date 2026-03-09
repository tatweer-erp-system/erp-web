import { Palette } from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function AppSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">App Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Customize appearance, theme, and display preferences</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Palette size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">Theme & Appearance</h3>
            <p className="text-xs text-muted-foreground">Customize colors and display mode</p>
          </div>
        </div>
        <ThemeSwitcher />
      </div>
    </div>
  );
}
