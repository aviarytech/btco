import { fetchInscription, fetchSatDetails, fetchSatNumber } from "./api";
import {decode} from 'cbor2';

export const getSats = async () => {
  const inscriptionCMD = Bun.spawn(["ord", "-r", "wallet", "inscriptions"]);
  const inscriptionsJson = await new Response(inscriptionCMD.stdout).json();
  const inscriptions = inscriptionsJson.map((o: any) => o.location);
  const outputsCMD = Bun.spawn(["ord", "-r", "wallet", "outputs"]);
  const outputsJson = await new Response(outputsCMD.stdout).json();
  let outputs = outputsJson.map((o: any) => o.output).filter(
    (o: string) => !inscriptions.some((i: string) => o.startsWith(i.split(':')[0]))
  );
  const nums = [];
  for (const output of outputs) {
    nums.push(await fetchSatNumber(output));
  }
  const sats = [];
  for (const num of nums) {
    sats.push(await fetchSatDetails(num));
  }
  
  return sats.filter(s => s.satpoint);
}

export const waitForInscription = async (inscriptionId: string) => {
  let inscription;
  do {
    inscription = await fetchInscription(inscriptionId);
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
