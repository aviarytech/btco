import { describe, expect, test, beforeAll } from "bun:test";

import { waitForInscription } from "../src/utils";
import { fetchMetadata } from "../src/api";
const didDoc = await Bun.file('./tests/fixtures/didDoc.json').json();

describe('api', () => {
  let inscriptionId: string;

  beforeAll(async () => {
    const filename = `/tmp/temp`;
    await Bun.write(`${filename}.txt`, 'test');
    const cmd = [
      "ord",
      "-r",
      "wallet",
      "inscribe",
      "--fee-rate",
      "1",
      "--json-metadata",
      "./tests/fixtures/didDoc.json",
      "--file",
      `${filename}.txt`,
    ]
    const proc = Bun.spawnSync(cmd);
    const {inscriptions} = JSON.parse(proc.stdout.toString());
    inscriptionId = inscriptions[0].id;

    console.log(`mining inscription...`)
    Bun.spawnSync(["bitcoin-cli", "-regtest", "generatetoaddress", "1", "bcrt1pxrgctvy8dm5cn69wk3sjscf4zt8z8uvamhdt97pcce9me3lv2fgq9m3p5u"])
    await waitForInscription(inscriptionId, {network: 'regtest'});
    console.log(`...inscription mined!`)
  })

  test('metadata', async () => {
    const meta = await fetchMetadata(inscriptionId, {network: 'regtest'})
    expect(meta).toBeTruthy();
    expect(meta.id).toEqual(didDoc.id);
  })
})