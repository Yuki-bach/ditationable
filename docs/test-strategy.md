# Dictationable テスト戦略

## 概要

本ドキュメントは、Dictationableアプリケーションのテスト戦略と実装方針を定義します。品質保証と継続的な開発を支援するため、単体テスト、結合テスト、E2Eテストの3層構造でテストを実装します。

## テストフレームワークの選定

### 推奨フレームワーク

- **単体テスト・結合テスト**: Vitest
  - 理由:
    - Next.js 14とTypeScriptとの優れた互換性
    - Jest互換APIで学習コストが低い
    - 高速な実行速度とHMR対応
    - ESMネイティブサポート
    - 優れたTypeScript型推論

- **E2Eテスト**: Playwright
  - 理由:
    - Next.jsチーム推奨
    - クロスブラウザテスト対応
    - 優れたデバッグツール
    - TypeScriptファーストAPI
    - ヘッドレス実行と視覚的デバッグの両対応

## テストピラミッド

```
        E2E Tests (10%)
       /          \
      /            \
     Integration Tests (30%)
    /                \
   /                  \
  Unit Tests (60%)
```

## 1. 単体テスト (Unit Tests)

### 対象

- **コンポーネント**
  - `FileUpload.tsx`: ファイルアップロードロジック、バリデーション
  - `ApiKeyInput.tsx`: APIキー入力・検証ロジック
  - `TranscriptionResult.tsx`: 結果表示ロジック
  - `LanguageToggle.tsx`: 言語切り替えロジック

- **ユーティリティ関数**
  - `i18n.ts`: 翻訳関数
  - `apiService.ts`: API通信ロジック
  - `fileUtils.ts`: ファイル処理ユーティリティ

- **カスタムフック**
  - `useLanguage`: 言語管理フック
  - その他のカスタムフック

### テスト方針

```typescript
// コンポーネントテストの例
describe('FileUpload', () => {
  it('should accept valid audio formats', () => {
    // テスト実装
  })
  
  it('should reject invalid file formats', () => {
    // テスト実装
  })
  
  it('should enforce file size limits', () => {
    // テスト実装
  })
})
```

### モック戦略

- 外部依存関係（API呼び出し、ファイルシステム）はモック化
- React Testing Libraryでユーザー視点のテスト
- MSWでAPIレスポンスのモック

## 2. 結合テスト (Integration Tests)

### 対象

- **API Routes**
  - `/api/transcribe`: 文字起こしエンドポイント
  - `/api/validate-key`: APIキー検証エンドポイント

- **Context統合**
  - LanguageContext: 言語切り替えフロー
  - 状態管理の統合

- **コンポーネント間連携**
  - ファイルアップロード → API呼び出し → 結果表示

### テスト方針

```typescript
// APIルートテストの例
describe('/api/transcribe', () => {
  it('should process audio file successfully', async () => {
    // テスト実装
  })
  
  it('should handle large files with Files API', async () => {
    // テスト実装
  })
  
  it('should return appropriate error for invalid input', async () => {
    // テスト実装
  })
})
```

## 3. E2Eテスト (End-to-End Tests)

### 対象シナリオ

1. **基本的な文字起こしフロー**
   - APIキー入力
   - ファイルアップロード
   - 文字起こし実行
   - 結果ダウンロード

2. **言語切り替えフロー**
   - 日本語⇔英語切り替え
   - UI要素の翻訳確認

3. **エラーハンドリング**
   - 無効なAPIキー
   - サポート外ファイル形式
   - ネットワークエラー

### テスト方針

```typescript
// E2Eテストの例
test('complete transcription workflow', async ({ page }) => {
  // 1. ページ訪問
  await page.goto('http://localhost:3000')
  
  // 2. APIキー入力
  await page.fill('[data-testid="api-key-input"]', process.env.TEST_API_KEY)
  
  // 3. ファイルアップロード
  await page.setInputFiles('[data-testid="file-upload"]', 'test-audio.mp3')
  
  // 4. 文字起こし実行
  await page.click('[data-testid="transcribe-button"]')
  
  // 5. 結果確認
  await expect(page.locator('[data-testid="transcription-result"]')).toBeVisible()
})
```

## テスト環境

### 環境変数

```env
# .env.test
TEST_GEMINI_API_KEY=test-key-123
TEST_API_URL=http://localhost:3000
```

### Docker統合

```yaml
# docker-compose.test.yml
services:
  test:
    build:
      context: .
      dockerfile: Dockerfile.test
    environment:
      - NODE_ENV=test
    volumes:
      - ./coverage:/app/coverage
```

## CI/CD統合

### GitHub Actions設定

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Unit Tests
        run: npm run test:unit
      - name: Run Integration Tests
        run: npm run test:integration
      - name: Run E2E Tests
        run: npm run test:e2e
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
```

## カバレッジ目標

- 全体: 80%以上
- 単体テスト: 90%以上
- 結合テスト: 70%以上
- E2Eテスト: 主要フローの100%カバー

## テストデータ管理

### フィクスチャ

```
tests/
├── fixtures/
│   ├── audio/
│   │   ├── valid-audio.mp3
│   │   ├── large-audio.mp3
│   │   └── invalid-format.txt
│   └── responses/
│       ├── transcription-success.json
│       └── transcription-error.json
```

### テストユーティリティ

```typescript
// tests/utils/test-helpers.ts
export const createMockAudioFile = (size: number, type: string): File => {
  // モックファイル生成ロジック
}

export const mockGeminiResponse = (response: any) => {
  // APIレスポンスモック
}
```

## 実装スケジュール

1. **フェーズ1: 環境構築** (1-2日)
   - Vitest設定
   - Testing Library設定
   - MSW設定

2. **フェーズ2: 単体テスト** (3-4日)
   - コンポーネントテスト
   - ユーティリティテスト
   - フックテスト

3. **フェーズ3: 結合テスト** (2-3日)
   - APIルートテスト
   - Context統合テスト

4. **フェーズ4: E2Eテスト** (2-3日)
   - Playwright設定
   - 主要シナリオテスト

5. **フェーズ5: CI/CD統合** (1日)
   - GitHub Actions設定
   - カバレッジレポート設定

## ベストプラクティス

1. **AAA原則**
   - Arrange: テストデータ準備
   - Act: テスト対象実行
   - Assert: 結果検証

2. **テストの独立性**
   - 各テストは独立して実行可能
   - テスト間の依存関係を排除

3. **可読性重視**
   - 説明的なテスト名
   - 明確なアサーション

4. **パフォーマンス**
   - 並列実行可能な設計
   - 適切なモック使用

## 今後の拡張

- ビジュアルリグレッションテスト (Storybook + Chromatic)
- パフォーマンステスト
- アクセシビリティテスト (axe-core)
- セキュリティテスト

## 参考資料

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)