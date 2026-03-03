import Icon from "./Icon";

export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="mx-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
      <Icon name="error" className="text-red-400 text-xl mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-bold text-red-400">Something went wrong</p>
        <p className="text-xs text-neutral-soft mt-1">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 text-xs font-bold text-primary hover:underline"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
