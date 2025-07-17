// utils/api.js ou directement dans ta page
export async function fetchAPI(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erreur réseau (${res.status})`);
  const data = await res.json();
  // Si ta backend renvoie une pagination DRF { results: [...] }, on retourne results
  return data.results ? data.results : data;
}
