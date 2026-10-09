// ============================================================
// common.js — UI共通の関数
// ============================================================

// トグルボタンの選択（ラジオボタンの代わり）
function toggleCheck(el) {
  if (el.classList.contains('checked')) {
    el.classList.remove('checked');
  } else {
    var siblings = el.parentNode.querySelectorAll('.toggle-btn');
    for (var i = 0; i < siblings.length; i++) siblings[i].classList.remove('checked');
    el.classList.add('checked');
  }
}

// トグルグループの選択値を取得する
function getToggleValue(groupId) {
  var group = document.getElementById(groupId);
  if (!group) return '';
  var checked = group.querySelector('.toggle-btn.checked');
  return checked ? (checked.dataset.value || checked.textContent.trim()) : '';
}

// 戻るボタン
function goBack() {
  if (history.length > 1) {
    history.back();
  } else {
    location.href = 'index.html';
  }
}

// ホーム画面に戻る
function goHome() {
  location.href = 'index.html';
}

// 画面遷移（パラメータつき）
function navigateTo(page, params) {
  var url = page;
  if (params) {
    var query = Object.keys(params).map(function(key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
    url += '?' + query;
  }
  location.href = url;
}

// 日時を表示用にフォーマットする
function formatDateTime(dateValue) {
  if (!dateValue) return '';
  var d = new Date(dateValue);
  if (isNaN(d.getTime())) return String(dateValue);
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  var h = String(d.getHours()).padStart(2, '0');
  var min = String(d.getMinutes()).padStart(2, '0');
  return y + '/' + m + '/' + day + ' ' + h + ':' + min;
}

// 日付を表示用にフォーマットする
function formatDate(dateValue) {
  if (!dateValue) return '';
  var d = new Date(dateValue);
  if (isNaN(d.getTime())) return String(dateValue);
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return y + '/' + m + '/' + day;
}

// 状態に対応するCSSクラスを返す
function getStatusClass(status) {
  var map = {
    '下書き': 'st-draft',
    '予約': 'st-checked',
    '受付済': 'st-checked',
    '作業中': 'st-working',
    '完了': 'st-done',
    '保管中': 'st-done',
    '出庫済み': 'st-delivered',
    '取消': 'st-cancelled',
    '有効': 'st-done',
    '終了': 'st-delivered',
    '申請中': 'st-working',
    '確定済み': 'st-done',
    '確定': 'st-done',
    '申請': 'st-working',
    '格納待ち': 'st-working',
    '中断': 'st-cancelled'
  };
  return map[status] || 'st-draft';
}

// HTMLエスケープ（XSS防止）
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ヘッダーにスタッフ名を表示する
function showStaffName() {
  var el = document.getElementById('staff-name');
  if (el) el.textContent = getStaffName() || '';
}

// 確認ダイアログ
function confirmAction(message) {
  return confirm(message);
}
