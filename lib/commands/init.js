const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const BasicModeInitializer = require('../modes/basic');
const ProModeInitializer = require('../modes/pro');

module.exports = function () {
	/* eslint no-unused-vars: ["error", { "caughtErrors": "none" }] */

	try {
		require(path.resolve(process.cwd(), 'apexnitro.config.json'));

		const confirmResetQuestion = [
			{
				type: 'confirm',
				name: 'resetConfig',
				message: 'A configuration file already exists here. Do you want to reset it?',
				default: false
			}
		];
		// Ask if config should be overwritten
		inquirer.prompt(confirmResetQuestion).then(answers => {
			if (answers.resetConfig) {
				initConfig();
			}
		});
	} catch {
		// No config files exists currently
		initConfig();
	}
};

const initConfig = async () => {
	let config = await inquirer.prompt(modeQuestions);

	if (config.mode === 'basic') {
		const basicModeInitializer = new BasicModeInitializer();
		config = await basicModeInitializer.init(config);
		await writeConfig(config);
		await fs.ensureDir(path.resolve(process.cwd(), config.srcFolder));
		await fs.writeFile(
			path.resolve(process.cwd(), config.srcFolder, `${config.appName}.js`), `/**
* @namespace ${config.appName}
**/
var ${config.appName} = ${config.appName} || {};

/**
* @module p1
**/
${config.appName}.p1 = {
	/**
	* @function init
	* @example ${config.appName}.p1.init();
	**/
	init: function () {
		console.log('Hello from page 1');
	}
};

/**
* @module p2
**/
${config.appName}.p2 = {
	/**
	* @function init
	* @example ${config.appName}.p2.init();
	**/
	init: function () {
		console.log('Hello from page 2');
	}
};

$(document).ready(function () {
	var pageId = Number(document.getElementById("pFlowStepId").value);
  if (pageId === 1) ${config.appName}.p1.init();
  if (pageId === 2) ${config.appName}.p2.init();
});`
		);
		await fs.writeFile(
			path.resolve(process.cwd(), config.srcFolder, `${config.appName}.css`), `main {
	background-color: #fff;
}`
		);
	} else if (config.mode === 'pro') {
		const proModeInitializer = new ProModeInitializer();
		await proModeInitializer.init(config);
	} else {
		throw new Error(`Unknown mode "${config.mode}"`);
	}
};

const writeConfig = async function (config) {
	await fs.writeFile(
		path.resolve(process.cwd(), 'apexnitro.config.json'),
		JSON.stringify(config, null, 2)
	);
	console.log(`${path.resolve(process.cwd(), 'apexnitro.config.json')} ${chalk.green('created')}.`);

	await fs.writeFile(
		path.resolve(process.cwd(), 'apexnitro.cred.json'),
		JSON.stringify({
			path: 'sql',
			username: 'your_username',
			password: 'your_password',
			connectionString: 'your_connection_string'
		}
		, null, 2)
	);
	console.log(`${path.resolve(process.cwd(), 'apexnitro.cred.json')} ${chalk.green('created')}.`);

	const file = path.resolve(process.cwd(), '.gitignore');
	const fileExists = await fs.pathExists(file);

	if (fileExists) {
		await fs.appendFile(file, '\napexnitro.cred.json');
		console.log(`${path.resolve(process.cwd(), '.gitignore')} ${chalk.green('updated')}.`);
	} else {
		await fs.writeFile(file, 'apexnitro.cred.json');
		console.log(`${path.resolve(process.cwd(), '.gitignore')} ${chalk.green('created')}.`);
	}
};

const modeQuestions = [
	{
		type: 'list',
		name: 'mode',
		message: 'Pick a mode',
		choices: [
			{
				name: 'Basic (recommended for first time users)',
				value: 'basic'
			},
			{
				name: 'Pro (recommended for the best experience)',
				value: 'pro'
			}
		]
	},
	{
		type: 'list',
		name: 'template',
		message: 'Pick an APEX Nitro Pro template',
		choices: [
			{
				name: 'Default (recommended)',
				value: 'apex-nitro-template-default'
			},
			{
				name: 'Custom Git repository',
				value: 'git'
			}
		],
		when(answers) {
			return answers.mode === 'pro';
		}
	},
	{
		type: 'input',
		name: 'gitUrl',
		message: 'URL of the Git repository',
		validate: input => (input === '' ? 'Required' : true),
		when(answers) {
			return answers.template === 'git';
		}
	}
];
