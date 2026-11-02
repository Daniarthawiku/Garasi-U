"use client";

import Icon from "@/components/shared/atoms/Icon";
import AuthCheckbox from "../atoms/AuthCheckbox";
import AuthSubmitButton from "../atoms/AuthSubmitButton";
import AuthCardHeader from "../molecules/AuthCardHeader";
import AuthCardTitle from "../molecules/AuthCardTitle";
import AuthInputField from "../molecules/AuthInputField";
import AuthCardFooter from "../molecules/AuthCardFooter";

const SERVICE_STATUS_STYLE = {
  Healthy: "border-status-success/30 bg-status-success/10 text-status-success",
  "Service Soon":
    "border-status-warning/30 bg-status-warning/10 text-status-warning",
  "Need Maintenance":
    "border-status-danger/30 bg-status-danger/10 text-status-danger",
};

/**
 * [Atomic Design: ORGANISM — Auth]
 * AuthCard — Migrasi dari `.login-card` pada `GarasiiU/index.html`, `GarasiiU/signup.html`
 * & `GarasiiU/style.css`. Menggabungkan komponen Atom & Molecule Auth serta
 * memetakan (`.map()`) field input dan preview status kendaraan terdaftar.
 */
export default function AuthCard({
  badgeText = "Welcome Back to Garasiu",
  gatewayText = "GATEWAY // V2.4",
  title = "Enter your Garage",
  subtitle = "Access scheduled service history, fuel consumption analytics, and parts wear monitoring.",
  fields = [],
  formValues = {},
  onFieldChange,
  rememberChecked = false,
  onRememberChange,
  rememberLabel = "Remember Me",
  submitLabel = "Get In",
  submitIcon = "login",
  onSubmit,
  footerPrompt = "Didnt had an account?",
  footerLinkLabel = "Create New",
  footerLinkHref = "/signup",
  onFooterLinkClick,
  vehicles = [],
  feedbackMessage = "",
}) {
  return (
    <div className="w-full max-w-[480px] rounded border border-line-subtle bg-surface-base p-8 shadow-card-auth">
      <AuthCardHeader badgeText={badgeText} gatewayText={gatewayText} />

      <AuthCardTitle title={title} subtitle={subtitle} />

      {feedbackMessage && (
        <div className="mb-4 flex items-center gap-2 rounded border border-action/30 bg-action/10 px-3 py-2 font-mono text-xs text-action">
          <Icon name="check_circle" size={16} />
          <span>{feedbackMessage}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {fields.map((field) => (
          <AuthInputField
            key={field.id}
            id={field.id}
            name={field.name || field.id}
            label={field.label}
            type={field.type}
            placeholder={field.placeholder}
            icon={field.icon}
            value={formValues[field.name || field.id] ?? ""}
            onChange={onFieldChange}
            forgotLabel={field.forgotLabel}
            forgotHref={field.forgotHref}
            onForgotClick={field.onForgotClick}
            required={field.required}
          />
        ))}

        {rememberLabel && (
          <AuthCheckbox
            id="rememberDevice"
            name="rememberDevice"
            label={rememberLabel}
            checked={rememberChecked}
            onChange={onRememberChange}
          />
        )}

        <AuthSubmitButton label={submitLabel} icon={submitIcon} type="submit" />
      </form>

      {/* Telemetry Garage Preview (Mapped Vehicle & Service Status via .map()) */}
      {vehicles.length > 0 && (
        <div className="mt-6 border-t border-line-subtle pt-4">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold tracking-wider text-ink-muted uppercase">
              Synced Garage Units ({vehicles.length})
            </span>
            <span className="font-mono text-[10px] text-action">
              TELEMETRY ONLINE
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between rounded border border-line-subtle bg-canvas px-3 py-2 font-mono text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon
                    name={
                      vehicle.type === "Motorcycle" ||
                      vehicle.type === "Superbike"
                        ? "two_wheeler"
                        : "directions_car"
                    }
                    size={15}
                    className="text-action"
                  />
                  <span className="truncate font-semibold text-ink-primary">
                    {vehicle.name}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    • {vehicle.plate}
                  </span>
                </div>
                <span
                  className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-semibold ${
                    SERVICE_STATUS_STYLE[vehicle.serviceStatus] ||
                    "border-line-subtle bg-surface-raised text-ink-secondary"
                  }`}
                >
                  {vehicle.serviceStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AuthCardFooter
        promptText={footerPrompt}
        linkLabel={footerLinkLabel}
        linkHref={footerLinkHref}
        onLinkClick={onFooterLinkClick}
      />
    </div>
  );
}

