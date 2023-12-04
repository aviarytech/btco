import { fetchSatDetails } from "./api";
import { NetworkType, getApi, getCommandNetwork, getPrefix, lintDidDocument } from "./utils";
import { getWalletNetwork } from "./wallet";

export const create = async (
  method = 'btco',
  did: string,
  options = {'network': 'mainnet', feeRate: 1, validateDoc: true},
  secret: null,
  didDocument: any
): Promise<{
  jobId: string | null,
  didState: {state: 'finished' | 'failed' | 'action' | 'wait', did: string | null},
  didRegistrationMetadata: {fees: number, inscription: string} | null,
  didDocumentMetadata: any
}> => {
  if(method !== 'btco') {
    throw new Error(`DID method ${method} not supported.`);
  }
  const sat = did.split(getPrefix(options))[1];
  const filename = `/tmp/${did}`;
  await Bun.write(`${filename}.json`, JSON.stringify(didDocument));
  if (options.validateDoc && !await lintDidDocument(`${filename}.json`)) {
    throw new Error(`DID Document failed validation.`)
  }
  await Bun.write(`${filename}.txt`, did);
  const cmd = [
    "ord",
    getWalletNetwork(options),
    "wallet",
    "inscribe",
    "--fee-rate",
    options.feeRate.toString(),
    "--json-metadata",
    `${filename}.json`,
    "--file",
    `${filename}.txt`,
    "--postage",
    "551sat",
    "--metaprotocol",
    "did:btco",
    "--sat",
    sat
  ]
  const proc = Bun.spawnSync(cmd);
  try {
    const {commit, inscriptions, reveal, total_fees} = JSON.parse(proc.stdout.toString());
    return {
      jobId: inscriptions[0].id,
      didState: {state: 'wait', did},
      didRegistrationMetadata: {fees: total_fees, inscription: inscriptions[0].id},
      didDocumentMetadata: {commit, reveal}
    };
  } catch(e) {
    console.error(proc.stderr.toString());
    return {
      jobId: null,
      didState: {did: null, state: 'failed'},
      didDocumentMetadata: null,
      didRegistrationMetadata: null
    };
  }
}

export const update = async (
  did: string,
  options = {'network': 'mainnet', feeRate: 1, validateDoc: true},
  secret: null,
  didDocumentOperation: ('setDidDocument' | 'addToDidDocument' | 'removeFromDidDocument')[],
  didDocument: any
): Promise<{
  jobId: string | null,
  didState: {state: 'finished' | 'failed' | 'action' | 'wait', did: string | null},
  didRegistrationMetadata: {fees: number, inscription: string} | null,
  didDocumentMetadata: any
}> => {
  const sat = did.split(getPrefix(options))[1];

  const filename = `/tmp/${did}`;
  await Bun.write(`${filename}.json`, JSON.stringify(didDocument));
  if (options.validateDoc && !await lintDidDocument(`${filename}.json`)) {
    throw new Error(`DID Document failed validation.`)
  }
  await Bun.write(`${filename}.txt`, did);
  const cmd = [
    "ord",
    getWalletNetwork(options),
    "wallet",
    "inscribe",
    "--reinscribe",
    "--fee-rate",
    options.feeRate.toString(),
    "--json-metadata",
    `${filename}.json`,
    "--file",
    `${filename}.txt`,
    "--postage",
    "551sat",
    "--metaprotocol",
    "did:btco",
    "--sat",
    sat
  ]
  const proc = Bun.spawnSync(cmd);
  try {
    const {commit, inscriptions, reveal, total_fees} = JSON.parse(proc.stdout.toString());
    return {
      jobId: inscriptions[0].id,
      didState: {state: 'wait', did},
      didRegistrationMetadata: {fees: total_fees, inscription: inscriptions[0].id},
      didDocumentMetadata: {commit, reveal}
    };
  } catch(e) {
    console.error(proc.stderr.toString());
    return {
      jobId: null,
      didState: {did: null, state: 'failed'},
      didDocumentMetadata: null,
      didRegistrationMetadata: null
    }
  }
}

export const deactivate = async (
  did: string,
  options =  {'network': 'mainnet', feeRate: 1},
  secret: any | null
): Promise<{
  jobId: string | null,
  didState: {state: 'finished' | 'failed' | 'action' | 'wait', did: string | null},
  didRegistrationMetadata: {fees: number, inscription: string} | null,
  didDocumentMetadata: any
}> => {
  const sat = did.split(getPrefix(options))[1];

  const filename = `/tmp/${did}`;
  await Bun.write(`${filename}.txt`, '🔥');
  const cmd = [
    "ord",
    getWalletNetwork(options),
    "wallet",
    "inscribe",
    "--reinscribe",
    "--fee-rate",
    options.feeRate.toString(),
    "--file",
    `${filename}.txt`,
    "--postage",
    "551sat",
    "--metaprotocol",
    "did:btco",
    "--sat",
    `${sat}`
  ]
  const proc = Bun.spawnSync(cmd);
  try {
    const {commit, inscriptions, reveal, total_fees} = JSON.parse(proc.stdout.toString());
    return {
      jobId: inscriptions[0].id,
      didState: {state: 'wait', did: null},
      didRegistrationMetadata: {fees: total_fees, inscription: inscriptions[0].id},
      didDocumentMetadata: {commit, reveal}
    };
  } catch(e) {
    console.error(proc.stderr.toString());
    return {
      jobId: null,
      didState: {did: null, state: 'failed'},
      didDocumentMetadata: null,
      didRegistrationMetadata: null
    }
  }
}