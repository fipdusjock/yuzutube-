## 認証(AUTH_*)

| コード | 原因 |
|---|---|
| `AUTH_INVALID_CREDENTIALS` | メールアドレスまたはパスワードが間違っている |
| `AUTH_EMAIL_ALREADY_REGISTERED` | 登録しようとしたメールアドレスが既に使われている |
| `AUTH_SESSION_INVALID` | ログインセッションが無効、または期限切れ |
| `AUTH_LOGIN_REQUIRED` | ログインが必要な操作を、ログインせずに行おうとした |
| `AUTH_SIGNUP_BLOCKED` | 利用制限中のアカウント/接続元からの新規登録を拒否した |
| `AUTH_INVALID_ADMIN_PASSWORD` | 管理者パスワードが間違っている |

## 入力値の検証(VALIDATION_*)

| コード | 原因 |
|---|---|
| `VALIDATION_INVALID_EMAIL` | メールアドレスの形式が正しくない |
| `VALIDATION_PASSWORD_TOO_SHORT` | パスワードが8文字未満 |
| `VALIDATION_TERMS_NOT_AGREED` | 利用規約に同意していない状態で登録しようとした |
| `VALIDATION_TOKEN_REQUIRED` | 必要なトークンが指定されていない |
| `VALIDATION_DISPLAY_NAME_REQUIRED` | 表示名が空欄 |
| `VALIDATION_DISPLAY_NAME_TOO_LONG` | 表示名が長すぎる |
| `VALIDATION_DISPLAY_NAME_INVALID_CHARS` | 表示名に使えない記号(`< > " ' &`)が含まれている |
| `VALIDATION_USER_ID_REQUIRED` | ユーザーIDが空欄 |
| `VALIDATION_USER_ID_INVALID_FORMAT` | ユーザーIDの形式が不正(英数字・アンダースコア以外、または文字数不足) |
| `VALIDATION_AVATAR_INVALID_FORMAT` | アイコン画像の形式が対応していないもの |
| `VALIDATION_AVATAR_CORRUPTED` | アイコン画像のデータが壊れている |
| `VALIDATION_AVATAR_TOO_LARGE` | アイコン画像の容量が大きすぎる |
| `VALIDATION_AVATAR_UNREADABLE` | アイコン画像を正しく読み込めなかった |
| `VALIDATION_AVATAR_NOT_SQUARE` | アイコン画像が正方形ではない |
| `VALIDATION_FIELD_NOT_STRING` | お問い合わせ等の入力欄に、文字列以外の値が送られてきた |
| `VALIDATION_FIELD_REQUIRED` | お問い合わせ等の必須入力欄が空欄 |
| `VALIDATION_FIELD_TOO_LONG` | お問い合わせ等の入力欄が文字数制限を超えている |
| `VALIDATION_PLAYLIST_NAME_NOT_STRING` | プレイリスト名が文字列以外 |
| `VALIDATION_PLAYLIST_NAME_REQUIRED` | プレイリスト名が空欄 |
| `VALIDATION_PLAYLIST_NAME_TOO_LONG` | プレイリスト名が長すぎる |
| `VALIDATION_WORD_REQUIRED` | 登録しようとしたNGワードが空欄 |
| `VALIDATION_WORD_TOO_SHORT` | NGワードが1文字しかない(誤検知が多すぎるため拒否) |
| `VALIDATION_WORD_TOO_LONG` | NGワードが長すぎる |
| `VALIDATION_POLICY_TOO_LONG` | AI判定基準の文章が長すぎる |
| `VALIDATION_VIDEO_ID_REQUIRED` | 動画IDが指定されていない |
| `VALIDATION_QUERY_REQUIRED` | 検索キーワードが指定されていない |
| `VALIDATION_CHANNEL_ID_REQUIRED` | チャンネルIDが指定されていない |
| `VALIDATION_IP_REQUIRED` | BAN操作の際にIPアドレスが指定されていない |
| `VALIDATION_EMAIL_REQUIRED` | BAN操作の際にメールアドレスが指定されていない |
| `VALIDATION_INVALID_URL` | 一括インポート時に指定したURLの形式が不正 |

## モデレーション・利用制限

| コード | 原因 |
|---|---|
| `MODERATION_BANNED` | NGワード、またはAI判定によって利用制限がかかっている |
| `PERMISSION_OWNER_ONLY` | オーナー(サイト運営者)専用の機能に、それ以外の人がアクセスしようとした |
| `RATE_LIMIT_COOLDOWN` | お問い合わせを短時間に連続で送信しようとした |
| `RATE_LIMIT_DAILY_EXCEEDED` | お問い合わせの1日あたりの送信上限に達した |
| `LIMIT_PLAYLIST_COUNT_EXCEEDED` | 作成できるプレイリストの上限数に達した |
| `LIMIT_PLAYLIST_VIDEOS_EXCEEDED` | 1つのプレイリストに入れられる動画数の上限に達した |
| `CONFLICT_USER_ID_TAKEN` | 設定しようとしたユーザーIDが既に他の人に使われている |

## 見つからない(NOT_FOUND_*)

| コード | 原因 |
|---|---|
| `NOT_FOUND_USER` | 指定されたユーザーが見つからない |
| `NOT_FOUND_INQUIRY` | 指定されたお問い合わせが見つからない |
| `NOT_FOUND_PLAYLIST` | 指定されたプレイリストが見つからない(他人のものである場合も含む) |
| `NOT_FOUND_BANNED_WORD` | 削除しようとしたNGワードが登録されていない |
| `NOT_FOUND_CACHE` | 指定した動画の情報がまだキャッシュに無い |
| `NOT_FOUND_SUBTITLE` | 指定した言語の字幕が見つからない |
| `NOT_FOUND_SUBTITLE_URL` | 字幕データの取得先URLが見つからない |
| `NOT_FOUND_LIVE_CHAT` | ライブチャットが存在しない動画(配信ではない、または再現不可) |
| `NOT_FOUND_LIVE_CHAT_URL` | ライブチャットの取得先URLが見つからない |
| `NOT_FOUND_DIRECT_URL` | 指定した画質の直接ダウンロードURLが見つからない |

## 外部サイトからのデータ取得に失敗(UPSTREAM_*)

すべて「YouTube側の応答が正常に得られなかった」ことが原因です。

| コード | 具体的な状況 |
|---|---|
| `UPSTREAM_FETCH_FAILED` | 汎用的な取得失敗(急上昇動画・NGワードの一括インポート元URL等) |
| `UPSTREAM_PARSE_FAILED` | 取得はできたが、中身のデータ構造を解析できなかった |
| `UPSTREAM_PAGE_FETCH_FAILED` | 動画ページ自体の取得に失敗 |
| `UPSTREAM_WATCH_PAGE_FETCH_FAILED` | 関連動画取得のための視聴ページの取得に失敗 |
| `UPSTREAM_SUBTITLE_FETCH_FAILED` | 字幕データの取得に失敗 |
| `UPSTREAM_LIVE_CHAT_FETCH_FAILED` | ライブチャットデータの取得に失敗 |
| `UPSTREAM_CONTINUATION_FETCH_FAILED` | コメント等の「続きを読み込む」取得に失敗 |
| `UPSTREAM_CONTINUATION_PARSE_FAILED` | 「続きを読み込む」データの解析に失敗 |
| `UPSTREAM_MEDIA_FETCH_FAILED` | 動画・音声本体データの中継取得に失敗 |

## 動画抽出処理(EXTRACTION_*)

| コード | 原因 |
|---|---|
| `EXTRACTION_FAILED` | 動画情報の抽出処理そのものが失敗した(非公開・削除済み・年齢制限等) |
| `EXTRACTION_NO_PLAYABLE_DATA` | 抽出はできたが、再生に使えるデータ(映像・音声・配信URL)が1つも無かった |

## その他

| コード | 原因 |
|---|---|
| `NETWORK_UNSTABLE` | 通信が一時的に不安定で、自動での再試行後も繋がらなかった |
| `SERVER_BUSY` | 動画情報の抽出処理が同時に3件走っていて、一定時間待っても空かなかった |
| `UNKNOWN_ERROR` | 分類漏れ(本来出ないはずのもの、もし見かけたら教えてください) |
