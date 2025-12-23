const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function listProjects() {
  const res = await fetch(`${API_URL}/api/projects`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export default { listProjects }
