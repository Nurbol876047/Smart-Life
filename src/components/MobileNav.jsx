import * as Icons from 'lucide-react';
import { MOBILE_MAIN_ROUTES, ROUTES, SETTINGS_ROUTE } from '../data/routes';

const MORE_ID = '__more';

export default function MobileNav({ active, onNavigate, onOpenMore }) {
  const mainRoutes = ROUTES.filter((r) => MOBILE_MAIN_ROUTES.includes(r.id));
  const isMoreActive = !MOBILE_MAIN_ROUTES.includes(active);

  return (
    <nav className="mobile-nav">
      {mainRoutes.map((r) => {
        const Icon = Icons[r.icon];
        return (
          <button
            key={r.id}
            className={`mobile-nav__link${active === r.id ? ' active' : ''}`}
            onClick={() => onNavigate(r.id)}
          >
            <Icon size={20} />
            {r.label}
          </button>
        );
      })}
      <button
        className={`mobile-nav__link${isMoreActive ? ' active' : ''}`}
        onClick={onOpenMore}
      >
        <Icons.Menu size={20} />
        Тағы
      </button>
    </nav>
  );
}

export { MORE_ID };
export const MORE_ROUTES = ROUTES.filter((r) => !MOBILE_MAIN_ROUTES.includes(r.id)).concat(
  SETTINGS_ROUTE
);
