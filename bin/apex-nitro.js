#!/usr/bin/env node

const chalk = require('chalk');
const commander = require('commander');
const update = require('update-notifier');

const pkg = require('../package.json');
const apexnitro = require('../lib');

// Close the pool cleanly if Node.js is interrupted
process
	.once('SIGTERM', () => {
		process.exit();
	})
	.once('SIGINT', () => {
		process.exit();
	});

// Print ASCII logo
console.log(chalk.magenta('APEX Nitro'));

// Check for updates once a day
const notifier = update({
	packageName: pkg.name,
	packageVersion: pkg.version
});

if (notifier.update) {
	notifier.notify({
		defer: false,
		message:
			chalk.bold('APEX Nitro') +
			' update available ' +
			chalk.dim(notifier.update.current) +
			chalk.reset(' → ') +
			chalk.green(notifier.update.latest) +
			' \nRun:\n' +
			chalk.cyan.bold('npm install -g apex-nitro')
	});
}

// Register CLI commands
commander.version(pkg.version).description(pkg.description);

// Error on unknown command
commander.on('command:*', () => {
	console.log(chalk.red('Unknown command: ' + commander.args.join(' ')), '\n');
	commander.help();
});

commander
	.command('init')
	.description('Initialize a new APEX Nitro project')
	.action(() => {
		apexnitro.init();
	});

commander
	.command('build')
	.description('Build the source files for APEX to consume')
	.action(() => {
		apexnitro.launch(() => {}, {});
	});

commander
	.command('launch')
	.description('Launch an APEX Nitro project')
	.option('-nm, --nomin', 'Skip building the .min files for production')
	.action(options => {
		apexnitro.launch(undefined, options);
	});

commander
	.command('upload')
	.description('Upload the build to APEX Shared Components')
	.action(() => {
		apexnitro.upload();
	});

commander.parse(process.argv);

if (!process.argv.slice(2).length > 0) {
	commander.help();
}
