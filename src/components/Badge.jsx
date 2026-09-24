export default function Badge({ variant = 'neutral', children }) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}

// Акцент түсі тек әрекет/навигацияға арналған, сол себепті басымдылық
// белгілерінде қолданылмайды — тек warning (шұғыл) және neutral.
export function priorityVariant(priority) {
  if (priority === 'Жоғары') return 'warning';
  return 'neutral';
}
