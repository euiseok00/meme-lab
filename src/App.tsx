import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { MAX_LEN, decodeMessage, encodeMessage } from './codec.ts'

declare global {
  interface Window { Kakao?: any }
}

const CLICKS = 7
const PHRASES = [
  '반응 패턴 측정 대기 중',
  '반응 패턴 측정 중...',
  '인지 반응 속도 분석 중...',
  '패턴 일관성 검토 중...',
  '신경 반응 데이터 수집 중...',
  '표본 대조군 비교 중...',
  '통계적 유의성 검증 중...',
  '분석 완료',
]
const MEMES = ['줴줴이야', '티원', '엄', 'ㅋ']
const COLORS = ['#ff3db8', '#3df2ff', '#ffe14d', '#b45cff']

export default function App() {
  const message = decodeMessage(new URLSearchParams(location.search).get('m'))
  return message ? <Receiver message={message} /> : <Create />
}

/* ---------- 아이콘 ---------- */

const Building = () => (
  <svg width="40" height="36" viewBox="0 0 40 36" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M3 11 20 3l17 8z" fill="currentColor" />
    <path d="M6 14h28M8 14v14M14 14v14M20 14v14M26 14v14M32 14v14M4 30h32M2 34h36" />
  </svg>
)
const Flask = () => (
  <svg width="30" height="32" viewBox="0 0 30 32" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M10 2h10M12 2v10L3 28a2 2 0 0 0 2 3h20a2 2 0 0 0 2-3l-9-16V2" />
    <path d="M7 22h16l3 6H4z" fill="currentColor" />
  </svg>
)
const Pulse = () => (
  <svg width="36" height="16" viewBox="0 0 36 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M0 8h10l3-6 4 12 3-9 2 3h14" />
  </svg>
)

function Header() {
  return (
    <header className="inst">
      <Building />
      <div>
        <strong>국립 인지과학 연구소</strong>
        <small>National Cognitive Science Institute</small>
      </div>
    </header>
  )
}

/* ---------- 생성 ---------- */

function Create() {
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [notice, setNotice] = useState('')
  const valid = text.trim().length > 0

  const makeUrl = () => {
    const u = `${location.origin}${location.pathname}?m=${encodeMessage(text.trim())}`
    setUrl(u)
    return u
  }

  const copy = async () => {
    const u = makeUrl()
    try {
      await navigator.clipboard.writeText(u)
      setNotice('링크가 복사되었습니다.')
    } catch {
      setNotice('아래 링크를 길게 눌러 복사하세요.')
    }
  }

  const shareKakao = async () => {
    const u = makeUrl()
    const key = import.meta.env.VITE_KAKAO_KEY
    const K = window.Kakao
    if (K && key) {
      if (!K.isInitialized()) K.init(key)
      K.Share.sendDefault({
        objectType: 'text',
        text: '[국립 인지과학 연구소]\n귀하에 대한 분석 결과가 준비되었습니다.',
        link: { mobileWebUrl: u, webUrl: u },
        buttonTitle: '결과 확인하기',
      })
    } else if (navigator.share) {
      // shortcut: no Kakao key configured, falls back to OS share sheet; set VITE_KAKAO_KEY for real Kakao share
      await navigator.share({ title: '국립 인지과학 연구소', url: u }).catch(() => {})
    } else {
      await copy()
    }
  }

  return (
    <main className="page">
      <h1 className="lab-title"><Flask /> 메시지 실험실</h1>
      <p className="muted center">진지한 검증을 거쳐<br />메시지를 전달하는 실험실입니다.</p>

      <label className="label" htmlFor="msg">전달할 메시지</label>
      <textarea
        id="msg"
        value={text}
        maxLength={MAX_LEN}
        placeholder="친구에게 보낼 메시지를 입력하세요"
        onChange={e => { setText(e.target.value); setUrl(''); setNotice('') }}
      />
      <div className="count">{text.length} / {MAX_LEN}</div>

      <div className="label">결과 미리보기</div>
      <div className="preview">
        <small>(최종 화면 예시)</small>
        <p>{text.trim() || '메시지를 입력하세요'}</p>
      </div>

      <button className="btn dark" disabled={!valid} onClick={copy}>🔗 링크 생성하기</button>
      <button className="btn kakao" disabled={!valid} onClick={shareKakao}>
        <span className="talk">TALK</span> 카카오톡으로 공유하기
      </button>

      {notice && <p className="muted center">{notice}</p>}
      {url && <input className="url" readOnly value={url} aria-label="공유 링크" onFocus={e => e.target.select()} />}
      <p className="warn">링크에 메시지가 그대로 담기니 민감한 정보는 입력하지 마세요.</p>
    </main>
  )
}

/* ---------- 받는 사람 ---------- */

type Stage = 'intro' | 'verify' | 'loading' | 'freeze' | 'result'

function Receiver({ message }: { message: string }) {
  const [stage, setStage] = useState<Stage>('intro')
  const [count, setCount] = useState(0)

  useEffect(() => {
    const next: Partial<Record<Stage, [Stage, number]>> = { loading: ['freeze', 1500], freeze: ['result', 800] }
    const step = next[stage]
    if (!step) return
    const t = setTimeout(() => setStage(step[0]), step[1])
    return () => clearTimeout(t)
  }, [stage])

  const click = () => {
    const n = count + 1
    setCount(n)
    navigator.vibrate?.(20)
    if (n >= CLICKS) setTimeout(() => setStage('loading'), 400)
  }

  if (stage === 'result') return <Result message={message} />

  return (
    <main className="page">
      <Header />
      {stage === 'intro' && (
        <>
          <h1 className="headline">귀하에 대한<br />분석 결과가<br />준비되었습니다.</h1>
          <p className="muted center">결과 열람을 위해<br />간단한 검증 절차를 진행해야 합니다.</p>
          <dl className="info">
            <dt>실험명</dt><dd>인지 반응 검증 실험</dd>
            <dt>소요 시간</dt><dd>약 10초</dd>
            <dt>절차</dt><dd>지정된 버튼 {CLICKS}회 클릭</dd>
          </dl>
          <button className="btn dark" onClick={() => setStage('verify')}>검증 시작하기 ›</button>
        </>
      )}

      {stage === 'verify' && (
        <>
          <p className="center sub">검증 진행 중</p>
          <div className="counter" aria-live="polite">{count}<span> / </span>{CLICKS}</div>
          <Bar value={count / CLICKS} />
          <div className="phrase"><Pulse /> {PHRASES[count]}</div>
          <button className="big-btn" onClick={click} disabled={count >= CLICKS}>클릭</button>
        </>
      )}

      {(stage === 'loading' || stage === 'freeze') && (
        <>
          <div className="check" aria-hidden>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12.5 10 17l9-10" /></svg>
          </div>
          <h1 className="headline small">검증이 완료되었습니다.</h1>
          <p className="muted center">결과를 불러오는 중...</p>
          <Bar value={1} animate />
          <p className="center"><strong>100%</strong></p>
        </>
      )}
    </main>
  )
}

function Bar({ value, animate }: { value: number; animate?: boolean }) {
  return (
    <div className="bar" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className={animate ? 'fill fill-load' : 'fill'} style={{ width: `${value * 100}%` }} />
    </div>
  )
}

/* ---------- 결과 ---------- */

const rnd = (a: number, b: number) => a + Math.random() * (b - a)

function Result({ message }: { message: string }) {
  const items = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const p = () => ({ x: `${rnd(-10, 90)}vw`, y: `${rnd(-5, 95)}vh`, r: `${rnd(-60, 60)}deg`, s: rnd(0.5, 2.2) })
        const [a, b, c] = [p(), p(), p()]
        return {
          text: MEMES[i % MEMES.length],
          style: {
            color: COLORS[i % COLORS.length],
            fontSize: `${rnd(28, 60)}px`,
            animationDuration: `${rnd(0.7, 1.8)}s`,
            animationDelay: `${-rnd(0, 2)}s`,
            '--x0': a.x, '--y0': a.y, '--r0': a.r, '--s0': a.s,
            '--x1': b.x, '--y1': b.y, '--r1': b.r, '--s1': b.s,
            '--x2': c.x, '--y2': c.y, '--r2': c.r, '--s2': c.s,
          } as CSSProperties,
        }
      }),
    [],
  )

  return (
    <main className="result">
      <div className="burst" aria-hidden />
      <div className="memes" aria-hidden>
        {items.map((m, i) => <span key={i} className="meme" style={m.style}>{m.text}</span>)}
      </div>
      <div className="message" role="status">{message}</div>
      <a className="btn white again" href={location.pathname}>나도 만들기 ›</a>
    </main>
  )
}
