import React, { useEffect, useMemo, useState } from 'react'

function rotate(arr, k){
  if(!arr.length) return arr
  const s = ((k % arr.length) + arr.length) % arr.length
  return [...arr.slice(s), ...arr.slice(0, s)]
}

function schedule({ playersRaw, courts, rounds, minutesPerRound, startISO }){
  const players = Array.from(new Set(
    playersRaw.split(/\n|,/).map(s=>s.trim()).filter(Boolean)
  ))

  if(!players.length || !courts || !rounds) return { rounds: [], players }
  const capacity = Math.max(1, courts)*4
  const start = startISO ? new Date(startISO) : null

  const roundsOut = []
  for(let r=0; r<rounds; r++){
    const rotated = rotate(players, r % Math.max(players.length,1))
    const selected = rotated.slice(0, Math.min(capacity, rotated.length))
    const bench = rotated.length > capacity ? rotated.slice(capacity) : []

    const pool = [...selected]
    while(pool.length % 4 !== 0) pool.push('BYE')

    const matches = []
    let court = 1
    for(let i=0; i<pool.length; i+=4){
      const a = pool[i], b = pool[i+1], c = pool[i+2], d = pool[i+3]
      matches.push({ court, teamA:[a,c], teamB:[b,d] })
      court = court + 1
      if(court > courts) court = 1
    }

    const startTime = start ? new Date(start.getTime() + r*minutesPerRound*60000) : null
    roundsOut.push({ index:r+1, startTime, matches: matches.slice(0, courts), bench })
  }
  return { rounds: roundsOut, players }
}

function fmtTime(d){
  return d?.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) ?? ''
}

function keyFor(roundIdx, matchIdx){
  return `${roundIdx}-${matchIdx}`
}

export default function App(){
  const [playersRaw, setPlayersRaw] = useState('Jorge\nPaco\nLeo\nPepe\nAugusto\nNereo')
  const [courts, setCourts] = useState(2)
  const [roundsN, setRoundsN] = useState(4)
  const [minutes, setMinutes] = useState(20)
  const [useStart, setUseStart] = useState(false)
  const [startISO, setStartISO] = useState(new Date().toISOString().slice(0,16))

  const [scores, setScores] = useState(()=>{
    try { return JSON.parse(localStorage.getItem('pm:scores') || '{}') } catch { return {} }
  })

  const { rounds, players } = useMemo(()=> schedule({ playersRaw, courts, rounds: roundsN, minutesPerRound: minutes, startISO: useStart?startISO:null }), [playersRaw, courts, roundsN, minutes, useStart, startISO])

  useEffect(()=>{ localStorage.setItem('pm:scores', JSON.stringify(scores)) }, [scores])

  useEffect(()=>{
    const validKeys = new Set()
    for(const r of rounds){ r.matches.forEach((_, idx)=> validKeys.add(keyFor(r.index, idx))) }
    const next = {}
    for(const k in scores){ if(validKeys.has(k)) next[k] = scores[k] }
    if(JSON.stringify(next) !== JSON.stringify(scores)) setScores(next)
    // eslint-disable-next-line
  }, [roundsN, courts, playersRaw])

  const leaderboard = useMemo(()=>{
    const totals = Object.fromEntries(players.map(p => [p, 0]))
    for(const r of rounds){
      r.matches.forEach((m, idx)=>{
        const k = keyFor(r.index, idx)
        const s = scores[k] || { a:0, b:0 }
        m.teamA.forEach(p => { if(p && p !== 'BYE') totals[p] = (totals[p]||0) + (s.a||0) })
        m.teamB.forEach(p => { if(p && p !== 'BYE') totals[p] = (totals[p]||0) + (s.b||0) })
      })
    }
    const rows = Object.entries(totals).map(([name, points])=>({ name, points }))
    rows.sort((a,b)=> b.points - a.points || a.name.localeCompare(b.name))
    return rows
  }, [rounds, scores, players])

  const updateScore = (roundIdx, matchIdx, which, val) => {
    const k = keyFor(roundIdx, matchIdx)
    const prev = scores[k] || { a:0, b:0 }
    const next = { ...prev, [which]: Math.max(0, Number(val)||0) }
    setScores({ ...scores, [k]: next })
  }

  const inc = (roundIdx, matchIdx, which, delta) => {
    const k = keyFor(roundIdx, matchIdx)
    const prev = scores[k] || { a:0, b:0 }
    const next = { ...prev, [which]: Math.max(0, (prev[which]||0) + delta) }
    setScores({ ...scores, [k]: next })
  }

  const resetScores = () => {
    if(confirm('¿Borrar todos los marcadores?')) setScores({})
  }

  const exportFixture = () => {
    const lines = []
    for(const r of rounds){
      lines.push(r.startTime ? `Ronda ${r.index} — ${fmtTime(r.startTime)}` : `Ronda ${r.index}`)
      for(const m of r.matches){
        lines.push(`  Cancha ${m.court}: ${m.teamA.join(' & ')} vs ${m.teamB.join(' & ')}`)
      }
      if(r.bench?.length){ lines.push(`  Descansan: ${r.bench.join(', ')}`) }
      lines.push('')
    }
    shareOrCopy(lines.join('\n'), 'Fixture copiado al portapapeles')
  }

  const exportLeaderboard = () => {
    const lines = ['Tabla de puntos — PadelMatch', '']
    leaderboard.forEach((row, idx)=>{
      lines.push(`${idx+1}. ${row.name}: ${row.points} pts`)
    })
    shareOrCopy(lines.join('\n'), 'Tabla de puntos copiada al portapapeles')
  }

  const shareOrCopy = async (text, fallbackMsg) => {
    try {
      if(navigator.share){ await navigator.share({ text }) }
      else { await navigator.clipboard.writeText(text); alert(fallbackMsg) }
    } catch(e){ console.log(e) }
  }

  return (
    <div className="app">
      <div className="hero">
        <img className="hero-bg" src="/art/padel-bg.svg" alt="" />
        <div className="hero-strip" />
        <div className="hero-inner">
          <div className="brand">
            <img src="/art/racket.svg" alt="" className="icon" />
            <h1>PadelMatch</h1>
          </div>
          <p className="tag">Rondas, marcadores y tabla de puntos en tiempo real.</p>
          <div className="badges">
            <span className="badge blue">Azul</span>
            <span className="badge green">Verde</span>
            <span className="badge red">Rojo</span>
          </div>
        </div>
      </div>

      <section className="card elevate">
        <h2><img src="/art/ball.svg" alt="" className="tiny" /> Jugadores</h2>
        <textarea value={playersRaw} onChange={e=>setPlayersRaw(e.target.value)} placeholder="Un nombre por línea…" rows={6} />
        <p className="hint">Tip: pega una lista de WhatsApp, un nombre por línea.</p>
      </section>

      <section className="card grid elevate">
        <div>
          <label>Canchas</label>
          <input type="number" min={1} max={12} value={courts} onChange={e=>setCourts(parseInt(e.target.value||'1'))} />
        </div>
        <div>
          <label>Rondas</label>
          <input type="number" min={1} max={30} value={roundsN} onChange={e=>setRoundsN(parseInt(e.target.value||'1'))} />
        </div>
        <div>
          <label>Min por ronda</label>
          <input type="number" min={5} step={5} value={minutes} onChange={e=>setMinutes(parseInt(e.target.value||'5'))} />
        </div>
        <div className="toggle">
          <label>
            <input type="checkbox" checked={useStart} onChange={e=>setUseStart(e.target.checked)} /> Usar hora de inicio
          </label>
          {useStart && (
            <input type="datetime-local" value={startISO} onChange={e=>setStartISO(e.target.value)} />
          )}
        </div>
        <div className="full actions">
          <button className="btn blue">Generar</button>
          <button className="btn green" onClick={exportFixture}>Exportar retas</button>
          <button className="btn red" onClick={resetScores}>Borrar marcadores</button>
        </div>
      </section>

      {rounds.length>0 && (
        <section className="list">
          {rounds.map(r=> (
            <div key={r.index} className="round padel">
              <div className="round-head">
                <h3>Ronda {r.index}</h3>
                {r.startTime && <span>{fmtTime(r.startTime)}</span>}
              </div>
              {r.matches.map((m,idx)=>{
                const k = keyFor(r.index, idx)
                const s = scores[k] || { a:0, b:0 }
                return (
                  <div key={idx} className="match column">
                    <div className="row between">
                      <div className="court">Cancha <b className="chip blue">{m.court}</b></div>
                      <div className="teams">{m.teamA.join(' & ')} <b>vs</b> {m.teamB.join(' & ')}</div>
                    </div>
                    <div className="scorebar">
                      <div className="score">
                        <button onClick={()=>inc(r.index, idx, 'a', -1)}>-</button>
                        <input type="number" min="0" value={s.a} onChange={e=>updateScore(r.index, idx, 'a', e.target.value)} />
                        <button onClick={()=>inc(r.index, idx, 'a', +1)}>+</button>
                        <span className="label">Pareja 1</span>
                      </div>
                      <div className="score">
                        <button onClick={()=>inc(r.index, idx, 'b', -1)}>-</button>
                        <input type="number" min="0" value={s.b} onChange={e=>updateScore(r.index, idx, 'b', e.target.value)} />
                        <button onClick={()=>inc(r.index, idx, 'b', +1)}>+</button>
                        <span className="label">Pareja 2</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {r.bench?.length>0 && (
                <div className="bench"><span className="chip red">Descansan</span> {r.bench.join(', ')}</div>
              )}
            </div>
          ))}
        </section>
      )}

      {players.length>0 && (
        <section className="card elevate leaderboard">
          <div className="leader-head">
            <h2>Tabla de puntos</h2>
            <button className="btn blue" onClick={exportLeaderboard}>Exportar tabla</button>
          </div>
          <div className="table">
            <div className="thead row">
              <div>#</div><div>Jugador</div><div>Puntos</div>
            </div>
            {leaderboard.map((row, idx)=>(
              <div className="row" key={row.name}>
                <div>{idx+1}</div>
                <div>{row.name}</div>
                <div className="points">{row.points}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="footer">Hecho con <span>💙</span> para retas de pádel — PadelMatch</footer>
    </div>
  )
}
