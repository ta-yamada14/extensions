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

// 太文字にするか（true: 太文字, false: 通常）
const USE_BOLD = true;

// URLに含まれている必要がある文字列（この文字列がURLにない場合は動作しない）
const REQUIRED_URL = 'gmo-office.com/?#/searchCustome';

/****************************************************
 * ここから下は変更不要
 ****************************************************/

(function() {
  // URLチェック
  if (!window.location.href.includes(REQUIRED_URL)) {
    return;
  }

  let isProcessing = false;

  function highlightText() {
    if (isProcessing) {
      return;
    }
    
    isProcessing = true;
    
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

      // 収集したノードを処理
      nodesToProcess.forEach(textNode => {
        const parent = textNode.parentElement;
        if (!parent || parent.hasAttribute('data-highlighted')) return;

        let text = textNode.textContent;
        
        // 各対象文字列をハイライト
        const fontWeight = USE_BOLD ? 'bold' : 'normal';
        TARGET_WORDS.forEach(word => {
          const regex = new RegExp(word, 'g');
          text = text.replace(regex, `<span style="color: ${HIGHLIGHT_COLOR}; font-weight: ${fontWeight};" data-highlighted="true">${word}</span>`);
        });

        if (text !== textNode.textContent) {
          const wrapper = document.createElement('span');
          wrapper.setAttribute('data-highlighted', 'true');
          wrapper.innerHTML = text;
          parent.replaceChild(wrapper, textNode);
        }
      });

    } catch (e) {
      // エラーは無視
    } finally {
      isProcessing = false;
    }
  }

  // 初回実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(highlightText, 100);
    });
  } else {
    setTimeout(highlightText, 100);
  }

  // React Adminの遅延レンダリング対応
  setTimeout(highlightText, 500);
  setTimeout(highlightText, 1000);
  setTimeout(highlightText, 2000);

  // MutationObserver（デバウンス付き）
  let observerTimeout;
  const observer = new MutationObserver(() => {
    clearTimeout(observerTimeout);
    observerTimeout = setTimeout(() => {
      if (!isProcessing) {
        highlightText();
      }
    }, 500);
  });

  // 監視開始
  setTimeout(() => {
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }, 500);
})();
