import * as Icons from 'lucide-react';
import { ROUTES, SETTINGS_ROUTE } from '../data/routes';

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">Smart Life</div>
      <nav className="sidebar__nav">
        {ROUTES.map((r) => {
          const Icon = Icons[r.icon];
          return (
            <button
              key={r.id}
              className={`sidebar__link${active === r.id ? ' active' : ''}`}
              onClick={() => onNavigate(r.id)}
              aria-current={active === r.id ? 'page' : undefined}
            >
              <Icon size={18} />
              {r.label}
            </button>
          );
        })}
      </nav>
      <div className="sidebar__footer">
        <button
          className={`sidebar__link${active === SETTINGS_ROUTE.id ? ' active' : ''}`}
          onClick={() => onNavigate(SETTINGS_ROUTE.id)}
        >
          <Icons.Settings size={18} />
          {SETTINGS_ROUTE.label}
        </button>
      </div>
    </aside>
  );
}
