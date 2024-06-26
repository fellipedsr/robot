const knex = require('../db/sqlite');
const { encrypt } = require('./criptografia');
const sendDialog = require('./sendMsg');
const writeLog = require('./writeLog');
const consts = require('../consts')
const moment = require('moment')
const {version} = require('./../package.json');
const { execFile } = require('child_process');
const path = require('path');
const os = require('os');
const url = consts.robotConfig.api_url
const url_socket = consts.robotConfig.socket_url
const url_version = consts.robotConfig.versionURL

const updaterFileName = './updater.exe'
const updaterFilePath = path.join(os.homedir(), 'trackr-robot', updaterFileName)

async function getConfigs() {
    try {
        const [configs] = await knex('CONFIGS')
        return configs
    } catch (error) {
        await writeLog('error', 'configurações', `falha ao ler configurações: ${error.toString()}`)
        return {}
    }
}

async function getStart() {

    try {
        const init = await knex('CONFIGS');
        if (init.length === 0) return false
        // const tokenVersion = init[0].VERSION_TOKEN
        // const request = await fetch(url_version, {
        //     headers: {
        //         'x-tkn': tokenVersion
        //     }
        // })
        // if (!request.ok) {
        //     writeLog('error', 'configurações', `falha na comunicação com o servidor de versão ${request.status}`)
        //     return init
        // }
        // const versionLatest = await request.json()
        
        // if(versionLatest.version !== version){
        //     execFile(updaterFilePath, (error, stdout, stderr) => {
        //         if (error) {
        //             console.log(error)
        //             writeLog('error', 'configurações', `falha ao executar o updater: ${error.toString()}`)
        //             return init;
        //         }
        //         console.log(`stdout: ${stdout}`);
        //         console.error(`stderr: ${stderr}`);
        //     });
        // }

        return init

    } catch (error) {
        console.error(error);
        await writeLog('error', 'configurações', error.toString())
        sendDialog('Error', 'Falha ao consultar banco sqlite', 'error');
        process.exit(1)
    }
}


async function insertStart(TOKEN, PIN) {
  
    if (!TOKEN) {
        await writeLog('error', 'token inválido', 'error');
        return false
    }

    try {
        const request = await fetch(`${url}/store/settings/fetch`, {
            headers: {
                'token': TOKEN
            }
        })

        if (!request.ok) {
            await writeLog('error', 'configurações', `falha na comunicação com o servidor, status da requisição: ${request.status}`)
            return false
        }

        const filial = await request.json()
        LAST_UPDATE = filial.last_update_events?moment(filial.last_update_events).format('YYYY-MM-DD'):null
        const regularString = JSON.parse(Buffer.from(filial.setting, 'base64').toString('utf-8'));
        regularString.TOKEN = encrypt(TOKEN)
        regularString.TRANSPORTER_TOKEN = filial.transporter
        regularString.TRANSPORTER_HOST = filial.transporter_host
        regularString.LAST_UPDATE = LAST_UPDATE

        if (PIN) {
            regularString.PIN = encrypt(PIN)
        }
       
        await knex.transaction(async trx => {

            await trx('CONFIGS')
                .insert(regularString)
                .onConflict('FILIAL')
                .merge(['DB', 'HOST', 'USER', 'PASSWORD', 'INTERVALO', 'INSTANCIA', 'TRANSPORTER_TOKEN', 'TRANSPORTER_HOST','LAST_UPDATE']);

            await trx('QUERYS')
                .insert(filial.queries)
                .onConflict('SERVICE')
                .merge(['QUERY']);
        })

        await writeLog('success', 'configurações', `configurações importadas com sucesso`)
        return true

    } catch (error) {
        console.error(error);
        await writeLog('error', 'configurações', error.toString())
        return false
    }
}


module.exports = { getConfigs, getStart, insertStart, url, url_socket }