const fs = require('fs')
const { app } = require('electron')
const path = require('path')
const fileCurrent = app.getAppPath()
const filePath = path.join(fileCurrent, '../../config.ini')


function createIniFile() {

    const content = `[configuracoes]`;

    if (fs.existsSync(filePath)) return
    fs.writeFileSync(filePath, content.trim());
}

function cleanIniFile() {
    const content = `[configuracoes]`;

    fs.writeFileSync(filePath, content.trim());
}

module.exports = { createIniFile, cleanIniFile }