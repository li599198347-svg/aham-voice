import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn("input", invalid && "is-error", className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn("textarea", invalid && "is-error", className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});

// Labelled control + help block, mapped onto the official `.field` wrapper
// (flex column) with `.label` / `.hint` / `.err`. Use everywhere there's a
// labelled control — including login. When `error` is present the message
// renders as `.err` (red); otherwise `.hint`.
export function FormRow({
  label,
  hint,
  error,
  required,
  optional,
  horizontal,
  children,
  className,
  htmlFor,
}: {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  horizontal?: boolean;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={cn("field", horizontal && "field--row", className)}>
      {label && (
        <label className="label" htmlFor={htmlFor}>
          {label}
          {required && <span className="label__req">*</span>}
          {optional && <span className="label__opt">可选</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="err">{error}</p>
      ) : hint ? (
        <p className="hint">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("form-section", className)}>
      {title && (
        <h3 className="text-subheading form-section__title">
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}
