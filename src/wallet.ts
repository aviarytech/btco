import { resolve } from "./resolution";
import { fetchInscription, fetchOutputDetails, fetchSatDetails, fetchSatNumber } from "./api";
import { getPrefix } from "./utils";

export const getWalletNetwork = (options: any) => {
  if (options.network === 'regtest') {
    return '-r';
  } else if (options.network === 'signet') {
    return '-s';
  } else if (options.network === 'testnet') {
    return '-t';
  }
  return '';
}

export const getDIDs = async (options = {network: 'mainnet'}) => {
  const inscriptionCMD = Bun.spawn([
    "ord",
    getWalletNetwork(options),
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
        const did = await resolve(`${getPrefix(options)}${sat.sat}`)
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

export const getBlankSats = async (options = {network: 'mainnet'}) => {
  const outputsCMD = Bun.spawn([
    "ord",
    getWalletNetwork(options),
    "wallet",
    "outputs"
  ]);
  let outputs = await new Response(outputsCMD.stdout).json()
  let i = 0;
  for (const output of outputs) {
    outputs[i].details = await fetchOutputDetails(output.output, options);
    i++;
  }
  outputs = outputs.filter(
    (o: {details: {inscriptions: string[]}}) => o.details.inscriptions.length === 0
  );
  return outputs;
}