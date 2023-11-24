import { fetchContent, fetchInscription, fetchMetadata, fetchSatDetails } from "./api"

export const resolve = async (
  did: string,
  options = {'network' : 'mainnet'}
): Promise<{
  didDocument: any,
  didResolutionMetadata: any,
  didDocumentMetadata: any
}> => {
  const sat = await fetchSatDetails(did.split('did:btco:')[1]);
  const inscriptionId = sat.inscriptions[sat.inscriptions.length - 1];
  const content = await fetchContent(inscriptionId)
  if (content === '🔥') {
    return {
      didDocument: null,
      didResolutionMetadata: {
        deactivated: true,
        inscriptionId
      },
      didDocumentMetadata: {
        writes: sat.inscriptions.length
      }
    }
  }
  const didDocument = await fetchMetadata(inscriptionId)
  if (didDocument.id !== content) {
    throw new Error(`Metadata ${didDocument.id} does not match inscription content ${content}`);
  }
  return {
    didDocument,
    didResolutionMetadata: {
      inscriptionId
    },
    didDocumentMetadata: {
      writes: sat.inscriptions.length
    }
  }
}