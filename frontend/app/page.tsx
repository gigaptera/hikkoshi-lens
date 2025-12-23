"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MapPinLine,
  MagnifyingGlass,
  ChartBar,
  Sparkle,
  ArrowRight,
} from "@phosphor-icons/react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tighter text-neutral-900">
              HIKKOSHI LENS
            </h1>
            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
          </div>
          <Link href="/search">
            <Button className="rounded-none font-bold uppercase tracking-wider">
              今すぐ検索
              <ArrowRight className="ml-2" weight="bold" size={16} />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-neutral-100 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full mb-6">
              <Sparkle size={16} weight="fill" className="text-teal-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                データドリブン住居選び
              </span>
            </div>

            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-neutral-900 mb-6">
              通勤しやすく、
              <br />
              暮らしやすい
              <br />
              エリアを発見。
            </h2>

            <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
              勤務地からのアクセス、家賃相場、周辺施設、安全性を
              <br className="hidden md:block" />
              総合的にスコア化。あなたに最適な住まい探しをサポートします。
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/search">
                <Button
                  size="lg"
                  className="rounded-none font-bold uppercase tracking-wider w-full sm:w-auto"
                >
                  <MagnifyingGlass className="mr-2" weight="bold" size={20} />
                  エリアを検索する
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-none font-bold uppercase tracking-wider w-full sm:w-auto"
                >
                  機能を見る
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 bg-white border-b border-neutral-200"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
              FEATURES
            </h3>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-neutral-900">
              3つの特徴
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-neutral-50 border border-neutral-200 p-8">
              <div className="w-12 h-12 bg-teal-500 flex items-center justify-center mb-6">
                <MapPinLine size={24} weight="bold" className="text-white" />
              </div>
              <h4 className="text-xl font-black text-neutral-900 mb-3">
                通勤アクセス最適化
              </h4>
              <p className="text-neutral-600 leading-relaxed">
                勤務地からの距離、乗換回数、所要時間を考慮。
                家賃補助の適用範囲も自動判定します。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-neutral-50 border border-neutral-200 p-8">
              <div className="w-12 h-12 bg-teal-500 flex items-center justify-center mb-6">
                <ChartBar size={24} weight="bold" className="text-white" />
              </div>
              <h4 className="text-xl font-black text-neutral-900 mb-3">
                多角的スコアリング
              </h4>
              <p className="text-neutral-600 leading-relaxed">
                家賃、周辺施設、安全性、災害リスクなど
                複数の指標を総合評価してランキング化します。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-neutral-50 border border-neutral-200 p-8">
              <div className="w-12 h-12 bg-teal-500 flex items-center justify-center mb-6">
                <Sparkle size={24} weight="fill" className="text-white" />
              </div>
              <h4 className="text-xl font-black text-neutral-900 mb-3">
                リアルタイム相場表示
              </h4>
              <p className="text-neutral-600 leading-relaxed">
                最新の家賃相場データを駅ごとに表示。
                建物種別・間取り別の詳細な価格帯も確認できます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-24 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
              HOW TO USE
            </h3>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-neutral-900">
              使い方は簡単3ステップ
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-500 text-white font-black text-3xl flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h4 className="text-lg font-bold text-neutral-900 mb-2">
                勤務地を入力
              </h4>
              <p className="text-neutral-600">
                会社やオフィスの住所を入力してください
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-500 text-white font-black text-3xl flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h4 className="text-lg font-bold text-neutral-900 mb-2">
                条件を設定
              </h4>
              <p className="text-neutral-600">
                予算、間取り、重視する条件を選択
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-500 text-white font-black text-3xl flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h4 className="text-lg font-bold text-neutral-900 mb-2">
                最適エリアを発見
              </h4>
              <p className="text-neutral-600">
                スコア順にランキング表示されます
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-neutral-900 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">
            今すぐ最適なエリアを
            <br />
            見つけましょう
          </h2>
          <p className="text-neutral-300 mb-8 text-lg">
            データに基づいた、あなたにぴったりの住まい探しを始めましょう
          </p>
          <Link href="/search">
            <Button
              size="lg"
              className="rounded-none font-bold uppercase tracking-wider bg-teal-500 hover:bg-teal-600 text-white"
            >
              <MagnifyingGlass className="mr-2" weight="bold" size={20} />
              無料で検索を始める
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 text-neutral-400 py-8 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-mono">
            © 2025 HIKKOSHI LENS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
