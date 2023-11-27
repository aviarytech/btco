import { fetchContent, fetchInscription, fetchMetadata, fetchSatAtIndexDetails, fetchSatDetails } from "./api"

export const resolve = async (
  did: string,
  options = {'network' : 'mainnet'}
): Promise<{
  didDocument: any,
  didResolutionMetadata: any,
  didDocumentMetadata: any
}> => {
  const sat = did.split('did:btco:')[1];
  const details = await fetchSatDetails(sat);
  const {id} = await fetchSatAtIndexDetails(sat, -1);
  const content = await fetchContent(id)
  if (content === '🔥') {
    return {
      didDocument: null,
      didResolutionMetadata: {
        deactivated: true,
        inscriptionId: id
      },
      didDocumentMetadata: {
        writes: details.inscriptions.length
      }
    }
  }
  const didDocument = await fetchMetadata(id)
  if (didDocument.id !== content) {
    throw new Error(`Metadata ${didDocument.id} does not match inscription content ${content}`);
  }
  return {
    didDocument,
    didResolutionMetadata: {
      inscriptionId: id
    },
    didDocumentMetadata: {
      writes: details.inscriptions.length
    }
  }
}