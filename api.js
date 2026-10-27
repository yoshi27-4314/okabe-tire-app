// ============================================================
// api.js — API接続
// ============================================================

var API_URL = 'https://adlrohlfjtmxfxtptfgi.supabase.co/functions/v1/api';

function getSessionId() { return localStorage.getItem('sessionId') || ''; }
function getStaffId() { return localStorage.getItem('staffId') || ''; }
function getStaffName() { return localStorage.getItem('staffName') || ''; }

var _apiCallCount = 0;
function _showSpinner() {
  var el = document.getElementById('globalSpinner');
  if (!el) {
    el = document.createElement('div');
    el.id = 'globalSpinner';
    el.innerHTML = '<div class="sp-circle"></div><div class="sp-text">読み込み中...</div>';
    document.body.appendChild(el);
  }
  _apiCallCount++;
  el.classList.add('show');
}
function _hideSpinner() {
  _apiCallCount--;
  if (_apiCallCount <= 0) {
    _apiCallCount = 0;
    var el = document.getElementById('globalSpinner');
    if (el) el.classList.remove('show');
  }
}

async function callAPI(action, params) {
  _showSpinner();
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
  } finally {
    _hideSpinner();
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
