export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-16">
        <h1 className="text-4xl font-bold mb-4">
          AI人材 × 企業を
          <span className="text-indigo-600">最適マッチング</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          AIエンジニア特化のスコアリングエンジンが、
          スキル・経験・志向性を多角的に分析し、最適な出会いを創出します。
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/engineer"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            エンジニア登録
          </a>
          <a
            href="/diagnosis"
            className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50"
          >
            無料で市場価値診断
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-3xl mb-3">🎯</div>
          <h3 className="text-lg font-bold mb-2">AIスコアリング</h3>
          <p className="text-gray-600 text-sm">
            スキル一致率・経験レベル・給与レンジ・専門領域を
            100点満点でスコアリング。ノイズのないマッチングを実現。
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="text-lg font-bold mb-2">無料市場価値診断</h3>
          <p className="text-gray-600 text-sm">
            あなたのAIスキルセットの市場価値を無料で診断。
            GitHub分析と業界データを組み合わせた詳細レポート。
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-3xl mb-3">💬</div>
          <h3 className="text-lg font-bold mb-2">Discord連携</h3>
          <p className="text-gray-600 text-sm">
            マッチング提案・ステータス変更をリアルタイム通知。
            スラッシュコマンドで即座に承認・却下。
          </p>
        </div>
      </section>

      {/* For Companies */}
      <section className="bg-white p-8 rounded-xl shadow-sm border">
        <h2 className="text-2xl font-bold mb-4">企業の方へ</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold mb-2">成功報酬型</h4>
            <p className="text-gray-600 text-sm">
              採用が決まるまで費用は一切かかりません。
              マッチング成約時のみ成功報酬をいただきます。
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-2">月額プラン</h4>
            <p className="text-gray-600 text-sm">
              月額固定で候補者データベースを閲覧し放題。
              複数ポジションを同時に採用したい企業向け。
            </p>
          </div>
        </div>
        <a
          href="/company"
          className="inline-block mt-6 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
        >
          企業ダッシュボードへ
        </a>
      </section>
    </div>
  );
}
