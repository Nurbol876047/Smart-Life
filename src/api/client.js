// Python (FastAPI) бэкендіне арналған жеңіл fetch-орағыш.
// Бэкенд backend/ ішінде, әдепкі бойынша localhost:8000-де көтеріледі
// (uvicorn app.main:app --reload --port 8000).

const API_BASE_URL = 'http://localhost:8000';

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || 'Сервермен байланыс қатесі');
    this.status = status;
    this.body = body; // {"error": "...", "message": "..."} пішінінде келеді
  }
}

export async function apiPost(path, payload) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // желі/сервер қолжетімсіз — backend/README-дегідей іске қосылмаған болуы мүмкін
    throw new ApiError(0, {
      error: 'network_error',
      message: 'Серверге қосылу мүмкін болмады. Backend қосулы ма, тексеріңіз.',
    });
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    // денесі жоқ/JSON емес жауап
  }

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }
  return body;
}

// Файл (мыс. чек суреті) жүктеу — multipart/form-data, JSON.stringify қажет емес.
export async function apiPostFile(path, file) {
  const formData = new FormData();
  formData.append('file', file);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', body: formData });
  } catch {
    throw new ApiError(0, {
      error: 'network_error',
      message: 'Серверге қосылу мүмкін болмады. Backend қосулы ма, тексеріңіз.',
    });
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    // денесі жоқ/JSON емес жауап
  }

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }
  return body;
}
