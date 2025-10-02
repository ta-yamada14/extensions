# BS helper

BSからの要望によって生まれたChrome拡張機能

## インストール方法

1. Chromeで `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」をONにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このフォルダ（extensionsフォルダ）を選択

## 設定の変更方法

`content.js` の上部にある設定エリアを編集するだけでOK！

```javascript
// ハイライトする文字列のリスト
const TARGET_WORDS = [
  '個人顧客',
  '2'
];

// 文字の色
const HIGHLIGHT_COLOR = 'red';

// 太文字にするか（true: 太文字, false: 通常）
const USE_BOLD = true;

// URLに含まれている必要がある文字列
const REQUIRED_URL = 'gmo-office.com/?#/searchCustome';
```

### 変更後の適用方法

1. ファイルを保存
2. `chrome://extensions/` で🔄ボタンをクリック
3. ページをリフレッシュ

<img width="459" height="279" alt="スクリーンショット 2025-10-02 13 15 18" src="https://github.com/user-attachments/assets/7a2c79b9-bf3b-4f9f-bafc-278973962170" />
