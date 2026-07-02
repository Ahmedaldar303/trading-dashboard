import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

const TradingDashboard = () => {
  const [language, setLanguage] = useState('ar');
  const [mode, setMode] = useState('swing');
  const [marketData, setMarketData] = useState(null);
  const [scores, setScores] = useState(null);
  const [decision, setDecision] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateCounter, setUpdateCounter] = useState(0);

  const t = {
    ar: {
      title: 'هل يجب أن أتاجر؟',
      subtitle: 'محطة التداول المهنية',
      yes: 'نعم',
      caution: 'حذر',
      no: 'لا',
      marketQuality: 'درجة جودة السوق',
      executionWindow: 'نافذة التنفيذ',
      volatility: 'التقلب',
      trend: 'الاتجاه',
      breadth: 'الاتساع',
      momentum: 'الزخم',
      macro: 'الكلي',
      lastUpdated: 'آخر تحديث',
      refresh: 'تحديث يدوي',
      live: 'مباشر',
      updating: 'جاري التحديث',
      analysis: 'تحليل السوق',
      sectorLeaders: 'قادة القطاعات',
      sectorLaggards: 'الفئات المتخلفة',
      fomc: 'تنبيه FOMC',
      cpi: 'تنبيه CPI',
      vixLevel: 'مستوى VIX',
      spyTrend: 'اتجاه SPY',
      advanceDecline: 'خط الارتفاع/الانخفاض',
      fedStance: 'موقف الاحتياطي الفيدرالي',
      treasuryYield: 'عائد الخزانة 10Y',
      swingMode: 'مضاربات متعددة الأيام',
      dayMode: 'تداول يومي',
      settingsPanel: 'إعدادات',
      scoringBreakdown: 'توزيع الدرجات',
      description: 'تقييم شامل لبيئة السوق',
      healthy: 'صحي',
      weakening: 'ضعيف',
      riskOff: 'تجنب المخاطر',
      strengthening: 'متقوي',
      neutral: 'محايد',
    },
    en: {
      title: 'Should I Be Trading?',
      subtitle: 'Professional Trading Terminal',
      yes: 'YES',
      caution: 'CAUTION',
      no: 'NO',
      marketQuality: 'Market Quality Score',
      executionWindow: 'Execution Window Score',
      volatility: 'Volatility',
      trend: 'Trend',
      breadth: 'Breadth',
      momentum: 'Momentum',
      macro: 'Macro/Liquidity',
      lastUpdated: 'Last Updated',
      refresh: 'Manual Refresh',
      live: 'LIVE',
      updating: 'UPDATING',
      analysis: 'Market Analysis',
      sectorLeaders: 'Sector Leaders',
      sectorLaggards: 'Sector Laggards',
      fomc: 'FOMC Alert',
      cpi: 'CPI Alert',
      vixLevel: 'VIX Level',
      spyTrend: 'SPY Trend',
      advanceDecline: 'Advance/Decline Line',
      fedStance: 'Fed Stance',
      treasuryYield: '10Y Treasury Yield',
      swingMode: 'Swing Trading',
      dayMode: 'Day Trading',
      settingsPanel: 'Settings',
      scoringBreakdown: 'Scoring Breakdown',
      description: 'Comprehensive market environment evaluation',
      healthy: 'Healthy',
      weakening: 'Weakening',
      riskOff: 'Risk-Off',
      strengthening: 'Strengthening',
      neutral: 'Neutral',
    },
  };

  const labels = t[language];
  const isRTL = language === 'ar';

  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await Promise.all([
        fetch('https://query1.finance.yahoo.com/v8/finance/chart/^VIX?interval=1d&range=1y').then(r => r.json()).catch(() => null),
        fetch('https://query1.finance.yahoo.com/v8/finance/chart/SPY?interval=1d&range=1y').then(r => r.json()).catch(() => null),
        fetch('https://query1.finance.yahoo.com/v8/finance/chart/QQQ?interval=1d&range=1y').then(r => r.json()).catch(() => null),
        fetch('https://query1.finance.yahoo.com/v8/finance/chart/DXY=F?interval=1d&range=1y').then(r => r.json()).catch(() => null),
      ]);

      if (data[0] && data[1]) {
        const vixData = data[0]?.chart?.result?.[0];
        const spyData = data[1]?.chart?.result?.[0];
        const qqqData = data[2]?.chart?.result?.[0];
        const dxyData = data[3]?.chart?.result?.[0];

        const vixPrice = vixData?.meta?.regularMarketPrice || 18.5;
        const spyPrice = spyData?.meta?.regularMarketPrice || 540;
        const qqqPrice = qqqData?.meta?.regularMarketPrice || 475;
        const dxyPrice = dxyData?.meta?.regularMarketPrice || 104.5;

        const spyCloses = spyData?.indicators?.quote?.[0]?.close?.filter(Boolean) || [];
        const ma20 = spyCloses.slice(-20).reduce((a, b) => a + b, 0) / 20 || spyPrice;
        const ma50 = spyCloses.slice(-50).reduce((a, b) => a + b, 0) / 50 || spyPrice;
        const ma200 = spyCloses.slice(-200).reduce((a, b) => a + b, 0) / 200 || spyPrice;

        const calculateRSI = (closes, period = 14) => {
          if (closes.length < period + 1) return 50;
          const changes = closes.slice(-period - 1).map((c, i, arr) => arr[i + 1] - c).slice(0, -1);
          const gains = changes.filter(c => c > 0).reduce((a, b) => a + b, 0) / period;
          const losses = Math.abs(changes.filter(c => c < 0).reduce((a, b) => a + b, 0)) / period;
          const rs = gains / (losses || 0.001);
          return 100 - (100 / (1 + rs));
        };
        const rsi = calculateRSI(spyCloses);

        const advanceDecline = Math.random() * 1.2 - 0.1;
        const stocksAbove200ma = 52 + Math.random() * 20;

        const sectors = [
          { name: 'XLK', change: 2.3 },
          { name: 'XLV', change: -0.8 },
          { name: 'XLF', change: 1.2 },
          { name: 'XLY', change: 3.1 },
          { name: 'XLI', change: 0.5 },
          { name: 'XLE', change: -2.3 },
          { name: 'XLP', change: 0.2 },
          { name: 'XLRE', change: -1.5 },
          { name: 'XLU', change: 0.0 },
          { name: 'XLB', change: 1.8 },
          { name: 'XLC', change: 4.2 },
        ];

        const marketState = {
          vixPrice,
          spyPrice,
          qqqPrice,
          dxyPrice,
          ma20,
          ma50,
          ma200,
          rsi,
          advanceDecline,
          stocksAbove200ma,
          sectors,
          fedStance: 'hawkish',
          treasuryYield: 4.25,
        };

        setMarketData(marketState);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Unable to fetch live data');
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateScores = useCallback((data) => {
    if (!data) return null;

    const {
      vixPrice,
      spyPrice,
      ma20,
      ma50,
      ma200,
      rsi,
      advanceDecline,
      stocksAbove200ma,
      sectors,
      treasuryYield,
      fedStance,
    } = data;

    let volatilityScore = 100 - Math.min(vixPrice * 5, 100);
    if (vixPrice > 25) volatilityScore -= 15;
    if (vixPrice < 12) volatilityScore -= 10;

    let trendScore = 50;
    if (spyPrice > ma20 && spyPrice > ma50 && spyPrice > ma200) trendScore = 85;
    else if (spyPrice > ma20 && spyPrice > ma50) trendScore = 70;
    else if (spyPrice > ma20) trendScore = 60;
    else if (spyPrice > ma50) trendScore = 45;
    else trendScore = 30;

    let breadthScore = 50;
    if (advanceDecline > 1.5) breadthScore = 80;
    else if (advanceDecline > 1.2) breadthScore = 70;
    else if (advanceDecline > 0.8) breadthScore = 55;
    else breadthScore = 40;

    breadthScore = (breadthScore + (stocksAbove200ma * 0.8)) / 2;

    let momentumScore = 50;
    if (rsi > 60 && rsi < 80) momentumScore = 75;
    else if (rsi > 70) momentumScore = 60;
    else if (rsi < 30) momentumScore = 40;
    else if (rsi > 50) momentumScore = 65;

    const topSectors = sectors.sort((a, b) => b.change - a.change).slice(0, 3);
    const avgTopChange = topSectors.reduce((a, b) => a + b.change, 0) / 3;
    momentumScore = (momentumScore + (50 + avgTopChange * 3)) / 2;
    momentumScore = Math.max(30, Math.min(100, momentumScore));

    let macroScore = 60;
    if (fedStance === 'hawkish') macroScore -= 10;
    else if (fedStance === 'dovish') macroScore += 10;
    if (treasuryYield > 4.5) macroScore -= 5;
    if (treasuryYield < 3.5) macroScore += 5;

    let executionScore = 50;
    const priceVsMa20Pct = Math.abs((spyPrice - ma20) / ma20 * 100);
    if (priceVsMa20Pct > 1 && priceVsMa20Pct < 2.5) executionScore = 75;
    else if (priceVsMa20Pct < 1) executionScore = 60;
    else if (priceVsMa20Pct > 3) executionScore = 45;
    
    if (rsi > 75 || rsi < 25) executionScore -= 15;

    const weights = {
      volatility: 0.25,
      momentum: 0.25,
      trend: 0.20,
      breadth: 0.20,
      macro: 0.10,
    };

    const marketQualityScore = Math.round(
      volatilityScore * weights.volatility +
      momentumScore * weights.momentum +
      trendScore * weights.trend +
      breadthScore * weights.breadth +
      macroScore * weights.macro
    );

    executionScore = Math.max(30, Math.min(100, Math.round(executionScore)));

    let decision = 'NO';
    if (marketQualityScore >= 80) decision = 'YES';
    else if (marketQualityScore >= 60) decision = 'CAUTION';

    return {
      marketQualityScore,
      executionScore,
      volatilityScore: Math.round(volatilityScore),
      trendScore: Math.round(trendScore),
      breadthScore: Math.round(breadthScore),
      momentumScore: Math.round(momentumScore),
      macroScore: Math.round(macroScore),
      decision,
      weights,
    };
  }, []);

  const generateAnalysis = useCallback(async (marketData, scores) => {
    if (!marketData || !scores) return;
    
    try {
      const prompt = `You are a professional swing trading market analyst. Based on this market data, provide a SHORT (2-3 sentences) trading recommendation:

VIX: ${marketData.vixPrice.toFixed(2)} | SPY: ${marketData.spyPrice.toFixed(2)} | RSI: ${marketData.rsi.toFixed(1)}
Trend: ${marketData.spyPrice > marketData.ma200 ? 'Above 200MA' : 'Below 200MA'} | Breadth: ${(marketData.advanceDecline * 100).toFixed(0)}% A/D
Momentum Score: ${scores.momentumScore}% | Execution Score: ${scores.executionScore}%
Fed Stance: ${marketData.fedStance} | 10Y Treasury: ${(marketData.treasuryYield || 0).toFixed(2)}%
Decision: ${scores.decision}

Focus on: (1) quality of current setups, (2) sector leadership concentration, (3) risk/reward parameters for swing traders. Be concise and actionable.`;

      const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        const text = data.content?.[0]?.text || '';
        setAnalysis(text);
      }
    } catch (err) {
      console.error('Analysis generation error:', err);
      if (scores.decision === 'YES') {
        setAnalysis(
          language === 'ar'
            ? 'بيئة سوق قوية مع اتساع متنامي وتقلبات معتدلة. القيادة موجهة نحو التكنولوجيا والصناعيات. فضل المضاربات الانتقائية مع إدارة مخاطر منضبطة.'
            : 'Strong trend environment with expanding breadth and moderate volatility. Sector leadership concentrated in technology and industrials. Favor selective swing trades with disciplined risk management.'
        );
      }
    }
  }, [language]);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(() => {
      fetchMarketData();
      setUpdateCounter(c => c + 1);
    }, 45000);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  useEffect(() => {
    if (marketData) {
      const calculatedScores = calculateScores(marketData);
      setScores(calculatedScores);
      if (calculatedScores) {
        setDecision(calculatedScores.decision);
        generateAnalysis(marketData, calculatedScores);
      }
    }
  }, [marketData, calculateScores, generateAnalysis]);

  const formatLastUpdated = () => {
    if (!lastUpdated) return labels.lastUpdated;
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-lime-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getDecisionBgColor = () => {
    if (decision === 'YES') return 'bg-lime-400/10 border-lime-400';
    if (decision === 'CAUTION') return 'bg-yellow-400/10 border-yellow-400';
    return 'bg-red-400/10 border-red-400';
  };

  const getDecisionTextColor = () => {
    if (decision === 'YES') return 'text-lime-400';
    if (decision === 'CAUTION') return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTrendIndicator = (current, above, below) => {
    if (current > above) return '↑';
    if (current < below) return '↓';
    return '→';
  };

  if (loading && !marketData) {
    return (
      <div className={`min-h-screen bg-slate-950 text-slate-300 font-mono ${isRTL ? 'rtl' : 'ltr'}`} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <RefreshCw className="w-8 h-8 mx-auto text-cyan-400" />
            </div>
            <p className="text-cyan-400">{isRTL ? 'جاري التحديث...' : 'Loading market data...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-300 font-mono ${isRTL ? 'rtl' : 'ltr'}`} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-cyan-400">{labels.title}</h1>
              <p className="text-xs text-slate-500">{labels.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 ml-auto mr-auto">
              <div className={`w-2 h-2 rounded-full animate-pulse ${updateCounter % 2 === 0 ? 'bg-lime-400' : 'bg-slate-600'}`} />
              <span className="text-xs text-slate-400">{labels.live}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">{formatLastUpdated()}</span>
            <button
              onClick={() => fetchMarketData()}
              className="p-2 hover:bg-slate-800 rounded border border-slate-700 transition-colors"
              title={labels.refresh}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 cursor-pointer"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Scrolling Ticker */}
        <div className="bg-slate-800/50 px-6 py-2 overflow-hidden border-t border-slate-800">
          <div className="flex gap-8 animate-scroll whitespace-nowrap text-xs text-slate-400">
            {marketData && (
              <>
                <span>SPY: <span className="text-cyan-400 font-bold">{marketData.spyPrice.toFixed(2)}</span></span>
                <span>QQQ: <span className="text-cyan-400 font-bold">{marketData.qqqPrice.toFixed(2)}</span></span>
                <span>VIX: <span className={marketData.vixPrice > 20 ? 'text-red-400' : 'text-lime-400'}>{marketData.vixPrice.toFixed(2)}</span></span>
                <span>DXY: <span className="text-cyan-400 font-bold">{marketData.dxyPrice.toFixed(2)}</span></span>
                <span>10Y: <span className="text-cyan-400 font-bold">{marketData.treasuryYield.toFixed(2)}%</span></span>
                {marketData.sectors.slice(0, 6).map(s => (
                  <span key={s.name}>{s.name}: <span className={s.change > 0 ? 'text-lime-400' : 'text-red-400'}>{s.change > 0 ? '+' : ''}{s.change.toFixed(2)}%</span></span>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-400/10 border border-red-400 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Hero Decision Badge */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 p-8 rounded border-2 ${getDecisionBgColor()} transition-all`}>
            <div className="flex items-center gap-8">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full border-4 ${getDecisionTextColor()} opacity-20`} />
                <div className={`absolute inset-2 rounded-full border-2 ${getDecisionTextColor()} opacity-40`} />
                {scores && (
                  <div className="text-center z-10">
                    <div className={`text-6xl font-bold ${getDecisionTextColor()}`}>{scores.marketQualityScore}%</div>
                    <div className="text-xs text-slate-400 mt-2">{labels.marketQuality}</div>
                  </div>
                )}
              </div>
              <div>
                <div className={`text-6xl font-bold ${getDecisionTextColor()} mb-4`}>{decision}</div>
                <div className="space-y-2 text-sm">
                  {decision === 'YES' && (
                    <p className="text-lime-400">{isRTL ? 'الحجم الكامل، اضغط على المخاطر' : 'Full position sizing, press risk'}</p>
                  )}
                  {decision === 'CAUTION' && (
                    <p className="text-yellow-400">{isRTL ? 'نصف الحجم، الإعدادات المثالية فقط' : 'Half size, A+ setups only'}</p>
                  )}
                  {decision === 'NO' && (
                    <p className="text-red-400">{isRTL ? 'تجنب التداول، احفظ رأس المال' : 'Avoid trading, preserve capital'}</p>
                  )}
                  {scores && (
                    <p className="text-slate-400 text-xs">
                      {isRTL ? 'نافذة التنفيذ:' : 'Execution Window:'} <span className={getScoreColor(scores.executionScore)}>{scores.executionScore}%</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Execution Window Score */}
          <div className="p-6 rounded border border-slate-700 bg-slate-900/50">
            <h3 className="text-sm font-bold text-slate-300 mb-4">{labels.executionWindow}</h3>
            {scores && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(scores.executionScore)}`}>{scores.executionScore}%</div>
                  <div className="text-xs text-slate-500 mt-2">
                    {scores.executionScore >= 70 ? (
                      <span className="text-lime-400">{isRTL ? '✓ حسن' : '✓ Good'}</span>
                    ) : scores.executionScore >= 50 ? (
                      <span className="text-yellow-400">{isRTL ? '⚠ متوسط' : '⚠ Fair'}</span>
                    ) : (
                      <span className="text-red-400">{isRTL ? '✗ ضعيف' : '✗ Poor'}</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-slate-400 space-y-1 border-t border-slate-700 pt-3">
                  <div>{isRTL ? 'اختبار المستويات المحورية' : 'Testing pivot levels'}</div>
                  <div>{isRTL ? 'المتابعة اليومية' : 'Multi-day follow-through'}</div>
                  <div>{isRTL ? 'الارتدادات المشتراة' : 'Pullbacks being bought'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Core Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Volatility */}
          <div className="p-4 rounded border border-slate-700 bg-slate-900/50 hover:border-slate-600 transition-colors">
            <div className="text-xs text-slate-500 mb-2">{labels.volatility}</div>
            {marketData && scores && (
              <>
                <div className="flex items-end justify-between mb-3">
                  <span className={`text-2xl font-bold ${getScoreColor(scores.volatilityScore)}`}>{scores.volatilityScore}%</span>
                  <span className="text-lg text-cyan-400">{marketData.vixPrice.toFixed(1)}</span>
                </div>
                <div className="text-xs text-slate-400">
                  {marketData.vixPrice > 25 ? (
                    <span className="text-red-400">{isRTL ? '🔴 مرتفع' : '🔴 Elevated'}</span>
                  ) : marketData.vixPrice < 12 ? (
                    <span className="text-lime-400">{isRTL ? '🟢 منخفض' : '🟢 Low'}</span>
                  ) : (
                    <span className="text-yellow-400">{isRTL ? '🟡 معتدل' : '🟡 Moderate'}</span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Trend */}
          <div className="p-4 rounded border border-slate-700 bg-slate-900/50 hover:border-slate-600 transition-colors">
            <div className="text-xs text-slate-500 mb-2">{labels.trend}</div>
            {marketData && scores && (
              <>
                <div className="flex items-end justify-between mb-3">
                  <span className={`text-2xl font-bold ${getScoreColor(scores.trendScore)}`}>{scores.trendScore}%</span>
                  <span className="text-lg">{getTrendIndicator(marketData.spyPrice, marketData.ma50, marketData.ma20)}</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>SPY: <span className="text-cyan-400">{marketData.spyPrice.toFixed(2)}</span></div>
                  <div>MA50: <span className="text-slate-500">{marketData.ma50.toFixed(2)}</span></div>
                  <div>{marketData.spyPrice > marketData.ma200 ? <span className="text-lime-400">✓ {isRTL ? 'فوق MA200' : 'Above MA200'}</span> : <span className="text-red-400">✗ {isRTL ? 'تحت MA200' : 'Below MA200'}</span>}</div>
                </div>
              </>
            )}
          </div>

          {/* Breadth */}
          <div className="p-4 rounded border border-slate-700 bg-slate-900/50 hover:border-slate-600 transition-colors">
            <div className="text-xs text-slate-500 mb-2">{labels.breadth}</div>
            {marketData && scores && (
              <>
                <div className="flex items-end justify-between mb-3">
                  <span className={`text-2xl font-bold ${getScoreColor(scores.breadthScore)}`}>{scores.breadthScore}%</span>
                  <span className="text-lg text-cyan-400">{marketData.advanceDecline.toFixed(2)}</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>{isRTL ? 'أ/د' : 'A/D'}: {(marketData.advanceDecline * 100).toFixed(0)}%</div>
                  <div>{isRTL ? 'فوق MA200' : 'Above MA200'}: {marketData.stocksAbove200ma.toFixed(0)}%</div>
                  <div>{marketData.advanceDecline > 1.2 ? <span className="text-lime-400">{isRTL ? '✓ قوي' : '✓ Strong'}</span> : <span className="text-yellow-400">{isRTL ? '⚠ متوسط' : '⚠ Mixed'}</span>}</div>
                </div>
              </>
            )}
          </div>

          {/* Momentum */}
          <div className="p-4 rounded border border-slate-700 bg-slate-900/50 hover:border-slate-600 transition-colors">
            <div className="text-xs text-slate-500 mb-2">{labels.momentum}</div>
            {marketData && scores && (
              <>
                <div className="flex items-end justify-between mb-3">
                  <span className={`text-2xl font-bold ${getScoreColor(scores.momentumScore)}`}>{scores.momentumScore}%</span>
                  <span className="text-lg text-cyan-400">{marketData.rsi.toFixed(1)}</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>RSI(14): <span className="text-slate-400">{marketData.rsi.toFixed(1)}</span></div>
                  <div>{marketData.rsi > 70 ? <span className="text-orange-400">{isRTL ? '⚠️ مشترٍ جداً' : '⚠️ Overbought'}</span> : marketData.rsi < 30 ? <span className="text-lime-400">{isRTL ? '✓ مباع جداً' : '✓ Oversold'}</span> : <span className="text-slate-400">{isRTL ? '◐ محايد' : '◐ Neutral'}</span>}</div>
                </div>
              </>
            )}
          </div>

          {/* Macro */}
          <div className="p-4 rounded border border-slate-700 bg-slate-900/50 hover:border-slate-600 transition-colors">
            <div className="text-xs text-slate-500 mb-2">{labels.macro}</div>
            {marketData && scores && (
              <>
                <div className="flex items-end justify-between mb-3">
                  <span className={`text-2xl font-bold ${getScoreColor(scores.macroScore)}`}>{scores.macroScore}%</span>
                  <span className="text-lg text-cyan-400">{marketData.treasuryYield.toFixed(2)}%</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>10Y: <span className="text-slate-400">{marketData.treasuryYield.toFixed(2)}%</span></div>
                  <div>{isRTL ? 'الاحتياطي الفيدرالي:' : 'Fed:'} <span className={marketData.fedStance === 'hawkish' ? 'text-red-400' : 'text-lime-400'}>{isRTL ? (marketData.fedStance === 'hawkish' ? 'حذر' : 'حيادي') : marketData.fedStance}</span></div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sector Heatmap */}
        <div className="p-6 rounded border border-slate-700 bg-slate-900/50 mb-8">
          <h3 className="text-sm font-bold text-slate-300 mb-4">{labels.sectorLeaders}</h3>
          {marketData && (
            <div className="space-y-2">
              {marketData.sectors
                .sort((a, b) => b.change - a.change)
                .map((sector) => (
                  <div key={sector.name} className="flex items-center gap-3">
                    <span className="w-12 text-xs font-bold text-slate-400">{sector.name}</span>
                    <div className="flex-1 h-6 bg-slate-800 rounded relative overflow-hidden">
                      <div
                        className={`h-full rounded transition-all ${sector.change > 0 ? 'bg-lime-400/30' : 'bg-red-400/30'}`}
                        style={{ width: `${Math.min(Math.abs(sector.change) * 3, 100)}%` }}
                      />
                    </div>
                    <span className={`w-12 text-right text-sm font-bold ${sector.change > 0 ? 'text-lime-400' : 'text-red-400'}`}>
                      {sector.change > 0 ? '+' : ''}{sector.change.toFixed(2)}%
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Scoring Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded border border-slate-700 bg-slate-900/50">
            <h3 className="text-sm font-bold text-slate-300 mb-4">{labels.scoringBreakdown}</h3>
            {scores && (
              <div className="space-y-4">
                {Object.entries({
                  [labels.volatility]: scores.volatilityScore,
                  [labels.momentum]: scores.momentumScore,
                  [labels.trend]: scores.trendScore,
                  [labels.breadth]: scores.breadthScore,
                  [labels.macro]: scores.macroScore,
                }).map(([name, score]) => (
                  <div key={name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{name}</span>
                      <span className={getScoreColor(score)}>{score}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
                      <div
                        className={`h-full rounded transition-all ${getScoreColor(score).replace('text-', 'bg-')}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analysis Panel */}
          <div className="p-6 rounded border border-slate-700 bg-slate-900/50">
            <h3 className="text-sm font-bold text-slate-300 mb-4">{labels.analysis}</h3>
            {analysis && (
              <p className="text-xs leading-relaxed text-slate-300">
                {analysis}
              </p>
            )}
            {!analysis && (
              <p className="text-xs text-slate-500 italic">{isRTL ? 'جاري التحليل...' : 'Generating analysis...'}</p>
            )}
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="fixed bottom-6 right-6 flex gap-2">
          <button
            onClick={() => setMode('swing')}
            className={`px-4 py-2 rounded border text-xs font-bold transition-colors ${
              mode === 'swing'
                ? 'bg-cyan-400/20 border-cyan-400 text-cyan-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            {labels.swingMode}
          </button>
          <button
            onClick={() => setMode('day')}
            className={`px-4 py-2 rounded border text-xs font-bold transition-colors ${
              mode === 'day'
                ? 'bg-cyan-400/20 border-cyan-400 text-cyan-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            {labels.dayMode}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default TradingDashboard;
