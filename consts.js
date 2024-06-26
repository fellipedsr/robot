const fs = require('fs');
const os = require('os');
const path = require('path')
const production = fs.existsSync('./.production');

const configFileName = './robot.config.json'
const configFilePath = path.join(os.homedir(), 'trackr-robot', configFileName)
const robotConfig = require(production ? configFilePath : configFileName)

module.exports = {
    robotConfig: robotConfig
}