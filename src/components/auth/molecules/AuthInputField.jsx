"use client";

import { useState } from "react";
import Icon from "@/components/shared/atoms/Icon";

/**
 * [Atomic Design: MOLECULE — Auth]
 * AuthInputField — Migrasi dari `.form-group`, `.label-row`, `.forgot-link`,
 * `.input-wrapper`, `.input-icon`, `input`, dan `.btn-toggle-pwd`
 * pada `GarasiiU/index.html` & `GarasiiU/style.css`.
 */
export default function AuthInputField({
  id,
  name,
  label,
  type = "text",
  placeholder = "",
  icon = "alternate_email",
  value,
  onChange,
  forgotLabel,
  forgotHref = "#",
  onForgotClick,
  required = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="font-mono text-[11px] font-bold tracking-[0.05em] text-ink-secondary"
        >
          {label}
        </label>
        {forgotLabel && (
          <a
            href={forgotHref}
            onClick={onForgotClick}
            className="font-mono text-[11px] font-bold text-action no-underline hover:underline"
          >
            {forgotLabel}
          </a>
        )}
      </div>

      <div className="relative w-full">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted">
          <Icon name={icon} size={18} />
        </span>

        <input
          id={id}
          name={name || id}
          type={resolvedType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full border border-line-subtle bg-canvas py-2.5 pl-[38px] font-mono text-sm text-ink-primary placeholder:text-ink-muted transition-all duration-200 focus:border-action focus:outline-none ${
            isPassword ? "pr-10" : "pr-3"
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-0 bg-transparent text-ink-muted transition-colors hover:text-ink-primary"
          >
            <Icon
              name={showPassword ? "visibility_off" : "visibility"}
              size={18}
            />
          </button>
        )}
      </div>
    </div>
  );
}

