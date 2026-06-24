import { type ReactNode } from "react";
import { type Control, type FieldPath, type FieldValues } from "react-hook-form";

export interface BaseFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  required?: boolean;
  subtext?: ReactNode;
  wrapperClassName?: string;
}
