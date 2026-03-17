import { ReactNode } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type FieldPath,
  type RegisterOptions,
} from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  rules?: RegisterOptions<T, FieldPath<T>>;
  children:
    | ReactNode
    | ((field: {
        value: unknown;
        onChange: (...args: unknown[]) => void;
        onBlur: () => void;
        name: string;
      }) => ReactNode);
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  rules,
  children,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <div className="space-y-1.5">
          <label
            htmlFor={name}
            className="flex items-center gap-2 text-sm font-medium select-none"
          >
            {label}
            {required && <span className="text-red-500 ms-1">*</span>}
          </label>

          {typeof children === "function"
            ? children(field as Parameters<typeof children>[0])
            : children}

          {fieldState.error && (
            <p className="text-xs text-red-500">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}
