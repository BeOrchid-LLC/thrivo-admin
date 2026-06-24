"use client";

import * as React from "react";
import { type FieldValues, useController } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { InputWrapper } from "./InputWrapper";
import { type BaseFieldProps } from "./types";

type TextFieldProps<T extends FieldValues> = BaseFieldProps<T> &
  Omit<React.ComponentProps<typeof Input>, "name" | "defaultValue">;

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  subtext,
  wrapperClassName,
  ...inputProps
}: TextFieldProps<T>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <InputWrapper
      label={label}
      htmlFor={name}
      required={required}
      subtext={subtext}
      error={fieldState.error?.message}
      className={wrapperClassName}
    >
      <Input
        id={name}
        aria-invalid={!!fieldState.error}
        {...inputProps}
        {...field}
        value={field.value ?? ""}
      />
    </InputWrapper>
  );
}
