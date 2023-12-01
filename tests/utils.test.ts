import { describe, expect, test } from "bun:test";

import { decodeCborHex, lintDidDocument } from "../src/utils";
import { getBlankSats } from "../src/wallet";
const didDoc = await Bun.file('./tests/fixtures/didDoc.json').json();

describe('utils', () => {

  test('list sats', async () => {
    const sats = await getBlankSats({network: 'regtest'});
    expect(sats.length).toBeGreaterThan(1);
  })

  test('lint did document (valid)', async () => {
    const valid = await lintDidDocument('./tests/fixtures/didDoc.json')
    expect(valid).toBeTrue();
  }, 10000)

  test('lint did document (invalid)', async () => {
    const valid = await lintDidDocument('./tests/fixtures/invalidDidDoc.json')
    expect(valid).toBeFalse();
  })

  test('cbor hex to json', async () => {
    const result = await decodeCborHex('a56840636f6e7465787482781c68747470733a2f2f7777772e77332e6f72672f6e732f6469642f7631783068747470733a2f2f773369642e6f72672f73656375726974792f7375697465732f656432353531392d323032302f7631626964746469643a6274636f3a686f6a7872676c6875777a72766572696669636174696f6e4d6574686f6481a4626964766469643a6274636f3a686f6a7872676c6875777a23306474797065781a45643235353139566572696669636174696f6e4b6579323032306a636f6e74726f6c6c6572746469643a6274636f3a686f6a7872676c6875777a727075626c69634b65794d756c74696261736578307a364d6b74546d4251575636466d485a79667653563775625131554350674c463656516b526765474278374e527a43506e61757468656e7469636174696f6e81766469643a6274636f3a686f6a7872676c6875777a23306f617373657274696f6e4d6574686f6481766469643a6274636f3a686f6a7872676c6875777a2330')
    expect(typeof result).toEqual('object');
  })
})