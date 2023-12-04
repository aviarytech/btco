setTimeout(() => {
  console.log(`mining new block...`);
  const res = Bun.spawnSync(["bitcoin-cli", "-regtest", "generatetoaddress", "1", "bcrt1pxrgctvy8dm5cn69wk3sjscf4zt8z8uvamhdt97pcce9me3lv2fgq9m3p5u"])
  console.log('mined!')
}, parseInt(process.argv[process.argv.length - 1]) * 1000)