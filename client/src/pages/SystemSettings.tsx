import { useState } from "react";
import { Database, Globe, Clock, CalendarDays, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SystemSettings() {
  const [timezone, setTimezone] = useState("UTC+3 (Arabia Standard Time)");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [currency, setCurrency] = useState("SAR — Saudi Riyal");

  const timezones = [
    "UTC+3 (Arabia Standard Time)",
    "UTC+0 (GMT)",
    "UTC-5 (Eastern Time)",
    "UTC-6 (Central Time)",
    "UTC+1 (CET)",
    "UTC+8 (CST)",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">System Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure system-wide preferences and regional settings</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Database size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">Regional & Localization</h3>
            <p className="text-xs text-muted-foreground">Configure timezone, date format, and default currency</p>
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
            <Clock size={13} className="text-muted-foreground" /> Timezone
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between font-normal text-sm h-9">
                {timezone}
                <Globe size={14} className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
              {timezones.map((tz) => (
                <DropdownMenuItem key={tz} onClick={() => setTimezone(tz)}>
                  {tz}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Date format */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
            <CalendarDays size={13} className="text-muted-foreground" /> Date Format
          </label>
          <select
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            className="w-full h-9 px-3 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
          >
            <option>DD/MM/YYYY</option>
            <option>MM/DD/YYYY</option>
            <option>YYYY-MM-DD</option>
          </select>
        </div>

        {/* Default currency */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Default Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full h-9 px-3 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
          >
            <option>SAR — Saudi Riyal</option>
            <option>USD — US Dollar</option>
            <option>EUR — Euro</option>
            <option>GBP — British Pound</option>
            <option>AED — UAE Dirham</option>
          </select>
        </div>

        <Button className="gap-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90">
          <Save size={14} /> Save Changes
        </Button>
      </div>
    </div>
  );
}
