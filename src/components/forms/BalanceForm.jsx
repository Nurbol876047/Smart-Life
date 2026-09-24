import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function BalanceForm({ currentAmount, onClose }) {
  const { setDisplayedBalance } = useApp();
  const [amount, setAmount] = useState(String(Math.round(currentAmount)));

  function handleSubmit(e) {
    e.preventDefault();
    if (amount === '' || Number.isNaN(Number(amount))) return;
    setDisplayedBalance(Number(amount));
    onClose();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="balance-amount">Ағымдағы баланс (₸)</label>
        <input
          id="balance-amount"
          type="number"
          inputMode="numeric"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
          required
        />
      </div>
      <p className="hint" style={{ marginBottom: 16 }}>
        Осы жерде өз нақты балансыңызды енгізіңіз — келесі кіріс/шығыстар
        осы сомадан бастап қосылады/шегеріледі.
      </p>
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
