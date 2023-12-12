import { NetworkType, decodeCborHex, getApi } from "./utils";

export async function fetchSatNumber(output: string, options = {network: 'mainnet'}): Promise<number | null> {
  try {
    const response = await fetch(`${getApi(options.network as NetworkType)}/output/${output}`, {headers: {Accept: 'application/json'}});
    const data = await response.json();
    return data.sat_ranges[0][0];
  } catch (e: any) {
    console.error(e.message);
    return null;
  }
}

export async function fetchSatDetails(sat: number | string, options = {network: 'mainnet'}) {
  try {
    const response = await fetch(`${getApi(options.network as NetworkType)}/sat/${sat}`, {headers: {Accept: 'application/json'}});
    const {number, name, decimal, inscriptions, satpoint} = await response.json();
    return {num: number, name, decimal, inscriptions, satpoint};
  } catch (e: any) {
    console.error(e.message)
    return {};
  }
}


export async function fetchOutputDetails(output: string, options = {network: 'mainnet'}) {
  const url = `${getApi(options.network as NetworkType)}/output/${output}`;
  try {
    const response = await fetch(url, {headers: {Accept: 'application/json'}});
    const {
      value, script_pubkey, address, transaction, inscriptions, sat_ranges, runes
    } = await response.json();
    const sat = await fetchSatDetails(sat_ranges[0][0], options);
    return {value, address, transaction, inscriptions, sat_ranges, sat};
  } catch (e: any) {
    console.error(`Couldn't get output at ${url}`, e.message);
  }
}

export async function fetchSatAtInscriptionIndexDetails(sat: number | string, index: number, options = {network: 'mainnet'}) {
  try {
    const response = await fetch(`${getApi(options.network as NetworkType)}/r/sat/${sat}/at/${index}`, {headers: {Accept: 'application/json'}});
    if (response.status !== 200) {
      console.error(`Couldn't fetch sat ${sat} inscriptions at index ${index}`)
      return null;
    }
    const {id} = await response.json();
    return {id};
  } catch (e: any) {
    console.error(e.message);
    return {id: null};
  }
}

export async function fetchInscription(id: string, options = {network: 'mainnet'}) {
  try {
    const url = `${getApi(options.network as NetworkType)}/inscription/${id}`;
    const response = await fetch(url, {headers: {Accept: 'application/json'}});
    if (response.status != 200 || !id) {
      console.error(`Response status ${response.status} from ${url}`)
      return null;
    }
    const {
      address, children, content_length, content_type, genesis_fee, genesis_height,
      inscription_id, inscription_number, next, output_value, parent, previous, rune,
      sat, satpoint, timestamp
    } = await response.json();
    return {sat, satpoint, inscription_number};
  } catch(e) {
    // console.error(e);
    return null;
  }
}

export async function fetchMetadata(id: string, options = {network: 'mainnet'}) {
  try {
    const response = await fetch(`${getApi(options.network as NetworkType)}/r/metadata/${id}`, {headers: {Accept: 'application/json'}});
    const data = await response.json();
    return decodeCborHex(data);
  } catch(e: any) {
    return null;
  }
}

export async function fetchContent(id: string, options = {network: 'mainnet'}) {
  const response = await fetch(`${getApi(options.network as NetworkType)}/content/${id}`);
  if (response.headers.get('Content-Type')?.includes('text/plain')) {
    return await response.text();
  }
  return null;
}