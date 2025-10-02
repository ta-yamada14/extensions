/****************************************************
 * 設定エリア - ここだけ変更すればOK！
 ****************************************************/

// ハイライトする文字列のリスト
const TARGET_WORDS = [
  '個人顧客',
  '2'
];

// 文字の色
const HIGHLIGHT_COLOR = 'red';

// URLに含まれている必要がある文字列（この文字列がURLにない場合は動作しない）
const REQUIRED_URL = 'gmo-office';

/****************************************************
 * ここから下は変更不要
 ****************************************************/

(function() {
  // URLチェック
  if (!window.location.href.includes(REQUIRED_URL)) {
    return;
  }

  console.log('拡張機能が動作中');

  let isProcessing = false;

  function highlightText() {
    if (isProcessing) {
      console.log('処理中のためスキップ');
      return;
    }
    
    isProcessing = true;
    console.log('テキストをハイライト開始');
    
    try {
      // TreeWalkerで全テキストノードを取得
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            // スクリプトやスタイルは除外
            if (node.parentElement && 
                (node.parentElement.tagName === 'SCRIPT' || 
                 node.parentElement.tagName === 'STYLE' ||
                 node.parentElement.hasAttribute('data-highlighted'))) {
              return NodeFilter.FILTER_REJECT;
            }
            // 対象の文字が含まれているか
            const hasTarget = TARGET_WORDS.some(word => node.textContent.includes(word));
            if (hasTarget) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_REJECT;
          }
        }
      );

      const nodesToProcess = [];
      let node;
      while (node = walker.nextNode()) {
        nodesToProcess.push(node);
      }

      console.log('処理対象ノード数:', nodesToProcess.length);

      // 収集したノードを処理
      nodesToProcess.forEach(textNode => {
        const parent = textNode.parentElement;
        if (!parent || parent.hasAttribute('data-highlighted')) return;

        let text = textNode.textContent;
        
        // 各対象文字列を赤文字に変換
        TARGET_WORDS.forEach(word => {
          const regex = new RegExp(word, 'g');
          text = text.replace(regex, `<span style="color: ${HIGHLIGHT_COLOR}; font-weight: normal;" data-highlighted="true">${word}</span>`);
        });

        if (text !== textNode.textContent) {
          const wrapper = document.createElement('span');
          wrapper.setAttribute('data-highlighted', 'true');
          wrapper.innerHTML = text;
          parent.replaceChild(wrapper, textNode);
        }
      });

      console.log('ハイライト完了');
    } catch (e) {
      console.error('エラー:', e);
    } finally {
      isProcessing = false;
    }
  }

  // 初回実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(highlightText, 500);
    });
  } else {
    setTimeout(highlightText, 500);
  }

  // React Adminの遅延レンダリング対応
  setTimeout(highlightText, 2000);
  setTimeout(highlightText, 4000);

  // MutationObserver（デバウンス付き）
  let observerTimeout;
  const observer = new MutationObserver(() => {
    clearTimeout(observerTimeout);
    observerTimeout = setTimeout(() => {
      if (!isProcessing) {
        highlightText();
      }
    }, 1000);
  });

  // 監視開始
  setTimeout(() => {
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      console.log('MutationObserver開始');
    }
  }, 1000);
})();
