const fs = require('fs')
const ini = require('ini')
const path = require('path')
const { app } = require('electron')
const { getConfigs } = require('./initializationdb')

const fileCurrent = app.getAppPath()
const filePath = path.join(fileCurrent, '../../config.ini')

function salvarConfig(dados, section) {
    const currentConfig = readConfigs()
    currentConfig[section] = { ...dados };
    fs.writeFileSync(filePath, ini.stringify(currentConfig));
}


async function readConfigs() {
    const config = await getConfigs()
    return config
}


 function readConfigsInitial() {
    const currentConfig = ini.parse(fs.readFileSync(filePath, 'utf-8'));
     return currentConfig
 }
module.exports = { readConfigs, salvarConfig, readConfigsInitial }