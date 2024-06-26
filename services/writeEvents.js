const fs = require('fs')
const { app } = require('electron')
const path = require('path')
const moment = require('moment')
const knex = require('../db/sqlite');
const transporter = require('./logTransporter')
const os = require('os');

const logFileName = './robot-events.log'
const logFilePath = path.join(os.homedir(), 'trackr-robot', logFileName)

async function writeEvents(process, { received, processed, failed, errors }) {
    try {
        const data = moment().format(`YYYY-MM-DD HH:mm:ss`)
        const log = {
            data,
            process,
            received,
            processed,
            failed,
            erros: ''//JSON.stringify(errors)
        }
        //transporter.transportLog(log, 'events')
        await knex('LOGS_EVENTS').insert(log)

    } catch (error) {
        console.log(error)
        fs.writeFile(
            process.env.NODE_ENV == 'production' ? logFilePath : logFileName,
            `[${moment().format('YYYY-MM-DD HH:mm:ss')}] | Falha ao gravar logs de evento ${error.toString()}\r\n`
            , { flag: 'a+' }, (err) => err)
    }
}

module.exports = writeEvents