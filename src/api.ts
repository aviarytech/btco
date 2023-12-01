import { decodeCborHex, getAPI } from "./utils";

export async function fetchSatNumber(output: string, options = {network: 'mainnet'}): Promise<number | null> {
  try {
    const response = await fetch(`${getAPI(options.network)}/output/${output}`, {headers: {Accept: 'application/json'}});
    const data = await response.json();
    return data.sat_ranges[0][0];
  } catch (e: any) {
    console.error(e.message);
    return null;
  }
}

export async function fetchSatDetails(sat: number | string, options = {network: 'mainnet'}) {
  try {
    const response = await fetch(`${getAPI(options.network)}/sat/${sat}`, {headers: {Accept: 'application/json'}});
    const {number, name, decimal, inscriptions, satpoint} = await response.json();
    return {num: number, name, decimal, inscriptions, satpoint};
  } catch (e: any) {
    console.error(e.message)
    return {};
  }
}


export async function fetchOutputDetails(output: string, options = {network: 'mainnet'}) {
  try {
    const response = await fetch(`${getAPI(options.network)}/output/${output}`, {headers: {Accept: 'application/json'}});
    const {
      value, script_pubkey, address, transaction, inscriptions, sat_ranges, runes
    } = await response.json();
    const sat = await fetchSatDetails(sat_ranges[0][0], options);
    return {value, address, transaction, inscriptions, sat_ranges, sat};
  } catch (e: any) {
    console.error(e.message);
  }
}

export async function fetchSatAtInscriptionIndexDetails(sat: number | string, index: number, options = {network: 'mainnet'}) {
  try {
    const response = await fetch(`${getAPI(options.network)}/r/sat/${sat}/at/${index}`, {headers: {Accept: 'application/json'}});
    const {id} = await response.json();
    return {id};
  } catch (e: any) {
    console.error(e.message);
    return {id: null};
  }
}

export async function fetchInscription(id: string, options = {network: 'mainnet'}) {
  try {
    const response = await fetch(`${getAPI(options.network)}/inscription/${id}`, {headers: {Accept: 'application/json'}});
    if (response.status === 404 || !id) {
      return null;
    }
    const {
      address, children, content_length, content_type, genesis_fee, genesis_height,
      inscription_id, inscription_number, next, output_value, parent, previous, rune,
      sat, satpoint, timestamp
    } = await response.json();
    return {sat, satpoint};
  } catch(e) {
    console.error(e);
    return null;
  }
}

export async function fetchMetadata(id: string, options = {network: 'mainnet'}) {
  try {
    const response = await fetch(`${getAPI(options.network)}/r/metadata/${id}`, {headers: {Accept: 'application/json'}});
    const data = await response.json();
    return decodeCborHex(data);
  } catch(e: any) {
    return null;
  }
}

export async function fetchContent(id: string, options = {network: 'mainnet'}) {
  const response = await fetch(`${getAPI(options.network)}/content/${id}`);
  if (response.headers.get('Content-Type')?.includes('text/plain')) {
    return await response.text();
  }
  return null;
}