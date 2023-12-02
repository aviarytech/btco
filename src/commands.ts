import { create, deactivate, update } from "./registration";
import { resolve } from "./resolution";
import { waitForInscription, getPrefix, getAPI } from "./utils"
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
  options = {
    network: 'mainnet',
    feeRate: 1
  }
) => {
  const file = Bun.file(didDocumentFilename);
  let didDocTxt = await file.text();
  let didDoc = await file.json();
  didDocTxt = didDocTxt.replaceAll(didDoc.id, did);
  const {jobId, didState, didRegistrationMetadata, didDocumentMetadata} =
    await create('btco', did, {...options, validateDoc: true}, null, JSON.parse(didDocTxt));
  if (didState.state !== 'wait' || !jobId) {
    throw new Error(`Failed to create DID ${did}`);
  }
  console.log(`Inscription ${jobId} broadcast waiting to be mined...`);
  await waitForInscription(jobId, options);
  console.log(`${did} successfully created!, ${getAPI(options.network)}/sat/${did.split(getPrefix(options))[1]}`);
}

export const updateDID = async (
  did: string,
  didDocumentFilename: any,
  options = {
    network: 'mainnet',
    feeRate: 1
  }
) => {
  const file = Bun.file(didDocumentFilename);
  let didDocTxt = await file.text();
  let didDoc = await file.json();
  didDocTxt = didDocTxt.replaceAll(didDoc.id, did);
  const {jobId, didState, didRegistrationMetadata, didDocumentMetadata} =
    await update(did, {...options, validateDoc: true}, null, ['setDidDocument'], JSON.parse(didDocTxt));
  if (didState.state !== 'wait' || !jobId) {
    throw new Error(`Failed to update DID ${did}`);
  }
  console.log(`Inscription ${jobId} broadcast waiting to be mined...`);
  await waitForInscription(jobId, );
  console.log(`${did} successfully updated!, ${getAPI(options.network)}/sat/${did.split(getPrefix(options))[1]}`);
}

export const deactivateDID = async (
  did: string,
  options = {
    network: 'mainnet',
    feeRate: 1
  }
) => {
  const {jobId, didState, didRegistrationMetadata, didDocumentMetadata} =
    await deactivate(did, {...options}, null);
  if (didState.state !== 'wait' || !jobId) {
    throw new Error(`Failed to deactivate DID ${did}`);
  }
  console.log(`Inscription ${jobId} broadcast waiting to be mined...`);
  await waitForInscription(jobId, options);
  console.log(`${did} successfully deactivated!, ${getAPI(options.network)}/sat/${did.split(getPrefix(options))[1]}`);
}

export const resolveDID = async (did: string, options = {network: 'mainnet'}) => {
  const {didDocument, didDocumentMetadata, didResolutionMetadata} = await resolve(did);
  console.log(await resolve(did))
  console.log(`${didDocumentMetadata.writes} DID writes`);
  if (didDocument) {
    console.log(`${did} successfully resolved!, ${getAPI(options.network)}/sat/${did.split(getPrefix(options))[1]}`);
    console.log(JSON.stringify(didDocument, null, 2));
  } else {
    console.error(`Failed to resolve ${did}`);
    if (didResolutionMetadata.deactivated) {
      console.error(`DID has been deactivated!`);
    }
  }
}