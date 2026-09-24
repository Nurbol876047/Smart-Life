import {
  ShoppingCart,
  Car,
  Home,
  HeartPulse,
  GraduationCap,
  Clapperboard,
  Wallet,
  MoreHorizontal,
} from 'lucide-react';

const ICONS = {
  ShoppingCart,
  Car,
  Home,
  HeartPulse,
  GraduationCap,
  Clapperboard,
  Wallet,
  MoreHorizontal,
};

export default function CategoryIcon({ name, size = 16, ...rest }) {
  const Cmp = ICONS[name] || MoreHorizontal;
  return <Cmp size={size} {...rest} />;
}
