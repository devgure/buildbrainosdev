import axios from 'axios';

const api = axios.create({ baseURL: process.env.API_URL || 'http://localhost:4000/api' });

export async function listProjects() {
  const r = await api.get('/projects');
  return r.data;
}

export default api;
const API_URL = process.env.REACT_NATIVE_API_URL || 'http://localhost:4000';

export async function listProjects() {
  const res = await fetch(`${API_URL}/api/projects`);
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json();
}

export async function createProject(project: { name: string; address?: string }) {
  const res = await fetch(`${API_URL}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json();
}

export async function createPaymentIntent(amount = 1000) {
  const res = await fetch(`${API_URL}/create-payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json();
}

export default { API_URL, listProjects, createProject, createPaymentIntent };
