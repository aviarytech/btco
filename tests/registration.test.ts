import { describe, expect, test, afterEach, beforeAll, afterAll } from "bun:test";

import { create, deactivate, update } from '../src/registration';
import { waitForInscription } from "../src/utils";
import { getBlankSats } from "../src/wallet";
import { resolve } from "../src/resolution";

describe('registration', () => {
  let sat;
  let didDoc: any;
  let latestJobId: string;
  let fees = 0;
  let feeRate = 51;
  let validateDoc = false;
  let fakeMineSeconds = 10;
  let logEverySeconds = 6;

  beforeAll(async () => {
    const sats = await getBlankSats({network: 'regtest'});
    sat = sats[sats.length-1];
    didDoc = await Bun.file('./tests/fixtures/didDoc.json').text();
    didDoc = didDoc.replaceAll('SAT', sat.details.sat.num);
    didDoc = JSON.parse(didDoc);
    console.log(`Running test suite for ${didDoc.id}`)
  });

  afterAll(async () => {
    console.log(`Total fees spent: ${fees} sats`);
  })

  test("1. Create", async () => {
    const reg = await create(
      'btco',
      didDoc.id,
      {network: 'regtest', feeRate, validateDoc},
      null,
      didDoc
    );
    
    expect(reg.jobId?.length).toBe(66);
    expect(reg.jobId?.slice(64)).toBe('i0');
    expect(reg.didState.state).toBe('wait');
    expect(reg.didState.did).toBe(didDoc.id);
    expect(reg.didRegistrationMetadata?.fees).toBeGreaterThan(1);
    expect(reg.didRegistrationMetadata?.inscription.length).toBe(66);
    expect(reg.didRegistrationMetadata?.inscription.slice(64)).toBe('i0');
    expect(reg.didDocumentMetadata.commit.length).toBe(64);
    expect(reg.didDocumentMetadata.reveal.length).toBe(64);
    latestJobId = reg.jobId as string;
    fees += reg.didRegistrationMetadata?.fees ?? 0;

    console.log(`Mining inscription ${latestJobId.slice(0, 16)}...`)
    setTimeout(async () =>{
      Bun.spawnSync(["bitcoin-cli", "-regtest", "generatetoaddress", "1", "bcrt1pxrgctvy8dm5cn69wk3sjscf4zt8z8uvamhdt97pcce9me3lv2fgq9m3p5u"])
    }, fakeMineSeconds * 1000)
    await waitForInscription(latestJobId, {network: 'regtest', logEverySeconds});
    console.log(`...inscription mined!`)

  }, 1000000000000000);

  test("2. Resolve after create", async () => {
    const resolved = await resolve(didDoc.id);
    expect(resolved.didDocument.id).toEqual(didDoc.id);
    expect(resolved.didDocumentMetadata.writes).toEqual(1);
    expect(resolved.didResolutionMetadata.inscriptionId).toEqual(latestJobId);
  });

  test("3. Update", async () => {
    const reg = await update(
      didDoc.id,
      {network: 'regtest', feeRate, validateDoc},
      null,
      ['setDidDocument'],
      didDoc
    );
    expect(reg.jobId?.length).toBe(66);
    expect(reg.jobId?.slice(64)).toBe('i0');
    expect(reg.didState.state).toBe('wait');
    expect(reg.didState.did).toBe(didDoc.id);
    expect(reg.didRegistrationMetadata?.fees).toBeGreaterThan(1);
    expect(reg.didRegistrationMetadata?.inscription.length).toBe(66);
    expect(reg.didRegistrationMetadata?.inscription.slice(64)).toBe('i0');
    expect(reg.didDocumentMetadata.commit.length).toBe(64);
    expect(reg.didDocumentMetadata.reveal.length).toBe(64);
    latestJobId = reg.jobId as string;
    fees += reg.didRegistrationMetadata?.fees ?? 0;

    console.log(`Mining inscription ${latestJobId.slice(0, 16)}...`)
    await waitForInscription(latestJobId, {network: 'regtest', logEverySeconds});
    console.log(`...inscription mined!`)
  }, 1000000000000000);

  test("4. Resolve after update", async () => {
    const resolved = await resolve(didDoc.id);
    expect(resolved.didDocument.id).toEqual(didDoc.id);
    expect(resolved.didDocumentMetadata.writes).toEqual(2);
    expect(resolved.didResolutionMetadata.inscriptionId).toEqual(latestJobId);
  });

  test("5. Deactivate", async () => {
    const reg = await deactivate(
      didDoc.id,
      {network: 'regtest', feeRate},
      null
    );
    expect(reg.jobId?.length).toBe(66);
    expect(reg.jobId?.slice(64)).toBe('i0');
    expect(reg.didState.state).toBe('wait');
    expect(reg.didState.did).toBeNull();
    expect(reg.didRegistrationMetadata?.fees).toBeGreaterThan(1);
    expect(reg.didRegistrationMetadata?.inscription.length).toBe(66);
    expect(reg.didRegistrationMetadata?.inscription.slice(64)).toBe('i0');
    latestJobId = reg.jobId as string;
    fees += reg.didRegistrationMetadata?.fees ?? 0;

    console.log(`Mining inscription ${latestJobId.slice(0, 16)}...`)
    setTimeout(async () =>{
      Bun.spawnSync(["bitcoin-cli", "-regtest", "generatetoaddress", "1", "bcrt1pxrgctvy8dm5cn69wk3sjscf4zt8z8uvamhdt97pcce9me3lv2fgq9m3p5u"])
    }, fakeMineSeconds * 1000)
    await waitForInscription(latestJobId, {network: 'regtest', logEverySeconds});
    console.log(`...inscription mined!`)
  }, 1000000000000000);

  test("6. Resolve after deactivate", async () => {
    const resolved = await resolve(didDoc.id);
    expect(resolved.didDocument).toBeNull();
    expect(resolved.didDocumentMetadata.writes).toEqual(3);
    expect(resolved.didResolutionMetadata.inscriptionId).toEqual(latestJobId);
    expect(resolved.didResolutionMetadata.deactivated).toBeTrue();
  });
})