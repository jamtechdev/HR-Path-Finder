import React, { useEffect, useMemo, useState } from 'react';
import type { PayBand, PayBandOperationCriteria } from '../types';

interface Props {
    payBands: PayBand[];
    onPayBandsUpdate: (bands: PayBand[]) => void;
    operationCriteria: PayBandOperationCriteria;
    onOperationCriteriaUpdate: (criteria: PayBandOperationCriteria) => void;
}

type BandRow = { lbl: string; min: number; tgt: number; max: number; manual?: boolean };
type FieldKey = 'min' | 'tgt' | 'max';

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const fmt = (v: number) => Math.round(v).toLocaleString('ko-KR');
const fmtAx = (v: number) => (v >= 10000 ? `${(v / 10000).toFixed(1)}억` : `${(v / 1000).toFixed(0)}천`);
const LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const REC = { min: 4000, tgt: 4720, max: 5200, sMax: 11000, a: 20, b: 85 };

export default function PayBandCreatorPanel({
    payBands,
    onPayBandsUpdate,
    operationCriteria,
    onOperationCriteriaUpdate,
}: Props) {
    const [initialized, setInitialized] = useState(false);
    const [steps, setSteps] = useState(5);
    const [eMin, setEMin] = useState(4000);
    const [eTgt, setETgt] = useState(4720);
    const [eMax, setEMax] = useState(5200);
    const [sMax, setSMax] = useState(11000);
    const [factorA, setFactorA] = useState(20);
    const [factorB, setFactorB] = useState(85);
    const [overrides, setOverrides] = useState<Record<number, Partial<Record<FieldKey, number>>>>({});
    const [editCell, setEditCell] = useState<{ gradeIdx: number; field: FieldKey } | null>(null);
    const [editDraft, setEditDraft] = useState('');
    const [tipA, setTipA] = useState(false);
    const [tipB, setTipB] = useState(false);
    const [lastOK, setLastOK] = useState<{ min: number; tgt: number; max: number; sMax: number }>(REC);

    useEffect(() => {
        if (initialized) return;
        if (payBands.length > 0) {
            const sorted = [...payBands].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            const first = sorted[0];
            const second = sorted[1];
            const last = sorted[sorted.length - 1];
            const a =
                second?.target_salary && first?.target_salary && first.target_salary > 0
                    ? Math.round(((second.target_salary - first.target_salary) / first.target_salary) * 100)
                    : 20;
            const b =
                first?.target_salary && first.target_salary > 0
                    ? Math.round((first.min_salary / first.target_salary) * 100)
                    : 85;
            setSteps(clamp(sorted.length, 3, 7));
            const firstMin = Math.round(first?.min_salary || REC.min);
            const firstMax = Math.round(first?.max_salary || REC.max);
            const firstTgt = Math.round(first?.target_salary || ((firstMin + firstMax) / 2));
            const seniorMax = Math.round(last?.max_salary || REC.sMax);
            setEMin(firstMin);
            setETgt(firstTgt);
            setEMax(firstMax);
            setSMax(seniorMax);
            if (firstMin > 0 && firstTgt > firstMin && firstMax > firstTgt && seniorMax > firstMax) {
                setLastOK({ min: firstMin, tgt: firstTgt, max: firstMax, sMax: seniorMax });
            }
            setFactorA(clamp(Number.isFinite(a) ? a : 20, 5, 50));
            setFactorB(clamp(Number.isFinite(b) ? b : 85, 60, 99));
        }
        setInitialized(true);
    }, [payBands, initialized]);

    const errors = useMemo(() => {
        return {
            min: eMin <= 0 ? '0보다 커야 합니다.' : '',
            tgt: eTgt <= eMin ? 'Target > Min 이어야 합니다.' : '',
            max: eMax <= eTgt ? 'Max > Target 이어야 합니다.' : '',
            sMax: sMax <= eMax ? '최고직급 Max > 최저직급 Max 이어야 합니다.' : '',
        };
    }, [eMin, eTgt, eMax, sMax]);

    const validation = useMemo(
        () => errors.min || errors.tgt || errors.max || errors.sMax || null,
        [errors]
    );

    useEffect(() => {
        if (!validation) {
            setLastOK({ min: eMin, tgt: eTgt, max: eMax, sMax });
        }
    }, [validation, eMin, eTgt, eMax, sMax]);

    const bands = useMemo<BandRow[]>(() => {
        const src = validation
            ? lastOK
            : { min: eMin, tgt: eTgt, max: eMax, sMax };
        const A = factorA / 100;
        const B = factorB / 100;
        const raw: BandRow[] = [{ lbl: 'Grade A', min: src.min, tgt: src.tgt, max: src.max, manual: false }];
        for (let i = 1; i < steps; i++) {
            const t = Math.round(raw[i - 1].tgt * (1 + A));
            raw.push({
                lbl: `Grade ${LABELS[i]}`,
                min: Math.round(t * B),
                tgt: t,
                max: Math.round(t * (1 + A)),
                manual: false,
            });
        }
        const sf = src.sMax / raw[steps - 1].max;
        const scaled = raw.map((r, i) =>
            i === 0
                ? r
                : {
                      ...r,
                      min: Math.round(r.min * sf),
                      tgt: Math.round(r.tgt * sf),
                      max: Math.round(r.max * sf),
                      manual: false,
                  }
        );
        scaled[steps - 1].max = src.sMax;
        return scaled.map((b, i) => {
            const ov = overrides[i] || {};
            const min = ov.min ?? b.min;
            const tgt = ov.tgt ?? b.tgt;
            const max = ov.max ?? b.max;
            return { ...b, min, tgt, max, manual: ov.min !== undefined || ov.tgt !== undefined || ov.max !== undefined };
        });
    }, [steps, eMin, eTgt, eMax, sMax, factorA, factorB, validation, overrides, lastOK]);

    const ovPct = (i: number) => {
        if (i === 0) return null;
        const ov = bands[i - 1].max - bands[i].min;
        const h = bands[i].max - bands[i].min;
        return h > 0 ? Math.round((Math.max(0, ov) / h) * 100) : 0;
    };

    const hasOverlapWarn = useMemo(() => bands.some((_, i) => i > 0 && (ovPct(i) ?? 100) < 15), [bands]);

    const capB = useMemo(() => {
        const A = factorA / 100;
        return Math.min(95, Math.floor(110 / (1 + A)));
    }, [steps, eMin, eTgt, eMax, sMax, factorA, factorB, validation]);

    useEffect(() => {
        if (factorB > capB) setFactorB(capB);
    }, [capB, factorB]);

    const projectedBands = useMemo(
        () =>
            bands.map((b, idx) => ({
                id: payBands[idx]?.id ?? idx + 1,
                job_grade: b.lbl,
                min_salary: b.min,
                target_salary: b.tgt,
                max_salary: b.max,
                factor_a: factorA,
                factor_b: factorB,
                order: idx,
            })),
        [bands, payBands, factorA, factorB]
    );

    const sameAsCurrent = useMemo(() => {
        if (payBands.length !== projectedBands.length) return false;
        for (let i = 0; i < projectedBands.length; i++) {
            const a = projectedBands[i];
            const b = payBands[i];
            if (!b) return false;
            if (
                (b.job_grade || '') !== a.job_grade ||
                Number(b.min_salary || 0) !== Number(a.min_salary || 0) ||
                Number(b.target_salary || 0) !== Number(a.target_salary || 0) ||
                Number(b.max_salary || 0) !== Number(a.max_salary || 0) ||
                Number(b.factor_a || 0) !== Number(a.factor_a || 0) ||
                Number(b.factor_b || 0) !== Number(a.factor_b || 0) ||
                Number(b.order || 0) !== Number(a.order || 0)
            ) {
                return false;
            }
        }
        return true;
    }, [payBands, projectedBands]);

    useEffect(() => {
        if (!initialized || validation || projectedBands.length === 0) return;
        if (sameAsCurrent) return;
        onPayBandsUpdate(projectedBands);
    }, [initialized, validation, projectedBands, sameAsCurrent, onPayBandsUpdate]);

    const chart = useMemo(() => {
        const W = 820;
        const PAD = { top: 28, right: 20, bottom: 44, left: 62 };
        const cW = W - PAD.left - PAD.right;
        const cH = 280;
        const H = cH + PAD.top + PAD.bottom;
        if (bands.length === 0) {
            return { W, H, PAD, yS: (_: number) => 0, xC: (_: number) => 0, bW: 0, ticks: [] as number[] };
        }
        const vals = bands.flatMap((b) => [b.min, b.max]);
        const dMin = Math.min(...vals);
        const dMax = Math.max(...vals);
        const sp = dMax - dMin || 1;
        const yMin = Math.max(0, dMin - sp * 0.18);
        const yMax = dMax + sp * 0.16;
        const yS = (v: number) => cH - ((v - yMin) / (yMax - yMin)) * cH;
        const rs = (yMax - yMin) / 5;
        const mg = Math.pow(10, Math.floor(Math.log10(rs)));
        const st = Math.ceil(rs / mg) * mg;
        const ticks: number[] = [];
        for (let t = Math.ceil(yMin / st) * st; t <= yMax + st * 0.01; t += st) ticks.push(t);
        const n = bands.length;
        const sW = cW / n;
        const bW = Math.min(52, sW * 0.36);
        const xC = (i: number) => PAD.left + sW * (i + 0.5);
        return { W, H, PAD, yS, xC, bW, ticks };
    }, [bands]);

    const resetToRecommended = () => {
        setSteps(5);
        setEMin(REC.min);
        setETgt(REC.tgt);
        setEMax(REC.max);
        setSMax(REC.sMax);
        setFactorA(REC.a);
        setFactorB(REC.b);
        setOverrides({});
        setEditCell(null);
    };

    const setOverride = (gradeIdx: number, field: FieldKey, value: number) => {
        const base = bands[gradeIdx];
        if (!base) return;
        const nextMin = field === 'min' ? value : base.min;
        const nextTgt = field === 'tgt' ? value : base.tgt;
        const nextMax = field === 'max' ? value : base.max;
        if (nextMin <= 0 || nextTgt <= nextMin || nextMax <= nextTgt) return;
        setOverrides((prev) => ({ ...prev, [gradeIdx]: { ...(prev[gradeIdx] || {}), [field]: value } }));
    };

    return (
        <div className="pb-page" style={{ maxWidth: 880 }}>
            <style>{`
                .pb-page{font-family:'Pretendard',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#EEF1F6;color:#111827;font-size:14px;line-height:1.5}
                .pb-card{background:#fff;border:.5px solid rgba(27,46,75,.18);border-radius:14px;padding:1.25rem 1.5rem;margin-bottom:1rem;box-shadow:0 1px 4px rgba(27,46,75,.06)}
                .pb-slabel{font-size:10px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;color:#9CA3AF}
                .pb-divider{height:.5px;background:rgba(27,46,75,.10);margin:1rem 0}
                .pb-stepper{display:inline-flex;align-items:stretch;border:.5px solid rgba(27,46,75,.18);border-radius:9px;overflow:hidden;background:#F7F8FA}
                .pb-stepper button{background:transparent;border:none;color:#1B2E4B;font-size:18px;width:36px;cursor:pointer;line-height:1}
                .pb-stepper span{font-size:14px;font-weight:600;color:#1B2E4B;padding:0 18px;border-left:.5px solid rgba(27,46,75,.18);border-right:.5px solid rgba(27,46,75,.18);display:flex;align-items:center;background:#fff;min-width:72px;justify-content:center}
                .pb-input-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
                .pb-field{display:flex;flex-direction:column;gap:5px}
                .pb-field label{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#4B5563}
                .pb-iw{position:relative}
                .pb-unit{position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:11px;color:#9CA3AF}
                .pb-num{width:100%;padding:8px 36px 8px 10px;font-size:15px;font-weight:600;color:#1B2E4B;border-radius:8px;border:.5px solid rgba(27,46,75,.18);background:#F7F8FA;outline:none}
                .pb-err{font-size:11px;color:#D94F4F;min-height:14px}
                .pb-factor{display:grid;grid-template-columns:1fr 1fr;gap:10px}
                .pb-fbox{background:#1B2E4B;border-radius:10px;padding:14px 16px;display:flex;flex-direction:column;gap:10px}
                .pb-fl{font-size:10px;font-weight:700;color:rgba(255,255,255,.45);letter-spacing:.09em;text-transform:uppercase}
                .pb-fv{font-size:40px;font-weight:700;color:#fff;letter-spacing:-.5px;line-height:1}
                .pb-fd{font-size:11px;color:rgba(255,255,255,.35)}
                .pb-fc{font-size:11px;color:rgba(93,202,165,.9)}
                .pb-range{appearance:none;width:100%;height:4px;border-radius:2px;outline:none;cursor:pointer;background:rgba(255,255,255,.15)}
                .pb-range::-webkit-slider-thumb{appearance:none;width:16px;height:16px;border-radius:50%;background:#5DCAA5;border:2px solid #fff}
                .pb-legend{display:flex;gap:18px;align-items:center;padding:10px 0 12px;flex-wrap:wrap}
                .pb-leg{display:flex;align-items:center;gap:6px;font-size:11px;color:#4B5563}
                .pb-table{width:100%;border-collapse:collapse;font-size:13px}
                .pb-table th{background:#1B2E4B;color:rgba(255,255,255,.8);font-weight:500;padding:8px 14px;text-align:right;font-size:11px}
                .pb-table th:first-child,.pb-table td:first-child{text-align:left}
                .pb-table td{padding:8px 14px;text-align:right;border-bottom:.5px solid rgba(27,46,75,.10)}
                .pb-chip{font-size:10px;padding:2px 8px;border-radius:20px;font-weight:600}
                .pb-chip-ok{background:#E8F7F2;color:#0B6B4A}
                .pb-chip-warn{background:#FDF1F1;color:#D94F4F}
                .pb-crit{width:100%;border-collapse:collapse;font-size:13px}
                .pb-crit th{background:#F7F8FA;color:#9CA3AF;font-weight:700;font-size:10px;letter-spacing:.06em;text-transform:uppercase;padding:8px 14px;text-align:left;border-bottom:.5px solid rgba(27,46,75,.10)}
                .pb-crit td{padding:10px 14px;border-bottom:.5px solid rgba(27,46,75,.10)}
                .pb-crit td:first-child{color:#9CA3AF;font-size:12px;width:32px}
                .pb-select{font-size:12px;border-radius:6px;border:.5px solid rgba(27,46,75,.18);background:#F7F8FA;color:#111827;padding:5px 10px;outline:none}
                .pb-actions{display:flex;gap:8px;margin-top:4px}
                .pb-btn{font-size:13px;font-weight:500;padding:9px 18px;border-radius:9px;cursor:pointer;border:.5px solid rgba(27,46,75,.18);background:#fff;color:#111827}
                .pb-btn-primary{background:#1B2E4B;color:#fff;border-color:#1B2E4B}
                .pb-btn-ghost{color:#1D9E75;border-color:rgba(29,158,117,.3)}
                .tooltip-wrap{position:relative;display:inline-block}
                .tooltip-pop{display:none;position:absolute;right:0;top:26px;width:260px;background:#fff;border-radius:10px;border:.5px solid rgba(27,46,75,.14);box-shadow:0 8px 24px rgba(27,46,75,.14);padding:14px 16px;z-index:200;color:#111827;text-align:left}
                .tooltip-pop.show{display:block}
                .info-btn{width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);color:rgba(255,255,255,.7);font-size:10px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
            `}</style>

            <div className="mb-4">
                <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1B2E4B', letterSpacing: '-.3px' }}>Pay Band Creator</h1>
                <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>직급 단계와 기준값을 입력하면 전체 밴드 구조가 자동으로 생성됩니다.</p>
            </div>

            <div className="pb-card">
                <div className="mb-4 flex items-center justify-between"><span className="pb-slabel">기준값 설정</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1rem' }}>
                    <div>
                        <div className="pb-slabel" style={{ marginBottom: 6 }}>직급 단계</div>
                        <div className="pb-stepper">
                            <button type="button" onClick={() => { setSteps((s) => clamp(s - 1, 3, 7)); setOverrides({}); }}>-</button>
                            <span>{steps}단계</span>
                            <button type="button" onClick={() => { setSteps((s) => clamp(s + 1, 3, 7)); setOverrides({}); }}>+</button>
                        </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 18 }}>3 - 7단계</div>
                </div>
                <div className="pb-divider" />
                <div className="pb-slabel" style={{ marginBottom: 8 }}>최저직급 앵커값 (Entry Grade)</div>
                <div className="pb-input-row" style={{ marginBottom: '1rem' }}>
                    <div className="pb-field">
                        <label>Min</label>
                        <div className="pb-iw"><input className="pb-num" type="number" value={eMin} step={100} min={0} onChange={(e) => setEMin(Number(e.target.value) || 0)} /><span className="pb-unit">만원</span></div>
                        <div className="pb-err">{errors.min}</div>
                    </div>
                    <div className="pb-field">
                        <label>Target</label>
                        <div className="pb-iw"><input className="pb-num" type="number" value={eTgt} step={100} min={0} onChange={(e) => setETgt(Number(e.target.value) || 0)} /><span className="pb-unit">만원</span></div>
                        <div className="pb-err">{errors.tgt}</div>
                    </div>
                    <div className="pb-field">
                        <label>Max</label>
                        <div className="pb-iw"><input className="pb-num" type="number" value={eMax} step={100} min={0} onChange={(e) => setEMax(Number(e.target.value) || 0)} /><span className="pb-unit">만원</span></div>
                        <div className="pb-err">{errors.max}</div>
                    </div>
                </div>
                <div className="pb-slabel" style={{ marginBottom: 8 }}>최고직급 앵커값 (Senior Grade)</div>
                <div style={{ maxWidth: 220 }}>
                    <div className="pb-field">
                        <label>Max (최고직급 상한)</label>
                        <div className="pb-iw"><input className="pb-num" type="number" value={sMax} step={100} min={0} onChange={(e) => setSMax(Number(e.target.value) || 0)} /><span className="pb-unit">만원</span></div>
                        <div className="pb-err">{errors.sMax}</div>
                    </div>
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>입력 시 전체 밴드 스케일이 자동 재조정됩니다.</div>
            </div>

            <div className="pb-card">
                <div className="mb-3 flex items-center justify-between"><span className="pb-slabel">성장 계수 (Factor)</span></div>
                <div className="pb-factor">
                    <div className="pb-fbox">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div className="pb-fl">Factor A — 직급 간 보상 격차</div>
                            <div className="tooltip-wrap" onMouseEnter={() => setTipA(true)} onMouseLeave={() => setTipA(false)}>
                                <button className="info-btn" type="button">i</button>
                                <div className={`tooltip-pop ${tipA ? 'show' : ''}`}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#1B2E4B', marginBottom: 6 }}>직급 간 보상 격차 (Inter-grade Pay Differential)</div>
                                    <div style={{ fontSize: 11, color: '#4B5563', lineHeight: 1.6 }}>직급 상승에 따른 보상의 상향 이동성을 결정하는 변수입니다.</div>
                                </div>
                            </div>
                        </div>
                        <div className="pb-fv">{factorA}%</div>
                        <input className="pb-range" type="range" min={5} max={50} value={factorA} step={1} onChange={(e) => setFactorA(Number(e.target.value))} />
                        <div className="pb-fd">직급 간 Target 값 증가율</div>
                    </div>
                    <div className="pb-fbox">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div className="pb-fl">Factor B — 직급 간 중첩도</div>
                            <div className="tooltip-wrap" onMouseEnter={() => setTipB(true)} onMouseLeave={() => setTipB(false)}>
                                <button className="info-btn" type="button">i</button>
                                <div className={`tooltip-pop ${tipB ? 'show' : ''}`}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#1B2E4B', marginBottom: 6 }}>직급 간 중첩도 (Pay Band Overlap)</div>
                                    <div style={{ fontSize: 11, color: '#4B5563', lineHeight: 1.6 }}>성과 기반 보상의 유연성과 직급 체계의 질서 사이의 우선순위를 결정하는 변수입니다.</div>
                                </div>
                            </div>
                        </div>
                        <div className="pb-fv">{factorB}%</div>
                        <input className="pb-range" type="range" min={60} max={capB} value={factorB} step={1} onChange={(e) => setFactorB(Number(e.target.value))} />
                        <div className="pb-fd">Target 대비 Min 비율 (Band Spread)</div>
                        <div className="pb-fc">상한 자동 제한: {capB}% (역전 방지)</div>
                    </div>
                </div>
            </div>

            <div className="pb-card">
                <div className="mb-[10px] flex items-center justify-between">
                    <span className="pb-slabel">밴드 시각화</span>
                    <span style={{ fontSize: 10, color: '#9CA3AF', background: '#F0F2F5', border: '.5px solid rgba(27,46,75,.10)', borderRadius: 5, padding: '3px 9px' }}>단위: KRW, 만원</span>
                </div>
                {hasOverlapWarn ? <div style={{ background: '#FDF1F1', border: '.5px solid rgba(217,79,79,.35)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#D94F4F', marginBottom: 10 }}>⚠ 일부 직급 간 Overlap이 15% 미만입니다. 귀사의 조직 구조에 적절한지 검토해 주세요.</div> : null}
                <div style={{ width: '100%', overflow: 'auto', position: 'relative' }}>
                    <svg width={chart.W} height={chart.H} viewBox={`0 0 ${chart.W} ${chart.H}`}>
                        {chart.ticks.map((t) => {
                            const y = chart.PAD.top + chart.yS(t);
                            return <line key={`g-${t}`} x1={chart.PAD.left} y1={y} x2={chart.W - chart.PAD.right} y2={y} stroke="rgba(27,46,75,.055)" strokeWidth="0.8" />;
                        })}
                        {chart.ticks.map((t) => {
                            const y = chart.PAD.top + chart.yS(t);
                            return <text key={`l-${t}`} x={chart.PAD.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#9CA3AF">{fmtAx(t)}</text>;
                        })}
                        <line x1={chart.PAD.left} y1={chart.PAD.top} x2={chart.PAD.left} y2={chart.H - chart.PAD.bottom} stroke="rgba(27,46,75,.14)" strokeWidth="0.8" />
                        {bands.map((b, i) => {
                            const cx = chart.xC(i);
                            const bx = cx - chart.bW / 2;
                            const by = chart.PAD.top + chart.yS(b.max);
                            const bh = chart.yS(b.min) - chart.yS(b.max);
                            const ty = chart.PAD.top + chart.yS(b.tgt);
                            return (
                                <g key={`bar-${b.lbl}`}>
                                    <rect x={bx} y={by} width={chart.bW} height={bh} fill="rgba(225,245,238,.93)" stroke="#1D9E75" strokeWidth="1.3" rx="3" />
                                    <line x1={bx + 2} y1={ty} x2={bx + chart.bW - 2} y2={ty} stroke="#1B2E4B" strokeWidth="0.8" strokeDasharray="3,2" opacity=".30" />
                                    <circle cx={cx} cy={ty} r="4.5" fill="#fff" stroke="#1B2E4B" strokeWidth="2" />
                                    <text x={cx} y={by - 6} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1B2E4B" style={{ cursor: 'pointer' }} onClick={() => { setEditDraft(String(b.max)); setEditCell({ gradeIdx: i, field: 'max' }); }}>{fmt(b.max)}</text>
                                    <text x={bx - 5} y={ty + 4} textAnchor="end" fontSize="10" fontWeight="700" fill="#1D9E75" style={{ cursor: 'pointer' }} onClick={() => { setEditDraft(String(b.tgt)); setEditCell({ gradeIdx: i, field: 'tgt' }); }}>{fmt(b.tgt)}</text>
                                    <text x={cx} y={by + bh + 13} textAnchor="middle" fontSize="10" fontWeight="700" fill="#6B7280" style={{ cursor: 'pointer' }} onClick={() => { setEditDraft(String(b.min)); setEditCell({ gradeIdx: i, field: 'min' }); }}>{fmt(b.min)}</text>
                                    <text x={cx} y={chart.H - chart.PAD.bottom + 18} textAnchor="middle" fontSize="12" fontWeight="600" fill="#1B2E4B">{b.lbl}</text>
                                </g>
                            );
                        })}
                        {bands.map((_, i) => {
                            if (i === 0) return null;
                            const ov = bands[i - 1].max - bands[i].min;
                            const pct = ovPct(i);
                            if (ov <= 0 || pct === null || pct <= 0) return null;
                            const ex = chart.bW * 0.22;
                            const sx1 = chart.xC(i - 1) + chart.bW / 2 - ex;
                            const sx2 = chart.xC(i) - chart.bW / 2 + ex;
                            const oy1 = chart.PAD.top + chart.yS(bands[i - 1].max);
                            const oy2 = chart.PAD.top + chart.yS(bands[i].min);
                            const shH = oy2 - oy1;
                            const midX = (sx1 + sx2) / 2;
                            const midY = (oy1 + oy2) / 2;
                            return (
                                <g key={`ov-${i}`}>
                                    <rect x={sx1} y={oy1} width={sx2 - sx1} height={shH} fill="rgba(29,158,117,.10)" stroke="rgba(29,158,117,.28)" strokeWidth="0.6" strokeDasharray="4,2.5" rx="2" />
                                    {shH > 14 ? (
                                        <text x={midX} y={midY + 4} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="rgba(15,110,86,.75)">
                                            {pct}%
                                        </text>
                                    ) : null}
                                </g>
                            );
                        })}
                        <polyline
                            points={bands.map((b, i) => `${chart.xC(i)},${chart.PAD.top + chart.yS(b.tgt)}`).join(' ')}
                            fill="none"
                            stroke="#1B2E4B"
                            strokeWidth="1.8"
                            strokeLinejoin="round"
                            opacity=".85"
                        />
                    </svg>
                    {editCell ? (() => {
                        const i = editCell.gradeIdx;
                        const b = bands[i];
                        if (!b) return null;
                        const cx = chart.xC(i);
                        const bx = cx - chart.bW / 2;
                        const by = chart.PAD.top + chart.yS(b.max);
                        const bh = chart.yS(b.min) - chart.yS(b.max);
                        const ty = chart.PAD.top + chart.yS(b.tgt);
                        const top =
                            editCell.field === 'max' ? by - 18 :
                            editCell.field === 'tgt' ? ty - 12 :
                            by + bh + 2;
                        const left =
                            editCell.field === 'tgt' ? bx - 78 :
                            cx - 36;
                        return (
                            <input
                                type="number"
                                autoFocus
                                value={editDraft}
                                onChange={(e) => setEditDraft(e.target.value)}
                                onBlur={() => setEditCell(null)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') setEditCell(null);
                                    if (e.key !== 'Enter') return;
                                    const next = Number(editDraft);
                                    if (!Number.isFinite(next)) return;
                                    setOverride(i, editCell.field, Math.round(next));
                                    setEditCell(null);
                                }}
                                style={{
                                    position: 'absolute',
                                    left,
                                    top,
                                    width: 72,
                                    height: 26,
                                    border: '1.5px solid #1D9E75',
                                    borderRadius: 5,
                                    background: '#fff',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: '#1B2E4B',
                                    textAlign: 'center',
                                    outline: 'none',
                                    padding: '1px 2px',
                                    boxShadow: '0 2px 8px rgba(29,158,117,.18)',
                                }}
                            />
                        );
                    })() : null}
                </div>
                <div className="pb-legend">
                    <div className="pb-leg"><span style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(225,245,238,.95)', border: '1.5px solid #1D9E75' }} />밴드 (Min - Max)</div>
                    <div className="pb-leg"><span style={{ width: 22, height: 2, background: '#1B2E4B', position: 'relative', display: 'inline-block' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', border: '2px solid #1B2E4B', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} /></span>Target</div>
                    <div className="pb-leg"><span style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(29,158,117,.13)', border: '1px dashed rgba(29,158,117,.5)' }} />Overlap 구간</div>
                    <div style={{ marginLeft: 'auto', fontSize: 11, color: '#9CA3AF' }}>수치 클릭 시 직접 편집 가능</div>
                </div>
                <div style={{ overflowX: 'auto', borderTop: '.5px solid rgba(27,46,75,.10)' }}>
                    <table className="pb-table">
                        <thead>
                            <tr>
                                <th>직급</th><th>Min</th><th>Target</th><th>Max</th><th>Band Width</th><th>Overlap</th><th />
                            </tr>
                        </thead>
                        <tbody>
                            {bands.map((b, i) => {
                                const pct = ovPct(i);
                                const warn = pct !== null && pct < 15;
                                return (
                                <tr key={`row-${b.lbl}`}>
                                    <td>{b.lbl}{b.manual ? <span style={{ fontSize: 9, marginLeft: 4, background: '#FEF3C7', color: '#92400E', padding: '1px 5px', borderRadius: 10 }}>수동편집</span> : null}</td>
                                    <td>{fmt(b.min)}만</td>
                                    <td>{fmt(b.tgt)}만</td>
                                    <td>{fmt(b.max)}만</td>
                                    <td>{fmt(b.max - b.min)}만</td>
                                    <td>{pct === null ? <span style={{ color: '#9CA3AF', fontSize: 11 }}>—</span> : <span className={`pb-chip ${warn ? 'pb-chip-warn' : 'pb-chip-ok'}`}>{pct}%</span>}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        {b.manual ? <button type="button" onClick={() => setOverrides((prev) => { const n = { ...prev }; delete n[i]; return n; })} style={{ fontSize: 10, background: 'none', border: '.5px solid rgba(27,46,75,.18)', borderRadius: 5, padding: '2px 7px', cursor: 'pointer', color: '#9CA3AF' }}>초기화</button> : null}
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="pb-card">
                <div className="mb-4 flex items-center justify-between"><span className="pb-slabel">Operation Criteria</span></div>
                <table className="pb-crit">
                    <thead><tr><th>No.</th><th>항목</th><th>설정값</th></tr></thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>Outlier 허용 여부</td>
                            <td>
                                <select
                                    className="pb-select"
                                    value={operationCriteria.outlier_handling || ''}
                                    onChange={(e) =>
                                        onOperationCriteriaUpdate({
                                            ...operationCriteria,
                                            outlier_handling: e.target.value,
                                        })
                                    }
                                >
                                    <option value="allowed_with_ceo_approval">허용</option>
                                    <option value="not_allowed">허용 안 함</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>밴드 이동 시 규칙 (승진)</td>
                            <td>
                                <select
                                    className="pb-select"
                                    value={operationCriteria.promotion_movement_rule || ''}
                                    onChange={(e) =>
                                        onOperationCriteriaUpdate({
                                            ...operationCriteria,
                                            promotion_movement_rule: e.target.value,
                                        })
                                    }
                                >
                                    <option value="guarantee_minimum">신규 밴드의 Min값 적용</option>
                                    <option value="below_minimum_allowed">Min값 미달 허용</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td>밴드 검토 주기</td>
                            <td>
                                <select
                                    className="pb-select"
                                    value={operationCriteria.band_review_cycle || ''}
                                    onChange={(e) =>
                                        onOperationCriteriaUpdate({
                                            ...operationCriteria,
                                            band_review_cycle: e.target.value,
                                        })
                                    }
                                >
                                    <option value="annual">1년</option>
                                    <option value="every_2_years">2년</option>
                                    <option value="ad_hoc">비정기</option>
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="pb-actions">
                <button type="button" className="pb-btn pb-btn-ghost" onClick={resetToRecommended}>↺ Reset to Recommended</button>
                <button type="button" className="pb-btn pb-btn-primary">저장 후 다음 단계 →</button>
            </div>

        </div>
    );
}

