import React, { useEffect, useState } from 'react'
import api from '../services/adminApi'

export default function Users(){
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    api.listProjects().then(data => {
      if (mounted) setProjects(data)
    }).catch(err => {
      if (mounted) setError(err.message)
    }).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  return (
    <div>
      <h1>Projects</h1>
      {loading && <p>Loading…</p>}
      {error && <p style={{color:'red'}}>Error: {error}</p>}
      <ul>
        {projects.map(p => <li key={p.id}>{p.name} — {p.address}</li>)}
      </ul>
    </div>
  )
}
