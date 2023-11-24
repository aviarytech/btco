# BTC Ordinals DIDs

![Bitcoin Ordinals DID Method Logo](./logo.png)


This is an implementation of the did:btco method.

It follows the [DID Registration](https://identity.foundation/did-registration) specification, uses DID

It uses the following options:

* Client-managed secret mode

## Prerequesites

1. [Bun](https://bun.sh)
2. [jq](https://jqlang.github.io/jq/)
3. A bitcoin node
4. An ordinals node with full sat index running as a server
5. Another ordinals node with full sat index to be used as a wallet
6. UTXOs in the ordinals wallet

## Core Methods

The core methods are implemented as follows

```
create(method = 'btco', did = null, options, secret, didDocument) -> jobId, didState, didRegistrationMetadata, didDocumentMetadata

update(did, options, secret, didDocumentOperation, didDocument) -> jobId, didState, didRegistrationMetadata, didDocumentMetadata

deactivate(did, options, secret) -> jobId, didState, didRegistrationMetadata, didDocumentMetadata

resolve(did, options) -> didDocument, didResolutionMetadata, didDocumentMetadata
```

## Utility Methods

A number of utility methods are used to enable the core methods.

```
listAvailable() -> dids[]
```