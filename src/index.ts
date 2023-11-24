import * as fs from "fs";
import * as yaml from "js-yaml";
import { Command } from "commander";
import { fileURLToPath } from "url";
import path from "path";
import chalk from "chalk";
import figlet from "figlet";
import { createDID, deactivateDID, listSats, resolveDID, updateDID } from "./commands";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8")
);
const version = packageJson.version;
const program = new Command();

program
  .name("BTC Ordinal DIDs")
  .version(version)

program
  .command('list')
  .alias('ls')
  .description('List all available DIDs in wallet')
  .action(listSats)

program
  .command('create <did> <document>')
  .description('Create a new DID')
  .option('-r, --regtest', 'Use regtest network')
  .option('--fee-rate <feeRate>', 'Inscription fee rate')
  .action(async (did, document, options) => {
    if (!options.feeRate) {
      console.error(`Error: Missing required option --fee-rate`);
      return;
    }
    console.log(`Creating DID: ${did}`);
    console.log(`Document from: ${document}`);
    console.log('Options:', options);
    console.log("-".repeat(53))
    const result = await createDID(
      did,
      document,
      {
        network: options.regtest ? 'regtest' : 'mainnet',
        feeRate: options.feeRate
      })
  });

program
  .command('update <did> <document>')
  .description('Update an existing DID')
  .option('-r, --regtest', 'Use regtest network')
  .option('--fee-rate <feeRate>', 'Inscription fee rate')
  .action(async (did, document, options) => {
    if (!options.feeRate) {
      console.error(`Error: Missing required option --fee-rate`);
      return;
    }
    console.log(`Updating DID: ${did}`);
    console.log(`Document from: ${document}`);
    console.log('Options:', options);
    console.log("-".repeat(53))
    const result = await updateDID(
      did,
      document,
      {
        network: options.regtest ? 'regtest' : 'mainnet',
        feeRate: options.feeRate
      })
  });

program
  .command('deactivate <did>')
  .description('Deactivate a DID')
  .option('-r, --regtest', 'Use regtest network')
  .option('--fee-rate <feeRate>', 'Inscription fee rate')
  .action(async (did, options) => {
    if (!options.feeRate) {
      console.error(`Error: Missing required option --fee-rate`);
      return;
    }
    console.log(`Deactivating DID: ${did}`);
    console.log('Options:', options);
    console.log("-".repeat(53))
    const result = await deactivateDID(
      did,
      {
        network: options.regtest ? 'regtest' : 'mainnet',
        feeRate: options.feeRate
      })
  });

program
  .command('resolve <did>')
  .description('Resolve a DID')
  .option('-r, --regtest', 'Use regtest network')
  .action(async (did, options) => {
    console.log(`Resolving DID: ${did}`);
    console.log('Options:', options);
    console.log("-".repeat(53))
    const res = await resolveDID(did, {network: options.regtest ? 'regtest' : 'mainnet'})
  });
  
  const main = async (): Promise<void> => {
    var options = program.opts();
    if (program.args[0]) {
    options.input = program.args[0];
  }

  console.log(
    chalk.green(figlet.textSync("did:btco", { horizontalLayout: "full" }))
  );
  console.log(
    chalk.yellow(figlet.textSync(version, { horizontalLayout: "full" }))
  );

  if (options.config) {
    try {
      const config = yaml.load(
        fs.readFileSync(path.resolve(options.config), "utf8")
      ) as yaml.Schema;

      // Merge config options with command line options
      options = { ...config, ...options };
    } catch (err) {
      console.error(
        `E011 Failed to read or parse the config file '${options.config}':`,
        err
      );
      process.exit(1);
    }
  }

  program.parse(process.argv);
};

main();
