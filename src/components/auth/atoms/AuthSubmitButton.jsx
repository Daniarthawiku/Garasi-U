import Icon from "@/components/shared/atoms/Icon";

/**
 * [Atomic Design: ATOM — Auth]
 * AuthSubmitButton — Migrasi dari `.btn-primary`
 * pada `GarasiiU/index.html` & `GarasiiU/style.css`.
 */
export default function AuthSubmitButton({
  label = "Get In",
  icon = "login",
  type = "submit",
  onClick,
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 border-0 bg-action p-3 font-heading text-base font-bold text-canvas shadow-glow-action transition-all duration-200 hover:bg-action-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {icon && <Icon name={icon} size={20} />}
      <span>{label}</span>
    </button>
  );
}

