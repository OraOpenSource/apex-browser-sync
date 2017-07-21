'use strict';

const path = require('path');

module.exports = {
	// Validates command line synta
	cliProjectSyntax(project, syntax) {
		if (typeof project === 'undefined') {
			throw new TypeError(`\nThe correct syntax is: ${syntax}`);
		}
	},

	// Validates missing project header package.json path
	header(config) {
		if (config.header && config.header.enabled) {
			try {
				require(path.resolve(config.header.packageJsonPath));
			} catch (err) {
				throw new Error(`Your project's package.json path is invalid.`);
			}
		}
	},

	// Validates missing project header package.json path
	publish(config) {
		if (!config.sqlcl || !config.sqlcl.path || !config.sqlcl.username || !config.sqlcl.host || !config.sqlcl.port || !config.sqlcl.sid) {
			throw new Error(`Your project configuration is missing SQLcl connection information.`);
		}
	}
};
