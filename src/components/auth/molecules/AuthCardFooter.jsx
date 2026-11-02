import Link from "next/link";

/**
 * [Atomic Design: MOLECULE — Auth]
 * AuthCardFooter — Migrasi dari `.card-footer`
 * pada `GarasiiU/index.html` & `GarasiiU/style.css`.
 */
export default function AuthCardFooter({
  promptText = "Didnt had an account?",
  linkLabel = "Create New",
  linkHref = "/signup",
  onLinkClick,
}) {
  return (
    <div className="mt-6 border-t border-line-subtle pt-4 text-center">
      <p className="font-body text-xs text-ink-secondary">
        {promptText}{" "}
        {onLinkClick ? (
          <button
            type="button"
            onClick={onLinkClick}
            className="cursor-pointer border-0 bg-transparent font-semibold text-action hover:underline"
          >
            {linkLabel}
          </button>
        ) : (
          <Link
            href={linkHref}
            className="font-semibold text-action no-underline hover:underline"
          >
            {linkLabel}
          </Link>
        )}
      </p>
    </div>
  );
}
