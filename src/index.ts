import * as fs from "fs";
import * as yaml from "js-yaml";
import { Command } from "commander";
import { fileURLToPath } from "url";
import path from "path";
import chalk from "chalk";
import figlet from "figlet";
import { createDID, deactivateDID, listBlankSats, listDIDs, resolveDID, updateDID } from "./commands";
import { getCommandNetwork } from "./utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8")
);
const version = packageJson.version;
const program = new Command();

program
  .name("BTCO")
  .version(version)

program
  .command('list')
  .alias('ls')
  .description('List DIDs in wallet')
  .option('-r, --regtest', 'Use regtest network')
  .option('-s, --signet', 'Use signet network')
  .option('-t, --testnet', 'Use testnet network')
  .option('-b, --blank', 'List available DIDs in wallet')
  .action(async (options) => {
    if (options.blank) {
      listBlankSats({network: getCommandNetwork(options)});
    } else {
      listDIDs({network: getCommandNetwork(options)});
    }
  })

program
  .command('create <did> <document>')
  .description('Create a new DID')
  .option('-r, --regtest', 'Use regtest network')
  .option('-s, --signet', 'Use signet network')
  .option('-t, --testnet', 'Use testnet network')
  .option('-l, --lint', 'Lint DID Document')
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
        network: getCommandNetwork(options),
        feeRate: options.feeRate,
        validateDoc: options.lint ?? false
      })
  });

program
  .command('update <did> <document>')
  .description('Update an existing DID')
  .option('-r, --regtest', 'Use regtest network')
  .option('-s, --signet', 'Use signet network')
  .option('-t, --testnet', 'Use testnet network')
  .option('-l, --lint', 'Lint DID Document')
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
        network: getCommandNetwork(options),
        feeRate: options.feeRate,
        validateDoc: options.lint ?? false
      })
  });

program
  .command('deactivate <did>')
  .description('Deactivate a DID')
  .option('-r, --regtest', 'Use regtest network')
  .option('-s, --signet', 'Use signet network')
  .option('-t, --testnet', 'Use testnet network')
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
        network: getCommandNetwork(options),
        feeRate: options.feeRate
      })
  });

program
  .command('resolve <did>')
  .description('Resolve a DID')
  .option('-s, --signet', 'Use signet network')
  .option('-t, --testnet', 'Use testnet network').option('-r, --regtest', 'Use regtest network')
  .action(async (did, options) => {
    console.log(`Resolving DID: ${did}`);
    console.log('Options:', options);
    console.log("-".repeat(53))
    const res = await resolveDID(did, {network: getCommandNetwork(options)})
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
