const opn = require('opn');

var bodyParser = require("body-parser"),
    express = require('express'),
    fs = require('fs'),
    path = require('path'),
    templates = require('../templates/templates'),
    util = require('../util/util'),
    validations = require('../util/validations'),
    portscanner  = require('portscanner'),
    app = express();

// import default config and user config
var userConfig = util.getLocalUserConfig();

function appUse () {
    // support json encoded bodies
    app.use(bodyParser.json());

    // support encoded bodies
    app.use(bodyParser.urlencoded({extended: true}));
};

function appGet (project, config) {
    let configFormHTML = templates.configFormHTML(project, config);
    // get
    app.get('/', function(req, res) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': configFormHTML.length
        });
        res.write(configFormHTML);
        res.end();
    });
};

function appPost (project) {
    app.post('/saveConfig', function(req, res) {
        if (req.body.requestSave != undefined) {
            var themerollerFiles = req.body.themeroller_files.replace(/\r/g, '').split('\n');

            themerollerFiles.forEach(function(element, index) {
                themerollerFiles[index] = ( element ? path.resolve(element) : "");
            });

            // parse the new config based on the form request
            let newConfig = {
                "appURL": req.body.appURL,
                "srcFolder": path.resolve(req.body.srcFolder),
                "distFolder": path.resolve(req.body.distFolder),
                "jsConcat": {
                    "enabled": Boolean(req.body.jsConcat_enabled),
                    "finalName": req.body.jsConcat_finalName
                },
                "cssConcat": {
                    "enabled": Boolean(req.body.cssConcat_enabled),
                    "finalName": req.body.cssConcat_finalName
                },
                "sass": {
                    "enabled": Boolean(req.body.sass_enabled),
                    "includePath": (req.body.sass_includePath ? path.resolve(req.body.sass_includePath) : "")
                },
                "less": {
                    "enabled": Boolean(req.body.less_enabled),
                    "includePath": (req.body.less_includePath ? path.resolve(req.body.less_includePath) : "")
                },
                "browsersync": {
                    "enabled": Boolean(req.body.browsersync_enabled),
                    "notify": Boolean(req.body.browsersync_notify),
                    "ghostMode": Boolean(req.body.browsersync_ghostMode)
                },
                "themeroller":{
                    "enabled": Boolean(req.body.themeroller_enabled),
                    "finalName": req.body.themeroller_finalName,
                    "files" : themerollerFiles
                },
                "header": {
                    "enabled": Boolean(req.body.header_enabled),
                    "packageJsonPath": (req.body.header_packageJsonPath ? path.resolve(req.body.header_packageJsonPath) : "")
                },
                "apex": {
                    "openBuilder": Boolean(req.body.apex_openBuilder)
                },
                "sqlcl": {
                    "path": req.body.sqlcl_path,
                    "connectString": req.body.sqlcl_connectString,
                    "apexVersion": req.body.sqlcl_apexVersion
                }
            };

            // overwritting the current project in the main config object
            userConfig[project] = newConfig;
        } else if (req.body.requestDelete != undefined) {
            delete userConfig[project];
        }

        // ensure that the config.json directory exists
        util.makeDirectoryStructure(util.getLocalUserConfigPath());
        // writing to config.json with the new data
        fs.writeFileSync(util.getLocalUserConfigPath(), JSON.stringify(userConfig, null, 4));

        // display the configSaved page
        let configSavedHTML = templates.configSavedHTML(project);

        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': configSavedHTML.length
        });
        res.write(configSavedHTML);
        res.end();

        // close the express server
        process.exit();
    });

};

// AFEB - config
module.exports = function(args, options, callback, ee) {
    let project = args[0];

    // validates command line syntax
    validations.cliSyntax(project, "afeb config <project>");

    // merge default config with user config
    let config = util.getProjectConfig(project);

    appUse();
    appGet(project, config);
    appPost(project);

    // listen and open
    portscanner.findAPortNotInUse(3000, 3999, '127.0.0.1', function(error, port) {
        app.listen(port, function() {
            opn('http://localhost:' + port);
        });
    });
}
