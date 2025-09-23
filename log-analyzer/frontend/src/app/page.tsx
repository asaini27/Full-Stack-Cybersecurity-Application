'use client'
import { useState } from 'react'
import { API_URL, basicHeader } from '@/lib/api'

type Row = {
  timestamp: string
  ip: string
  method: string
  path: string
  status: number
  bytes: number
  __anomalous?: boolean
}

export default function Home() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('password')
  const [authed, setAuthed] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [resp, setResp] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)

  async function login() {
    setErr(null)
    const r = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const j = await r.json()
    if (j.ok) setAuthed(true)
    else setErr('Invalid credentials')
  }

  async function upload() {
    setErr(null)
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: basicHeader(username, password),
      body: fd
    })
    const j = await r.json()

    // mark preview rows that are referenced by anomalies
    const marks = new Set<string>()
    for (const a of j.anomalies || []) {
      const r = a.row
      if (r) marks.add(`${r.ip}|${r.timestamp}|${r.method}|${r.path}|${r.status}`)
    }
    ;(j.preview || []).forEach((r: Row) => {
      r.__anomalous = marks.has(`${r.ip}|${r.timestamp}|${r.method}|${r.path}|${r.status}`)
    })

    setResp(j)
  }

  return (
    <main style={{ maxWidth: 960, margin: '40px auto', padding: 16 }}>
      <h1>Log Analyzer</h1>

      <section style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8, marginBottom: 16 }}>
        <h3>Login</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} />
          <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button onClick={login}>Login</button>
          {authed ? <span>✅ Logged in</span> : <span>Not logged in</span>}
        </div>
        {err && <p style={{ color: 'crimson' }}>{err}</p>}
      </section>

      <section style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8, marginBottom: 16 }}>
        <h3>Upload Log File</h3>
        <input type="file" accept=".log,.txt,.csv" onChange={e=>setFile(e.target.files?.[0] || null)} />
        <button onClick={upload} disabled={!authed || !file} style={{ marginLeft: 8 }}>Analyze</button>
      </section>

      {resp?.ok && (
        <section style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
          <h3>Summary</h3>
          <pre>{JSON.stringify(resp.summary, null, 2)}</pre>

          <h3>Timeline (per minute)</h3>
          <pre style={{ maxHeight: 240, overflow: 'auto' }}>{JSON.stringify(resp.timeline.slice(0, 10), null, 2)}</pre>

          <h3>Anomalies</h3>
          {resp.anomalies.length === 0 ? <p>No anomalies detected.</p> : (
            <ul>
              {resp.anomalies.map((a: any, i: number) => (
                <li key={i}>
                  <strong>{a.type}</strong> — {a.explanation} — confidence: {a.confidence ?? 'n/a'}
                </li>
              ))}
            </ul>
          )}

          <h3>Preview (first 50 rows)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['timestamp','ip','method','path','status','bytes'].map(h => (
                  <th key={h} style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resp.preview.map((r: Row, i: number) => (
                <tr key={i} style={{ background: r.__anomalous ? 'rgba(255,0,0,0.08)' : 'transparent' }}>
                  <td style={{ padding: '6px' }}>{r.timestamp}</td>
                  <td style={{ padding: '6px' }}>{r.ip}</td>
                  <td style={{ padding: '6px' }}>{r.method}</td>
                  <td style={{ padding: '6px' }}>{r.path}</td>
                  <td style={{ padding: '6px' }}>{r.status}</td>
                  <td style={{ padding: '6px' }}>{r.bytes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  )
}
