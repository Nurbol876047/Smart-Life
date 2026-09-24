import * as Icons from 'lucide-react';
import { MORE_ROUTES } from './MobileNav';

export default function MoreSheet({ onNavigate, onClose }) {
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Тағы бөлімдер">
        <div className="modal__header">
          <h2 className="modal__title">Бөлімдер</h2>
          <button className="modal__close" onClick={onClose} aria-label="Жабу">
            <Icons.X size={20} />
          </button>
        </div>
        <div className="fab-menu" style={{ position: 'static', border: 'none' }}>
          {MORE_ROUTES.map((r) => {
            const Icon = Icons[r.icon];
            return (
              <button
                key={r.id}
                onClick={() => {
                  onNavigate(r.id);
                  onClose();
                }}
              >
                <Icon size={18} />
                {r.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
