"use client";

import * as React from "react";
import { type FieldValues, useController } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { InputWrapper } from "./InputWrapper";
import { type BaseFieldProps } from "./types";

type TextAreaFieldProps<T extends FieldValues> = BaseFieldProps<T> &
  Omit<React.ComponentProps<typeof Textarea>, "name" | "defaultValue">;

export function TextAreaField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  subtext,
  wrapperClassName,
  ...textareaProps
}: TextAreaFieldProps<T>) {
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
      <Textarea
        id={name}
        aria-invalid={!!fieldState.error}
        {...textareaProps}
        {...field}
        value={field.value ?? ""}
      />
    </InputWrapper>
  );
}
