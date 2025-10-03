// デフォルト設定
const DEFAULT_SETTINGS = {
  targetWords: ['顧客一', 'ログインID'],
  highlightColor: 'green',
  useBold: true,
  requiredUrls: ['searchCustomer','#/login'],
  urlMatchType: 'OR'
};

// 設定を読み込んで表示
chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
  document.getElementById('targetWords').value = settings.targetWords.join('\n');
  document.getElementById('highlightColor').value = settings.highlightColor;
  document.getElementById('useBold').checked = settings.useBold;
  document.getElementById('requiredUrls').value = settings.requiredUrls.join('\n');
  document.querySelector(`input[name="urlMatch"][value="${settings.urlMatchType}"]`).checked = true;
});

// 保存ボタン
document.getElementById('save').addEventListener('click', () => {
  const settings = {
    targetWords: document.getElementById('targetWords').value
      .split('\n')
      .map(word => word.trim())
      .filter(word => word.length > 0),
    highlightColor: document.getElementById('highlightColor').value || 'red',
    useBold: document.getElementById('useBold').checked,
    requiredUrls: document.getElementById('requiredUrls').value
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0),
    urlMatchType: document.querySelector('input[name="urlMatch"]:checked').value
  };

  chrome.storage.sync.set(settings, () => {
    // 成功メッセージを表示
    const successMsg = document.getElementById('successMsg');
    successMsg.style.display = 'block';
    setTimeout(() => {
      successMsg.style.display = 'none';
    }, 2000);

    // 全てのタブに設定変更を通知
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: 'settingsUpdated' }, () => {
          // エラーは無視（content scriptが動いていないタブもあるため）
          if (chrome.runtime.lastError) {
            // ignore
          }
        });
      });
    });
  });
});

