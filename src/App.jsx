import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { ROUTES, SETTINGS_ROUTE } from './data/routes';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import MoreSheet from './components/MoreSheet';
import FabMenu from './components/FabMenu';
import Modal from './components/Modal';
import ToastStack from './components/ToastStack';
import TransactionForm from './components/forms/TransactionForm';
import TaskForm from './components/forms/TaskForm';
import ReminderForm from './components/forms/ReminderForm';
import GoalForm from './components/forms/GoalForm';
import BalanceForm from './components/forms/BalanceForm';

import Dashboard from './screens/Dashboard';
import Transactions from './screens/Transactions';
import Statistics from './screens/Statistics';
import SavingsGoals from './screens/SavingsGoals';
import DayPlan from './screens/DayPlan';
import Reminders from './screens/Reminders';
import Insights from './screens/Insights';
import AIAssistant from './screens/AIAssistant';
import Settings from './screens/Settings';

const ALL_ROUTES = [...ROUTES, SETTINGS_ROUTE];

const MODAL_TITLES = {
  income: (editing) => (editing ? 'Кірісті өңдеу' : 'Кіріс қосу'),
  expense: (editing) => (editing ? 'Шығысты өңдеу' : 'Шығыс қосу'),
  task: () => 'Тапсырма қосу',
  reminder: (editing) => (editing ? 'Еске салғышты өңдеу' : 'Еске салғыш қосу'),
  goal: () => 'Жаңа мақсат қосу',
  balance: () => 'Балансты өзгерту',
};

function AppShell() {
  const [active, setActive] = useState('dashboard');
  const [modal, setModal] = useState(null); // { type, editing }
  const [moreOpen, setMoreOpen] = useState(false);

  function openModal(type, editing = null) {
    setModal({ type, editing });
  }
  function closeModal() {
    setModal(null);
  }
  function navigate(id) {
    setActive(id);
    setMoreOpen(false);
  }

  const routeMeta = ALL_ROUTES.find((r) => r.id === active);

  function renderScreen() {
    switch (active) {
      case 'dashboard':
        return <Dashboard onOpenModal={openModal} onNavigate={navigate} />;
      case 'transactions':
        return (
          <Transactions
            onOpenModal={openModal}
            onOpenEdit={(tx) => openModal(tx.type, tx)}
          />
        );
      case 'statistics':
        return <Statistics />;
      case 'goals':
        return <SavingsGoals onOpenModal={openModal} />;
      case 'dayplan':
        return <DayPlan onOpenModal={openModal} />;
      case 'reminders':
        return <Reminders onOpenModal={openModal} />;
      case 'insights':
        return <Insights onNavigate={navigate} />;
      case 'assistant':
        return <AIAssistant />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  }

  return (
    <div className="app-shell">
      <Sidebar active={active} onNavigate={navigate} />

      <div className="main">
        <div className="topbar">
          <h1 className="topbar__title">{routeMeta?.label}</h1>
          <div className="topbar__actions">
            <button className="btn btn--secondary" onClick={() => openModal('income')}>
              + Кіріс
            </button>
            <button className="btn btn--primary" onClick={() => openModal('expense')}>
              + Шығыс
            </button>
          </div>
        </div>

        {renderScreen()}
      </div>

      <MobileNav active={active} onNavigate={navigate} onOpenMore={() => setMoreOpen(true)} />
      {moreOpen && <MoreSheet onNavigate={navigate} onClose={() => setMoreOpen(false)} />}
      <FabMenu onAction={(type) => openModal(type)} />

      {modal && (
        <Modal title={MODAL_TITLES[modal.type](modal.editing)} onClose={closeModal}>
          {(modal.type === 'income' || modal.type === 'expense') && (
            <TransactionForm type={modal.type} editing={modal.editing} onClose={closeModal} />
          )}
          {modal.type === 'task' && <TaskForm onClose={closeModal} />}
          {modal.type === 'reminder' && <ReminderForm editing={modal.editing} onClose={closeModal} />}
          {modal.type === 'goal' && <GoalForm onClose={closeModal} />}
          {modal.type === 'balance' && (
            <BalanceForm currentAmount={modal.editing} onClose={closeModal} />
          )}
        </Modal>
      )}

      <ToastStack />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
