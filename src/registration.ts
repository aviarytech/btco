import { fetchSatDetails } from "./api";
import { lintDidDocument } from "./utils";

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
  const {satpoint} = await fetchSatDetails(did.split('did:btco:')[1], options);
  const filename = `/tmp/${did}`;
  await Bun.write(`${filename}.json`, JSON.stringify(didDocument));
  if (options.validateDoc && !await lintDidDocument(`${filename}.json`)) {
    throw new Error(`DID Document failed validation.`)
  }
  await Bun.write(`${filename}.txt`, did);
  const cmd = [
    "ord",
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
    "--satpoint",
    satpoint
  ]
  if (options.network === 'regtest') {
    cmd.splice(1, 0, '-r')
  }
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
  const {satpoint} = await fetchSatDetails(did.split('did:btco:')[1], options);

  const filename = `/tmp/${did}`;
  await Bun.write(`${filename}.json`, JSON.stringify(didDocument));
  if (options.validateDoc && !await lintDidDocument(`${filename}.json`)) {
    throw new Error(`DID Document failed validation.`)
  }
  await Bun.write(`${filename}.txt`, did);
  const cmd = [
    "ord",
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
    "--satpoint",
    `${satpoint}`
  ]
  if (options.network === 'regtest') {
    cmd.splice(1, 0, '-r')
  }
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
  const {satpoint} = await fetchSatDetails(did.split('did:btco:')[1], options);

  const filename = `/tmp/${did}`;
  await Bun.write(`${filename}.txt`, '🔥');
  const cmd = [
    "ord",
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
    "--satpoint",
    `${satpoint}`
  ]
  if (options.network === 'regtest') {
    cmd.splice(1, 0, '-r')
  }
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