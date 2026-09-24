import { useState } from 'react';
import { CATEGORIES } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { categorize, rememberCategory } from '../../api/ai';

function toInputDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function TransactionForm({ type, editing, onClose }) {
  const { addTransaction, updateTransaction } = useApp();
  const options = CATEGORIES.filter((c) => c.kind === type || c.kind === 'both');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  // Жаңа операцияда санат бастапқыда бос — сипаттама енгізілгенде ИИ ұсынады
  // (services/categorization.py), пайдаланушы кез келген уақытта өзгерте алады.
  const [category, setCategory] = useState(editing?.category ?? '');
  const [categorySource, setCategorySource] = useState(null); // 'ai' | null
  const [categorizing, setCategorizing] = useState(false);
  const [date, setDate] = useState(toInputDate(editing?.date ?? new Date(2026, 8, 24)));
  const [description, setDescription] = useState(editing?.description ?? '');

  async function handleDescriptionBlur() {
    const trimmed = description.trim();
    if (!trimmed || category) return; // санат бұрыннан таңдалған болса, ИИ-ге жүгінбейміз
    setCategorizing(true);
    try {
      const result = await categorize(trimmed, type);
      if (result?.category) {
        setCategory(result.category);
        setCategorySource('ai');
      }
    } catch {
      // Автокатегоризация — көмекші әрекет, сәтсіз болса пайдаланушы өзі таңдайды
    } finally {
      setCategorizing(false);
    }
  }

  function handleCategoryChange(value) {
    setCategory(value);
    setCategorySource(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    const finalCategory = category || 'other';
    const finalDescription = description.trim() || (type === 'income' ? 'Кіріс' : 'Шығыс');
    const payload = {
      type,
      category: finalCategory,
      amount: Number(amount),
      date: new Date(`${date}T00:00:00`),
      description: finalDescription,
    };
    if (editing) {
      updateTransaction(editing.id, payload);
    } else {
      addTransaction(payload);
    }
    // Пайдаланушы растаған/түзеткен санатты есте сақтаймыз — келесі жолы
    // сол сипаттама үшін ИИ-ге жүгінбей-ақ осы санат қолданылады.
    if (description.trim()) {
      rememberCategory(finalDescription, finalCategory);
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="tx-amount">Сомасы (₸)</label>
        <input
          id="tx-amount"
          type="number"
          min="1"
          inputMode="numeric"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
          required
        />
      </div>
      <div className="field">
        <label htmlFor="tx-desc">Сипаттама</label>
        <input
          id="tx-desc"
          type="text"
          placeholder="Мысалы: Magnum, Яндекс Go..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionBlur}
        />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="tx-category">
            Санаты
            {categorizing && <span className="hint"> · анықтауда...</span>}
            {!categorizing && categorySource === 'ai' && <span className="hint"> · ИИ ұсынды</span>}
          </label>
          <select
            id="tx-category"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="" disabled>
              Санатты таңдаңыз
            </option>
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="tx-date">Күні</label>
          <input
            id="tx-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="modal__actions">
        <button type="button" className="btn btn--secondary" onClick={onClose}>
          Бас тарту
        </button>
        <button type="submit" className="btn btn--primary">
          Сақтау
        </button>
      </div>
    </form>
  );
}
