import { fetchContent, fetchMetadata, fetchSatAtInscriptionIndexDetails, fetchSatDetails } from "./api"
import { getNetworkFromDID, getPrefix } from "./utils"

export const resolve = async (
  did: string
): Promise<{
  '@context': any,
  didDocument: any,
  didResolutionMetadata: {
    did: string,
    deactivated?: boolean,
    error?: string,
    inscriptionId?: string
  },
  didDocumentMetadata: {
    writes: number
  }
}> => {
  const network = getNetworkFromDID(did);
  const options = {network};
  const prefix = getPrefix(options);
  const sat = did.split(prefix)[1];
  if (sat === null) {
    console.error(`Error resolving ${did}`);
    return {
      "@context": "https://w3id.org/did-resolution/v1",
      didDocument: null,
      didResolutionMetadata: {
        error: `Error resolving ${did}`,
        did
      },
      didDocumentMetadata: {
        writes: 0
      }
    }
  }
  const details = await fetchSatDetails(sat, options);
  const {id} = await fetchSatAtInscriptionIndexDetails(sat, -1, options);
  const content = await fetchContent(id, options)
  if (content === '🔥') {
    return {
      "@context": "https://w3id.org/did-resolution/v1",
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
    did.split(prefix)[1] !== details.num.toString() &&
    did.split(prefix)[1] !== details.name &&
    did.split(prefix)[1] !== details.decimal
  ) {
    error = `DID ${did} has been written on sat (${details.num}, ${details.name}, ${details.decimal})`
  }
  if (error) {
    console.error(error)
    return {
      "@context": "https://w3id.org/did-resolution/v1",
      didDocument: null,
      didResolutionMetadata: {
        error,
        did
      },
      didDocumentMetadata: {
        writes: 0
      }
    }
  }
  return {
    "@context": "https://w3id.org/did-resolution/v1",
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