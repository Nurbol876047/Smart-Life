import { useEffect, useState } from 'react';

// Бэкенд қосылғанда бұл хук нақты сұраныстың pending күйіне ауысады
// (мысалы, react-query-дің isLoading мәні). Қазір API жоқ болғандықтан,
// кестелер мен графиктердің скелетонын көрсету үшін жасанды кідіріс жасайды.
export default function useDelayedLoading(ms = 550) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
