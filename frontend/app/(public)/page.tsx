export default function Home() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="text-center py-12 sm:py-20 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
          AI/MLエンジニア専門マッチング
        </h1>
        <div className="flex justify-center gap-4 sm:gap-6 mt-8">
          <a
            href="/engineer"
            className="px-6 sm:px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition text-center"
          >
            エンジニア登録
          </a>
          <a
            href="/diagnosis"
            className="px-6 sm:px-8 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition text-center"
          >
            無料で市場価値診断
          </a>
        </div>
      </section>

      {/* サービスの流れ */}
      <section className="bg-gray-50 py-14 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">サービスの流れ</h2>
          <p className="text-gray-500 mb-10 sm:mb-14">3ステップで最適な企業とマッチング</p>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-bold mb-2">プロフィール登録</h3>
              <p className="text-sm text-gray-600 mb-3">
                技術スタック・実装経験・希望条件を登録。GitHub連携で自動的にスキルを分析します。
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li className="flex items-center gap-1.5">
                  <span className="text-green-500">&#10003;</span> 所要時間：約5分
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-green-500">&#10003;</span> 完全無料
                </li>
              </ul>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-bold mb-2">AI分析＆マッチング</h3>
              <p className="text-sm text-gray-600 mb-3">
                あなたのスキルと企業の技術要件をAIが多次元分析。適合度の高い企業から優先的にスカウトが届きます。
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li className="flex items-center gap-1.5">
                  <span className="text-green-500">&#10003;</span> 技術スタック適合度
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-green-500">&#10003;</span> 年収・開発環境の相性
                </li>
              </ul>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-bold mb-2">企業と面談・選考</h3>
              <p className="text-sm text-gray-600 mb-3">
                興味のある企業とカジュアル面談を実施。技術的な質問や開発環境について直接確認できます。
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li className="flex items-center gap-1.5">
                  <span className="text-green-500">&#10003;</span> オンライン面談可能
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-green-500">&#10003;</span> 選考サポート付き
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 実績バナー */}
      <section className="bg-indigo-600 py-10 sm:py-14 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center text-white">
          <div>
            <div className="text-3xl sm:text-4xl font-bold">1,200+</div>
            <div className="text-sm sm:text-base mt-1 text-indigo-100">登録エンジニア数</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold">300+</div>
            <div className="text-sm sm:text-base mt-1 text-indigo-100">提携企業数</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold">92%</div>
            <div className="text-sm sm:text-base mt-1 text-indigo-100">マッチング満足度</div>
          </div>
        </div>
      </section>

      {/* マッチングする企業 */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">マッチングする企業</h2>
          <p className="text-gray-500 mb-10">幅広い業界・規模の企業が登録中</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-6 rounded-xl border text-center">
              <div className="text-3xl mb-3">&#9889;</div>
              <h4 className="font-bold mb-1">AI/LLMスタートアップ</h4>
              <p className="text-xs text-gray-500">最新技術を使った開発、急成長中の環境</p>
            </div>
            <div className="bg-white p-6 rounded-xl border text-center">
              <div className="text-3xl mb-3">&#127970;</div>
              <h4 className="font-bold mb-1">大手テック企業</h4>
              <p className="text-xs text-gray-500">安定した環境、充実した待遇</p>
            </div>
            <div className="bg-white p-6 rounded-xl border text-center">
              <div className="text-3xl mb-3">&#128300;</div>
              <h4 className="font-bold mb-1">研究開発型企業</h4>
              <p className="text-xs text-gray-500">論文化・特許取得を目指す環境</p>
            </div>
            <div className="bg-white p-6 rounded-xl border text-center">
              <div className="text-3xl mb-3">&#10024;</div>
              <h4 className="font-bold mb-1">事業会社のAI部門</h4>
              <p className="text-xs text-gray-500">ビジネスインパクトの大きい開発</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Matchingを選ぶ理由 */}
      <section className="bg-gray-50 py-14 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-10">AI Matchingを選ぶ理由</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border text-left">
              <h4 className="font-bold mb-2">AI特化のスコアリング</h4>
              <p className="text-sm text-gray-600">
                汎用マッチングでは測れないAI/ML固有のスキルセットを100点満点で多角的に評価。ノイズのない精度の高いマッチングを実現します。
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border text-left">
              <h4 className="font-bold mb-2">エンジニア完全無料</h4>
              <p className="text-sm text-gray-600">
                登録・診断・マッチングまですべて無料。費用は採用企業側のみが負担するため、エンジニアは安心して利用できます。
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border text-left">
              <h4 className="font-bold mb-2">市場価値の可視化</h4>
              <p className="text-sm text-gray-600">
                無料診断であなたのAIスキルの市場価値をスコアリング。推定年収レンジや業界内ポジションを即座に把握できます。
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border text-left">
              <h4 className="font-bold mb-2">カジュアル面談から</h4>
              <p className="text-sm text-gray-600">
                まずはカジュアル面談で双方の相性を確認。技術的な深い話ができる場を提供し、ミスマッチを防ぎます。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
