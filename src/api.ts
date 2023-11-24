import { decodeCborHex } from "./utils";

export async function fetchSatNumber(output: string): Promise<number> {
  const response = await fetch(`${Bun.env.ORD_API}/output/${output}`, {headers: {Accept: 'application/json'}});
  const data = await response.json();
  return data.sat_ranges[0][0];
}

export async function fetchSatDetails(sat: number | string) {
  const response = await fetch(`${Bun.env.ORD_API}/sat/${sat}`, {headers: {Accept: 'application/json'}});
  const {number, name, decimal, inscriptions, satpoint} = await response.json();
  return {num: number, name, decimal, inscriptions, satpoint};
}

export async function fetchInscription(id: string) {
  const response = await fetch(`${Bun.env.ORD_API}/inscription/${id}`, {headers: {Accept: 'application/json'}});
  if (response.status === 404) {
    return null;
  }
  const {
    address, children, content_length, content_type, genesis_fee, genesis_height,
    inscription_id, inscription_number, next, output_value, parent, previous, rune,
    sat, satpoint, timestamp
  } = await response.json();
  return {satpoint};
}

export async function fetchMetadata(id: string) {
  const response = await fetch(`${Bun.env.ORD_API}/r/metadata/${id}`, {headers: {Accept: 'application/json'}});
  return decodeCborHex(await response.json());
}

export async function fetchContent(id: string) {
  const response = await fetch(`${Bun.env.ORD_API}/content/${id}`);
  if (response.headers.get('Content-Type')?.includes('text/plain')) {
    return await response.text();
  }
  return null;
}