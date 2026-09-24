// TODO: барлық шақыруларда X-User-Id хедерін нақты пайдаланушы id-мен жіберу
// (әзірге бэкенд аутентификациясыз "demo-user" ретінде санайды).
import { apiPost, apiPostFile } from './client';

// TODO: POST /api/ai/parse-transaction
export function parseTransaction(text) {
  return apiPost('/api/ai/parse-transaction', { text });
}

// TODO: POST /api/ai/parse-receipt (multipart) — сурет тек осы сұраныс аясында
// өңделеді, бэкенд оны дискіге сақтамайды (services/ai/receipt_parser.py қараңыз).
export function parseReceipt(file) {
  return apiPostFile('/api/ai/parse-receipt', file);
}

// TODO: POST /api/ai/categorize
export function categorize(description, type = 'expense') {
  return apiPost('/api/ai/categorize', { description, type });
}

// TODO: POST /api/ai/categorize/remember
export function rememberCategory(description, category) {
  return apiPost('/api/ai/categorize/remember', { description, category }).catch(() => {
    // Санатты есте сақтау - көмекші әрекет, сәтсіз болса пайдаланушыға көрсетпейміз
  });
}

// TODO: POST /api/ai/chat — тек қаржы тақырыбымен шектелген (backend/services/ai/chat.py)
export function chatWithAssistant(message, history = []) {
  return apiPost('/api/ai/chat', { message, history });
}
