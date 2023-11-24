import { create, deactivate, update } from "./registration";
import { resolve } from "./resolution";
import { getSats, waitForInscription } from "./utils"

export const listSats = async () => {
  const sats = await getSats();
  sats.forEach((s: {num: number, name: string, decimal: string}) => {
    console.log(`did:btco:${s.name}`.padEnd(25, ' '), ' - ', `did:btco:${s.num}`.padEnd(25, ' '), ' - ', `did:btco:${s.decimal}`);
  })
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
  await waitForInscription(jobId);
  console.log(`${did} successfully created!, ${Bun.env.ORD_API}/sat/${did.split('did:btco:')[1]}`);
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
  await waitForInscription(jobId);
  console.log(`${did} successfully updated!, ${Bun.env.ORD_API}/sat/${did.split('did:btco:')[1]}`);
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
  await waitForInscription(jobId);
  console.log(`${did} successfully deactivated!, ${Bun.env.ORD_API}/sat/${did.split('did:btco:')[1]}`);
}

export const resolveDID = async (did: string, options = {network: 'mainnet'}) => {
  const {didDocument, didDocumentMetadata, didResolutionMetadata} = await resolve(did, options);
  console.log(`${didDocumentMetadata.writes} DID writes`);
  if (didDocument) {
    console.log(`${did} successfully resolved!, ${Bun.env.ORD_API}/sat/${did.split('did:btco:')[1]}`);
    console.log(JSON.stringify(didDocument, null, 2));
  } else {
    console.error(`Failed to resolve ${did}`);
    if (didResolutionMetadata.deactivated) {
      console.error(`DID has been deactivated!`);
    }
  }
}