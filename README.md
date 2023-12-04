![Bitcoin Ordinals DID Method Logo](./btco.jpg)

---

An ALPHA implementation of the `did:btco` [DID](https://www.w3.org/TR/did-core/) method.. **Not Financial Advice**.

### W3C Recommendations

- [DID v1.0](https://www.w3.org/TR/did-core/)

### DIF Work Items

- [Universal Resolver](https://dev.uniresolver.io/)
- [DID Registration](https://identity.foundation/did-registration)
- [DID Lint](https://didlint.ownyourdata.eu/validate)

### W3C-CCG Work Items

- [DID Resolution](https://w3c-ccg.github.io/did-resolution/)


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

`bun run btco list`

Or to view blank and unwritten DIDs

`bun run btco list --blank`

### Create BTCO DID

`bun run btco create <did:btco:51...> ./didDoc.json --fee-rate <feeRate>`

### Update BTCO DID

`bun run btco update <did:btco:51...> ./didDoc.json --fee-rate <feeRate>`

### Deactivate BTCO DID

`bun run btco deactivate <did:btco:51...> --fee-rate <feeRate>`

