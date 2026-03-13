import { ReactNode } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type FieldPath,
  type RegisterOptions,
} from "react-hook-form";
import { Label } from "@/components/ui/label";

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
          <Label htmlFor={name} className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>

          {typeof children === "function"
            ? children(field as Parameters<typeof children>[0])
            : children}

          {fieldState.error && (
            <p className="text-xs text-destructive">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
