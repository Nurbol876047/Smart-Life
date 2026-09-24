import { useRef, useState } from 'react';
import { Sparkles, Receipt } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { parseTransaction, parseReceipt, rememberCategory } from '../api/ai';
import { ApiError } from '../api/client';
import { TODAY } from '../utils/format';
import TransactionPreviewCard from './TransactionPreviewCard';

let uidCounter = 0;
function nextUid() {
  uidCounter += 1;
  return `preview-${uidCounter}`;
}

const MAX_RECEIPT_SIZE_BYTES = 10 * 1024 * 1024;

function todayIso() {
  const yyyy = TODAY.getFullYear();
  const mm = String(TODAY.getMonth() + 1).padStart(2, '0');
  const dd = String(TODAY.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Чек нәтижесін TransactionPreviewCard күтетін пішінге түрлендіреді.
// needs_review болса, confidence-ті 0.7-ден төмен етіп көрсетеміз — карточка
// "Тексеріңіз" белгісін дәл сол тексеру шартымен автоматты көрсетеді.
function receiptToPreview(receipt) {
  const noteParts = [];
  if (receipt.store) noteParts.push(receipt.store);
  if (receipt.items?.length) noteParts.push(`${receipt.items.length} позиция`);
  const rawConfidence = receipt.confidence ?? 0.5;
  return {
    _uid: nextUid(),
    type: 'expense',
    amount: receipt.total || 0,
    category: receipt.category,
    date: receipt.date || todayIso(),
    note: noteParts.join(' · ') || 'Чек',
    confidence: receipt.needs_review ? Math.min(rawConfidence, 0.69) : rawConfidence,
  };
}

export default function PhraseTransactionInput() {
  const { addTransaction } = useApp();
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [error, setError] = useState(null);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const busy = analyzing || uploadingReceipt;

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setAnalyzing(true);
    setError(null);
    try {
      const result = await parseTransaction(trimmed);
      const withIds = (result?.transactions ?? []).map((t) => ({ ...t, _uid: nextUid() }));
      setPreviews((prev) => [...withIds, ...prev]);
      setText('');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.body?.message || err.message);
      } else {
        setError('Күтпеген қате пайда болды. Қайталап көріңіз.');
      }
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleReceiptChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // сол файлды қайта таңдай алу үшін
    if (!file || busy) return;

    if (file.size > MAX_RECEIPT_SIZE_BYTES) {
      setError('Файл тым үлкен. Ең көбі 10 МБ дейінгі суретті жүктеңіз.');
      return;
    }

    setUploadingReceipt(true);
    setError(null);
    try {
      const result = await parseReceipt(file);
      setPreviews((prev) => [receiptToPreview(result), ...prev]);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.body?.message || err.message);
      } else {
        setError('Күтпеген қате пайда болды. Қайталап көріңіз.');
      }
    } finally {
      setUploadingReceipt(false);
    }
  }

  function handleSaveCard(uid, edited) {
    addTransaction(edited);
    rememberCategory(edited.description, edited.category);
    setPreviews((prev) => prev.filter((p) => p._uid !== uid));
  }

  function handleDiscardCard(uid) {
    setPreviews((prev) => prev.filter((p) => p._uid !== uid));
  }

  return (
    <div className="panel phrase-panel">
      <form className="phrase-input-row" onSubmit={handleSubmit}>
        <Sparkles size={18} className="phrase-input-row__icon" />
        <input
          type="text"
          placeholder="Не жұмсадыңыз? Мысалы: такси 1500"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleReceiptChange}
        />
        <button
          type="button"
          className={`btn btn--secondary${uploadingReceipt ? ' btn--loading' : ''}`}
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
        >
          <Receipt size={16} />
          Чек жүктеу
        </button>
        <button type="submit" className={`btn btn--primary${analyzing ? ' btn--loading' : ''}`} disabled={busy}>
          Талдау
        </button>
      </form>

      {error && <p className="phrase-error">{error}</p>}

      {previews.map((p) => (
        <TransactionPreviewCard
          key={p._uid}
          transaction={p}
          onSave={(edited) => handleSaveCard(p._uid, edited)}
          onDiscard={() => handleDiscardCard(p._uid)}
        />
      ))}
    </div>
  );
}
