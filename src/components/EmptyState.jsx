import { Inbox } from 'lucide-react';

export default function EmptyState({ text = 'Әзірге операция жоқ', actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <Inbox size={28} strokeWidth={1.5} />
      <p>{text}</p>
      {actionLabel && (
        <button className="btn btn--primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
