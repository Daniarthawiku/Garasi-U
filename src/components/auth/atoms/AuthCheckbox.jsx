/**
 * [Atomic Design: ATOM — Auth]
 * AuthCheckbox — Migrasi dari `.remember-row`, `.checkbox-container`,
 * `input[type="checkbox"]`, dan `.checkbox-text` pada `GarasiiU/index.html` & `GarasiiU/style.css`.
 */
export default function AuthCheckbox({
  id = "rememberDevice",
  name = "rememberDevice",
  label = "Remember Me",
  checked = false,
  onChange,
  rightSlot,
}) {
  return (
    <div className="mt-1 flex items-center justify-between">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center gap-2 select-none"
      >
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer relative h-4 w-4 cursor-pointer appearance-none border border-line-subtle bg-canvas transition-colors checked:border-action checked:bg-action after:pointer-events-none after:absolute after:top-1/2 after:left-1/2 after:hidden after:-translate-x-1/2 after:-translate-y-1/2 after:text-xs after:text-canvas after:content-['✓'] checked:after:block"
        />
        <span className="font-body text-xs font-normal tracking-normal text-ink-secondary normal-case">
          {label}
        </span>
      </label>
      {rightSlot}
    </div>
  );
}

