import { fetchInscription, fetchSatDetails, fetchSatNumber } from "./api";
import {decode} from 'cbor2';
import { resolve } from "./resolution";

export const getDIDs = async (options = {network: 'mainnet'}) => {
  const inscriptionCMD = Bun.spawn([
    "ord",
    options.network === 'regtest' ? "-r" : "",
    "wallet",
    "inscriptions"
  ]);
  const inscriptionsJson = await new Response(inscriptionCMD.stdout).json();
  const inscriptions = inscriptionsJson.map((o: any) => o.inscription);
  const dids = [];
  for (const inscription of inscriptions) {
    const sat = await fetchInscription(inscription, options);
    if (sat) {
      try {
        const did = await resolve(`did:btco:${sat.sat}`, options)
        if (did) {
          dids.push(did);
        }
      } catch(e) {
        // Do nothing
      }
    }
  }
  return dids;
}

export const getSats = async (options = {network: 'mainnet'}) => {
  const inscriptionCMD = Bun.spawn([
    "ord",
    options.network === 'regtest' ? "-r" : "",
    "wallet",
    "inscriptions"
  ]);
  const inscriptionsJson = await new Response(inscriptionCMD.stdout).json();
  const inscriptions = inscriptionsJson.map((o: any) => o.location);
  const outputsCMD = Bun.spawn([
    "ord",
    options.network === 'regtest' ? "-r" : "",
    "wallet",
    "outputs"
  ]);
  const outputsJson = await new Response(outputsCMD.stdout).json();
  let outputs = outputsJson.map((o: any) => o.output).filter(
    (o: string) => !inscriptions.some((i: string) => o.startsWith(i.split(':')[0]))
  );
  const nums = [];
  for (const output of outputs) {
    nums.push(await fetchSatNumber(output, options));
  }
  const sats = [];
  for (const num of nums) {
    sats.push(await fetchSatDetails(num, options));
  }
  
  return sats.filter(s => s.satpoint);
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
