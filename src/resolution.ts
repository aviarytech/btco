import { fetchContent, fetchMetadata, fetchSatAtIndexDetails, fetchSatDetails } from "./api"

export const resolve = async (
  did: string,
  options = {'network' : 'mainnet'}
): Promise<{
  didDocument: any,
  didResolutionMetadata: {
    did: string,
    deactivated?: boolean,
    error?: string,
    inscriptionId: string
  },
  didDocumentMetadata: {
    writes: number
  }
}> => {
  const sat = did.split('did:btco:')[1];
  const details = await fetchSatDetails(sat, options);
  const {id} = await fetchSatAtIndexDetails(sat, -1, options);
  const content = await fetchContent(id, options)
  if (content === '🔥') {
    return {
      didDocument: null,
      didResolutionMetadata: {
        did,
        deactivated: true,
        inscriptionId: id
      },
      didDocumentMetadata: {
        writes: details.inscriptions.length
      }
    }
  }
  const didDocument = await fetchMetadata(id, options)
  let error: boolean | string = false;
  if (!didDocument) {
    error = 'DID Document not found in metadata';
  } else if (didDocument.id !== content) {
    error = `Metadata ${didDocument.id} does not match inscription content ${content}`;
  } else if (didDocument.id !== did) {
    error = `DID Document id ${didDocument.id} does not match ${did}`;
  } else if (
    did.split('did:btco:')[1] !== details.num.toString() &&
    did.split('did:btco:')[1] !== details.name &&
    did.split('did:btco:')[1] !== details.decimal
  ) {
    error = `DID ${did} has been written on sat (${details.num}, ${details.name}, ${details.decimal})`
  }
  if (error) {
    throw new Error(error);
  }
  return {
    didDocument,
    didResolutionMetadata: {
      inscriptionId: id,
      did
    },
    didDocumentMetadata: {
      writes: details.inscriptions.length
    }
  }
}