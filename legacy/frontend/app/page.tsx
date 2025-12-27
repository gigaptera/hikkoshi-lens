"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import {
  MapPinLine,
  MagnifyingGlass,
  ChartBar,
  Sparkle,
  ArrowRight,
  CheckCircle,
  RocketLaunch,
  House,
  Train,
  Heart,
  ShieldCheck,
} from "@phosphor-icons/react";
import { useLocationStore } from "@/features/map/stores/location-store";
import { usePreferenceStore } from "@/features/lines/stores/preference-store";

export default function LandingPage() {
  const workLocation = useLocationStore((s) => s.workLocation);
  const { filters } = usePreferenceStore();

  const progress = [
    {
      label: "勤務地を入力",
      done: !!workLocation,
      href: "/search",
      icon: MapPinLine,
    },
    {
      label: "条件を設定",
      done: !!filters.buildingType && !!filters.layout,
      href: "/search",
      icon: House,
    },
    {
      label: "候補を見る",
      done: false,
      href: "/stations",
      icon: MagnifyingGlass,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <Badge variant="info" className="px-4 py-2 text-sm">
              <Sparkle size={16} weight="fill" />
              新卒向け引越し支援ツール
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-center text-neutral-900 mb-4 leading-[1.1]">
            通勤しやすく、
            <br />
            暮らしやすいエリアを
            <br />
            <span className="text-primary">データで発見。</span>
          </h1>

          <p className="text-base md:text-lg text-neutral-600 text-center max-w-2xl mx-auto mb-8 leading-relaxed">
            勤務地からのアクセス、家賃相場、周辺施設、安全性を総合的にスコア化。
            <br className="hidden md:block" />
            あなたに最適な住まい探しを、3ステップでサポートします。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link href="/search">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base font-bold px-8 py-6 shadow-lg hover:shadow-xl"
              >
                <RocketLaunch className="mr-2" weight="fill" size={20} />
                今すぐ無料で始める
              </Button>
            </Link>
            <Link href="#how">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base font-bold px-8 py-6"
              >
                使い方を見る
                <ArrowRight className="ml-2" weight="bold" size={18} />
              </Button>
            </Link>
          </div>

          {/* Progress Card (if user started) */}
          {workLocation && (
            <div className="max-w-2xl mx-auto">
              <Panel variant="glass" className="border-primary-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle weight="fill" className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-neutral-500">
                      進捗状況
                    </div>
                    <div className="text-lg font-black text-neutral-900">
                      続きから始める
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {progress.map((step) => {
                    const Icon = step.icon;
                    return (
                      <Link
                        key={step.label}
                        href={step.href}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary bg-white hover:bg-primary-50/50 transition-colors"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            step.done
                              ? "bg-primary text-white"
                              : "bg-neutral-100 text-neutral-400"
                          }`}
                        >
                          <Icon weight={step.done ? "fill" : "light"} />
                        </div>
                        <div className="flex-1">
                          <div
                            className={`text-sm font-bold ${
                              step.done
                                ? "text-neutral-900"
                                : "text-neutral-500"
                            }`}
                          >
                            {step.label}
                          </div>
                        </div>
                        {step.done && (
                          <CheckCircle className="text-primary" weight="fill" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </Panel>
            </div>
          )}
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="py-20 bg-white border-y border-border px-4 md:px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              FEATURES
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900">
              3つの特徴
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Panel variant="solid" className="border-t-4 border-t-primary">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <MapPinLine size={28} weight="bold" className="text-primary" />
              </div>
              <h3 className="text-xl font-black text-neutral-900 mb-3">
                通勤アクセス最適化
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                勤務地からの距離、乗換回数、所要時間を考慮。
                家賃補助の適用範囲も自動判定します。
              </p>
            </Panel>

            <Panel variant="solid" className="border-t-4 border-t-primary">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <ChartBar size={28} weight="bold" className="text-primary" />
              </div>
              <h3 className="text-xl font-black text-neutral-900 mb-3">
                多角的スコアリング
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                家賃、周辺施設、安全性、災害リスクなど
                複数の指標を総合評価してランキング化します。
              </p>
            </Panel>

            <Panel variant="solid" className="border-t-4 border-t-primary">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Sparkle size={28} weight="fill" className="text-primary" />
              </div>
              <h3 className="text-xl font-black text-neutral-900 mb-3">
                リアルタイム相場表示
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                最新の家賃相場データを駅ごとに表示。
                建物種別・間取り別の詳細な価格帯も確認できます。
              </p>
            </Panel>
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section id="how" className="py-20 bg-neutral-50 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              HOW TO USE
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900">
              使い方は簡単3ステップ
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: "1",
                title: "勤務地を入力",
                desc: "会社やオフィスの住所を入力してください",
                icon: MapPinLine,
              },
              {
                num: "2",
                title: "条件を設定",
                desc: "予算、間取り、重視する条件を選択",
                icon: House,
              },
              {
                num: "3",
                title: "最適エリアを発見",
                desc: "スコア順にランキング表示されます",
                icon: Train,
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="text-center">
                  <div className="w-16 h-16 bg-primary text-white font-black text-2xl flex items-center justify-center mx-auto mb-4 rounded-2xl shadow-lg">
                    {step.num}
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} weight="bold" className="text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-neutral-600">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-20 bg-gradient-to-br from-primary to-teal-700 text-white px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart size={32} weight="fill" className="text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
            今すぐ最適なエリアを見つけましょう
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            データに基づいた、あなたにぴったりの住まい探しを始めましょう
          </p>
          <Link href="/search">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-neutral-50 font-bold text-base px-8 py-6 shadow-xl"
            >
              <MagnifyingGlass className="mr-2" weight="bold" size={20} />
              無料で検索を始める
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
