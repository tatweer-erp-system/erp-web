import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "antd";
import { useDebounce } from "@/hooks/useDebounce";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

/**
 * Debounced search input using Ant Design Input.Search.
 * Debounces onChange by 300ms to avoid excessive re-renders.
 * RTL-safe via ConfigProvider direction inheritance.
 */
export function SearchInput({
  value,
  onChange,
  placeholder,
}: SearchInputProps) {
  const lang = useLangStore(s => s.lang);
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 300);
  const isFirstMount = useRef(true);

  // Sync debounced value to parent
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  // Sync external value changes to local state
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  return (
    <Input.Search
      value={localValue}
      onChange={handleChange}
      onSearch={onChange}
      placeholder={placeholder ?? t("common.search", lang)}
      allowClear
      className="max-w-xs"
    />
  );
}
