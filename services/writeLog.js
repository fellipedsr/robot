const fs = require('fs')
const { app } = require('electron')
const path = require('path')
const os = require('os');
const moment = require('moment')
const knex = require('../db/sqlite');
const transporter = require('./logTransporter')


const logFileName = './robot-system.log'
const logFilePath = path.join(os.homedir(), 'trackr-robot', logFileName)

async function writeLog(type, user, msgn) {
    try {
        const data = moment().format(`YYYY-MM-DD HH:mm:ss`)
        const log = {
            data,
            type,
            processo: user,
            log: msgn
        }
        
        if(!msgn.includes('Logs da tabela')) transporter.transportLog(log, 'system')
        await knex('LOGS_SYSTEM').insert(log)

    } catch (error) {
        console.log(error)
        fs.writeFile(
            process.env.NODE_ENV == 'production' ? logFilePath : logFileName,
            `[${moment().format('YYYY-MM-DD HH:mm:ss')}] | Falha ao gravar logs ${error.toString()}\r\n`
            , { flag: 'a+' }, (err) => err)
    }
}

module.exports = writeLog