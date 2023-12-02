# BTC Ordinals DIDs

![Bitcoin Ordinals DID Method Logo](./btco.jpg)


This is an implementation of the did:btco method.

It follows the [DID Registration](https://identity.foundation/did-registration) specification, uses DID

It uses the following options:

* Client-managed secret mode

## Prerequisites

1. [Bun](https://bun.sh)
2. [jq](https://jqlang.github.io/jq/)
3. A bitcoin node
4. An ordinals node with full sat index running as a server
5. Another ordinals node with full sat index to be used as a wallet
6. UTXOs in the ordinals wallet

## Installing

```
git clone https://github.com/aviarytech/btco.git
cd btco && bun install
```

## Setup

Export API variables of interest

```
export ORD_API=https://ordinals.com
export ORD_SIGNET_API=https://signet.ordinals.com
export ORD_REGTEST_API=http://localhost:8080
```

## Getting Started

This is still EXTREMELY alpha software. It is strongly recommend to get started on BTC test networks such as a
local `regtest (-r)` or a broader network like `signet (-s)` before commit to spending valuable outputs.

## List DIDS

View DIDS in wallet

`bun run btco list`

View blank and unwritten DIDs

`bun run btco list --blank`

### Create BTCO DID

`bun run btco create`

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