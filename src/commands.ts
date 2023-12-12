import { create, deactivate, update } from "./registration";
import { resolve } from "./resolution";
import { waitForInscription, getPrefix, getApi, NetworkType, getNetworkFromDID } from "./utils"
import { getBlankSats, getDIDs } from './wallet';

export const listBlankSats = async (options = {network: 'mainnet'}) => {
  const sats = await getBlankSats(options);
  if (sats.length > 0) {
    console.log(`DIDs available:`);
    console.log('')
  }
  sats.forEach((s: {details: {sat: {num: number, name: string, decimal: string}}}) => {
    console.log(
      `${getPrefix(options)}${s.details.sat.name}`.padEnd(25, ' '), ' - ',
      `${getPrefix(options)}${s.details.sat.num}`.padEnd(25, ' '), ' - ',
      `${getPrefix(options)}${s.details.sat.decimal}`
    );
  })
  if (sats.length === 0) {
    console.log('No sats found');
  }
}

export const listDIDs = async (options = {network: 'mainnet'}) => {
  const dids = await getDIDs(options);
  dids.forEach((d: any) => {
    console.log(`${d.didResolutionMetadata.deactivated ? '🔥' : '✅'} -  ${d.didResolutionMetadata.did.padEnd(25, ' ')} - ${d.didDocumentMetadata.writes} writes`)
  })
  if (dids.length === 0) {
    console.log(`No DIDs found.`);
  }
}

export const createDID = async (
  did: string,
  didDocumentFilename: any,
  options: {network: NetworkType, feeRate: number, validateDoc: boolean} = {
    network: 'mainnet',
    feeRate: 1,
    validateDoc: true
  }
) => {
  const file = Bun.file(didDocumentFilename);
  let didDocTxt = await file.text();
  let didDoc = await file.json();
  didDocTxt = didDocTxt.replaceAll(didDoc.id, did);
  const {jobId, didState, didRegistrationMetadata, didDocumentMetadata} =
    await create('btco', did, options, null, JSON.parse(didDocTxt));
  if (didState.state !== 'wait' || !jobId) {
    throw new Error(`Failed to create DID ${did}`);
  }
  console.log(`Inscription ${getApi(options.network as NetworkType)}/${jobId} broadcast waiting to be mined...`);
  await waitForInscription(jobId, {...options, logEverySeconds: 8});
  console.log(`${did} successfully created!, ${getApi(options.network as NetworkType)}/sat/${did.split(getPrefix(options))[1]}`);
}

export const updateDID = async (
  did: string,
  didDocumentFilename: any,
  options: {network: NetworkType, feeRate: number, validateDoc: boolean} = {
    network: 'mainnet',
    feeRate: 1,
    validateDoc: true
  }
) => {
  const file = Bun.file(didDocumentFilename);
  let didDocTxt = await file.text();
  let didDoc = await file.json();
  didDocTxt = didDocTxt.replaceAll(didDoc.id, did);
  const {jobId, didState, didRegistrationMetadata, didDocumentMetadata} =
    await update(did, options, null, ['setDidDocument'], JSON.parse(didDocTxt));
  if (didState.state !== 'wait' || !jobId) {
    throw new Error(`Failed to update DID ${did}`);
  }
  console.log(`Inscription ${getApi(options.network as NetworkType)}/${jobId} broadcast waiting to be mined...`);
  await waitForInscription(jobId,  {...options, logEverySeconds: 8});
  console.log(`${did} successfully updated!, ${getApi(options.network as NetworkType)}/sat/${did.split(getPrefix(options))[1]}`);
}

export const deactivateDID = async (
  did: string,
  options: {network: NetworkType, feeRate: number} = {
    network: 'mainnet',
    feeRate: 1
  }
) => {
  const {jobId, didState, didRegistrationMetadata, didDocumentMetadata} =
    await deactivate(did, {...options}, null);
  if (didState.state !== 'wait' || !jobId) {
    throw new Error(`Failed to deactivate DID ${did}`);
  }
  console.log(`TX ${didDocumentMetadata?.reveal}`);
  console.log(`Inscription ${getApi(options.network as NetworkType)}/${jobId} broadcast waiting to be mined...`);
  await waitForInscription(jobId,  {...options, logEverySeconds: 8});
  console.log(`${did} successfully deactivated!, ${getApi(options.network as NetworkType)}/sat/${did.split(getPrefix(options))[1]}`);
}

export const resolveDID = async (did: string, options = {network: 'mainnet'}) => {
  const {didDocument, didDocumentMetadata, didResolutionMetadata} = await resolve(did);
  console.log(`${didDocumentMetadata.writes} DID writes`);
  options.network = getNetworkFromDID(did);
  if (didDocument) {
    console.log(did.split(getPrefix(options))[1])
    console.log(`${did} successfully resolved!, ${getApi(options.network as NetworkType)}/sat/${did.split(getPrefix(options))[1]}`);
    console.log(JSON.stringify(didDocument, null, 2));
  } else {
    console.error(`Failed to resolve ${did}`);
    if (didResolutionMetadata.deactivated) {
      console.error(`DID has been deactivated!`);
    }
  }
}