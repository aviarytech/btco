import { fetchInscription } from "./api";
import {decode} from 'cbor2';

export const getAPI = (network: string) => {
  if (network === 'mainnet' && Bun.env.ORD_API) {
    return Bun.env.ORD_API;
  } else if (network === 'regtest' && Bun.env.ORD_REGTEST_API) {
    return Bun.env.ORD_REGTEST_API;
  } else if (network === 'signet' && Bun.env.ORD_SIGNET_API) {
    return Bun.env.ORD_SIGNET_API;
  } else if (network === 'testnet' && Bun.env.ORD_TESTNET_API) {
    return Bun.env.ORD_TESTNET_API;
  }
  console.log('test!')
  throw new Error(`API environment variable not found for ${network}`)
}

export const getNetworkFromDID = (did: string) => {
  if (did.startsWith("did:btco:sig:")) {
    return 'signet';
  } else if (did.startsWith("did:btco:reg:")) {
    return 'regtest';
  } else if (did.startsWith("did:btco:test:")) {
    return 'testnet';
  } else {
    return 'mainnet';
  }
}

export const getCommandNetwork = (options: any) => {
  if (options.regtest) {
    return 'regtest';
  } else if (options.signet) {
    return 'signet';
  } else if (options.testnet) {
    return 'testnet';
  }
  return 'mainnet';
}

export const getPrefix = (options = {network: 'mainnet'}) => {
  if (options.network === 'regtest') {
    return 'did:btco:reg:';
  } else if (options.network === 'signet') {
    return 'did:btco:sig:';
  } else if (options.network === 'testnet') {
    return 'did:btco:test:';
  }
  return 'did:btco:';
}

export const waitForInscription = async (inscriptionId: string, options = {network: 'mainnet'}) => {
  let inscription;
  do {
    inscription = await fetchInscription(inscriptionId, options);
    await new Promise(resolve => setTimeout(resolve, 1000));
  } while (!inscription);
  return true;
}

export const lintDidDocument = async (filename: string): Promise<boolean> => {
  const proc = Bun.spawnSync(['cat', filename]);
  if (proc.stderr.toString() !== '') {
    console.error(proc.stderr.toString())
    return false;
  }
  const proc2 = Bun.spawnSync(['./src/prep.sh'], {stdin: proc.stdout});
  if (proc2.stderr.toString() !== '') {
    console.error(proc2.stderr.toString())
    return false;
  }
  const proc3 = Bun.spawnSync(['bunx', 'soya', 'validate', 'Did'], {stdin: proc2.stdout})
  try {
    const output = JSON.parse(proc3.stdout.toString());
    if(output.isValid) {
      return true;
    } else {
      console.error(proc3.stderr.toString());  
    }
  } catch (e) {
    console.error(proc3.stderr.toString());
  }
  return false;
}

export const decodeCborHex = async (hexString: string): Promise<any> => {
  const buffer = Buffer.from(hexString, 'hex');
  return await decode(buffer);
}
