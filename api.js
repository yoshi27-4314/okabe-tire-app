// ============================================================
// api.js — API接続
// ============================================================

var API_URL = 'https://adlrohlfjtmxfxtptfgi.supabase.co/functions/v1/api';

function getSessionId() { return localStorage.getItem('sessionId') || ''; }
function getStaffId() { return localStorage.getItem('staffId') || ''; }
function getStaffName() { return localStorage.getItem('staffName') || ''; }

async function callAPI(action, params) {
  try {
    var body = Object.assign({ action: action, sessionId: getSessionId() }, params || {});
    var res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (e) {
    return { ok: false, code: 'NETWORK_ERROR', message: 'ネットワークエラーです。接続を確認してください。' };
  }
}

function requireLogin() {
  if (!getSessionId()) {
    location.href = 'index.html';
    return false;
  }
  return true;
}

function generateIdempotencyKey() {
  return 'IK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 8);
}
