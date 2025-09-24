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
  const [loading, setLoading] = useState(false)

  async function login() {
    setErr(null)
    setLoading(true)
    try {
      const r = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const j = await r.json()
      if (j.ok) {
        setAuthed(true)
        setErr(null)
      } else {
        setErr('Invalid credentials')
      }
    } catch (error) {
      setErr('Connection error. Please check if the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  async function upload() {
    setErr(null)
    if (!file) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: basicHeader(username, password),
        body: fd
      })
      const j = await r.json()

      if (j.ok) {
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
        setErr(null)
      } else {
        setErr(j.error || 'Upload failed')
      }
    } catch (error) {
      setErr('Upload failed. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <main style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '20px',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <header style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          padding: '20px 0'
        }}>
          <h1 style={{ 
            color: 'white', 
            fontSize: '2.5rem', 
            fontWeight: '700',
            margin: 0,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            🔍 Cybersecurity Log Analyzer
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '1.1rem',
            margin: '10px 0 0 0'
          }}>
            AI-Powered Threat Detection & Analysis
          </p>
        </header>

        {/* Login Section */}
        <section style={{ 
          background: 'white',
          padding: '30px', 
          borderRadius: '16px', 
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#333',
            fontSize: '1.3rem',
            fontWeight: '600'
          }}>
            🔐 Authentication
          </h3>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            marginBottom: '16px'
          }}>
            <input 
              placeholder="Username" 
              value={username} 
              onChange={e=>setUsername(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '16px',
                flex: '1',
                minWidth: '200px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = '#e1e5e9'}
            />
            <input 
              placeholder="Password" 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '16px',
                flex: '1',
                minWidth: '200px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = '#e1e5e9'}
            />
            <button 
              onClick={login}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: loading ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                minWidth: '100px'
              }}
              onMouseOver={e => !loading && (e.target.style.background = '#5a6fd8')}
              onMouseOut={e => !loading && (e.target.style.background = '#667eea')}
            >
              {loading ? '⏳' : 'Login'}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {authed ? (
              <span style={{ color: '#10b981', fontWeight: '600' }}>✅ Authenticated</span>
            ) : (
              <span style={{ color: '#6b7280' }}>❌ Not authenticated</span>
            )}
          </div>
          {err && (
            <div style={{ 
              color: '#dc2626', 
              background: '#fef2f2',
              padding: '12px',
              borderRadius: '8px',
              marginTop: '16px',
              border: '1px solid #fecaca'
            }}>
              {err}
            </div>
          )}
        </section>

        {/* Upload Section */}
        <section style={{ 
          background: 'white',
          padding: '30px', 
          borderRadius: '16px', 
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#333',
            fontSize: '1.3rem',
            fontWeight: '600'
          }}>
            📁 Upload Log File
          </h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input 
              type="file" 
              accept=".log,.txt,.csv" 
              onChange={e=>setFile(e.target.files?.[0] || null)}
              style={{
                padding: '12px',
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                flex: '1',
                minWidth: '300px',
                cursor: 'pointer'
              }}
            />
            <button 
              onClick={upload} 
              disabled={!authed || !file || loading}
              style={{
                padding: '12px 24px',
                background: (!authed || !file || loading) ? '#ccc' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (!authed || !file || loading) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                minWidth: '120px'
              }}
              onMouseOver={e => (!authed || !file || loading) || (e.target.style.background = '#059669')}
              onMouseOut={e => (!authed || !file || loading) || (e.target.style.background = '#10b981')}
            >
              {loading ? '⏳ Analyzing...' : '🚀 Analyze'}
            </button>
          </div>
          {file && (
            <div style={{ 
              marginTop: '12px', 
              padding: '8px 12px',
              background: '#f0f9ff',
              borderRadius: '6px',
              color: '#0369a1',
              fontSize: '14px'
            }}>
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </section>

        {/* Results Section */}
        {resp?.ok && (
          <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
            {/* Summary Cards */}
            <section style={{ 
              background: 'white',
              padding: '30px', 
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              gridColumn: '1 / -1'
            }}>
              <h3 style={{ 
                margin: '0 0 24px 0', 
                color: '#333',
                fontSize: '1.5rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📊 Analysis Summary
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px' 
              }}>
                <div style={{ 
                  padding: '20px', 
                  background: '#f8fafc', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>
                    {resp.summary.total.toLocaleString()}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>Total Requests</div>
                </div>
                <div style={{ 
                  padding: '20px', 
                  background: '#f8fafc', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                    {resp.summary.unique_ips.toLocaleString()}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>Unique IPs</div>
                </div>
                <div style={{ 
                  padding: '20px', 
                  background: '#f8fafc', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: resp.summary.error_rate > 0.1 ? '#dc2626' : '#f59e0b' }}>
                    {(resp.summary.error_rate * 100).toFixed(1)}%
                  </div>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>Error Rate</div>
                </div>
                <div style={{ 
                  padding: '20px', 
                  background: '#f8fafc', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: resp.anomalies.length > 0 ? '#dc2626' : '#10b981' }}>
                    {resp.anomalies.length}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>Threats Detected</div>
                </div>
              </div>
            </section>

            {/* Top IPs Chart */}
            <section style={{ 
              background: 'white',
              padding: '30px', 
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                margin: '0 0 20px 0', 
                color: '#333',
                fontSize: '1.3rem',
                fontWeight: '600'
              }}>
                🌐 Top IP Addresses
              </h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {resp.summary.top_ips.map(([ip, count], i) => (
                  <div key={ip} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: i < resp.summary.top_ips.length - 1 ? '1px solid #f1f5f9' : 'none'
                  }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>{ip}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '100px', 
                        height: '8px', 
                        background: '#e2e8f0', 
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${(count / resp.summary.top_ips[0][1]) * 100}%`, 
                          height: '100%', 
                          background: '#667eea',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Paths Chart */}
            <section style={{ 
              background: 'white',
              padding: '30px', 
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                margin: '0 0 20px 0', 
                color: '#333',
                fontSize: '1.3rem',
                fontWeight: '600'
              }}>
                🛤️ Top Request Paths
              </h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {resp.summary.top_paths.map(([path, count], i) => (
                  <div key={path} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: i < resp.summary.top_paths.length - 1 ? '1px solid #f1f5f9' : 'none'
                  }}>
                    <span style={{ fontSize: '14px', wordBreak: 'break-all' }}>{path}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '100px', 
                        height: '8px', 
                        background: '#e2e8f0', 
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${(count / resp.summary.top_paths[0][1]) * 100}%`, 
                          height: '100%', 
                          background: '#10b981',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Anomalies Section */}
            <section style={{ 
              background: 'white',
              padding: '30px', 
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              gridColumn: '1 / -1'
            }}>
              <h3 style={{ 
                margin: '0 0 20px 0', 
                color: '#333',
                fontSize: '1.3rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🚨 Threat Detection Results
              </h3>
              {resp.anomalies.length === 0 ? (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#10b981',
                  background: '#f0fdf4',
                  borderRadius: '12px',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>No threats detected</div>
                  <div style={{ fontSize: '14px', marginTop: '8px', color: '#059669' }}>
                    Your log file appears to be clean
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {resp.anomalies.map((a: any, i: number) => (
                    <div key={i} style={{ 
                      padding: '20px', 
                      background: '#fef2f2', 
                      borderRadius: '12px',
                      border: '1px solid #fecaca',
                      borderLeft: '4px solid #dc2626'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          color: '#dc2626',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {a.type.replace('_', ' ')}
                        </div>
                        <div style={{ 
                          padding: '4px 8px', 
                          background: '#dc2626', 
                          color: 'white', 
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {(a.confidence * 100).toFixed(0)}% confidence
                        </div>
                      </div>
                      <div style={{ color: '#374151', fontSize: '14px', lineHeight: '1.5' }}>
                        {a.explanation}
                      </div>
                      {a.ip && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                          IP: <span style={{ fontFamily: 'monospace' }}>{a.ip}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Log Preview Table */}
            <section style={{ 
              background: 'white',
              padding: '30px', 
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              gridColumn: '1 / -1'
            }}>
              <h3 style={{ 
                margin: '0 0 20px 0', 
                color: '#333',
                fontSize: '1.3rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📋 Log Preview (First 50 entries)
              </h3>
              <div style={{ 
                overflowX: 'auto',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Timestamp','IP','Method','Path','Status','Bytes'].map(h => (
                        <th key={h} style={{ 
                          textAlign: 'left', 
                          padding: '16px 12px', 
                          fontWeight: '600',
                          color: '#374151',
                          borderBottom: '1px solid #e2e8f0'
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resp.preview.map((r: Row, i: number) => (
                      <tr key={i} style={{ 
                        background: r.__anomalous ? '#fef2f2' : 'transparent',
                        borderBottom: i < resp.preview.length - 1 ? '1px solid #f1f5f9' : 'none'
                      }}>
                        <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
                          {new Date(r.timestamp).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', fontFamily: 'monospace' }}>{r.ip}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontSize: '12px',
                            fontWeight: '600',
                            background: r.method === 'GET' ? '#dbeafe' : r.method === 'POST' ? '#dcfce7' : '#fef3c7',
                            color: r.method === 'GET' ? '#1e40af' : r.method === 'POST' ? '#166534' : '#92400e'
                          }}>
                            {r.method}
                          </span>
                        </td>
                        <td style={{ padding: '12px', wordBreak: 'break-all' }}>{r.path}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontSize: '12px',
                            fontWeight: '600',
                            background: r.status >= 500 ? '#fef2f2' : r.status >= 400 ? '#fef3c7' : '#dcfce7',
                            color: r.status >= 500 ? '#dc2626' : r.status >= 400 ? '#d97706' : '#166534'
                          }}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                          {r.bytes.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
