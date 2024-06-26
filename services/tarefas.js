const moment = require('moment');
const writeLog = require('./writeLog');
const knexConnect = require('knex');
const connect = require('../db/configs');
const { getIoInstance } = require('../server/socketServer');
const { getConfigs, insertStart, url } = require('./initializationdb');
const writeEvents = require('./writeEvents');
const querys = require('./querys');
const knexSQLITE = require('../db/sqlite');
const { decrypt } = require('./criptografia');


async function setConfigs() {
    const { jobIntegracao } = require('./schedule');
    try {
        const { TOKEN } = await getConfigs()
        const instance = getIoInstance()
        const inse = await insertStart(decrypt(TOKEN))

        if (!inse) return false

        const configs = await getConfigs()
        await jobIntegracao.setTime()
        instance.emit('teste', configs)
        return true

    } catch (error) {
        await writeLog('error', 'configurações', error.toString())
        return false
    }
}


async function importSales() {

    const instance = getIoInstance()

    try {

        const { TOKEN, LAST_UPDATE } = await getConfigs()
        const knex = await _getKnexInstance()
        const query = await querys('default')

        const vendasSQL =  knex.raw(query, {
            LAST_UPDATE: LAST_UPDATE ? `${LAST_UPDATE}` : '20010101',
            START: '20240501',
        })
        const vendas = await vendasSQL
        await knex.destroy()

        const batchsize = 4000
        let index = 0
        let valid = true

        while (valid) {

            const newBody = vendas.slice(index, index + batchsize)

            const request = await fetch(`${url}/events/send`, {
                method: 'POST',
                headers: {
                    'token': decrypt(TOKEN),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newBody)
            })

            index = index + batchsize

            if (newBody.length === 0)  valid = false
            
            if (!request.ok) {
                await writeLog('error', 'vendas envio', `Falha no envio das vendas status retorno: ${request.status}`)
                return false
            }
     
            const { events } = await request.json()
            await writeEvents('Vendas', events)

        }

        await knexSQLITE('CONFIGS').update({ LAST_UPDATE: moment().format('YYYY-MM-DD HH:mm') })
        await writeLog('success', 'vendas envio', `${vendas.length} vendas importadas com sucesso`)
        instance.emit('update', moment().format('YYYY-MM-DD HH:mm'))
   
        return true

    } catch (error) {
        console.log(error)
        let errorMsn =  validaError(error)
        await writeLog('error', 'vendas envio', errorMsn)
    }

}


async function getLogs(type) {

    const table = type === 'events' ? 'LOGS_EVENTS' : 'LOGS_SYSTEM'
    try {
        const logs = await knexSQLITE(table)
        return logs

    } catch (error) {
        let errorMsn =  validaError(error)
        await writeLog('error', 'logs', errorMsn)
        return false
    }
}


async function clear(type, codition) {
    const table = type === 'events' ? 'LOGS_EVENTS' : 'LOGS_SYSTEM'
    const dataDelete = moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm')
    try {

        let query = knexSQLITE(table).del()
        if (codition) query.where('DATA', '<', dataDelete)
        await query
        await writeLog('success', 'logs', `Logs da tabela ${table} ${codition ? 'mais antigos que 7 dias' : ''} excluidos`)
        return true

    } catch (error) {
        let errorMsn =  validaError(error)
        await writeLog('error', 'logs', errorMsn)
        return false
    }
}

async function runQuery(query64){
    try {
        const query = atob(query64)
        const knex = await _getKnexInstance()
        await knex.raw(query)
        return {status: 'success', msgn: 'query executada com sucesso' }

    } catch (error) {
        let errorMsn =  validaError(error)
        return {status: 'error', msgn: errorMsn }
    }
   
}

async function validatapin(pinRec) {

    try {
        const { PIN } = await getConfigs()
        return decrypt(PIN) === pinRec

    } catch (error) {
        await writeLog('error', 'logs', error.toString())
        return false
    }
}

async function _getKnexInstance() {
    const conexao = await connect()
    if (!conexao) {
        await writeLog('erro', 'sistema', 'falha ao conectar com o banco de dados, verifique os acessos')
        return false
    }
    const knex = knexConnect(conexao);
    return knex
}

function validaError(error) {
    if (error.code === 'ETIMEOUT') return 'Timeout. Falha ao se conectar com o banco de dados'
    if (error.code === 'ELOGIN') return 'Usuário ou senha de conexão com o banco inválidos'
    return error.toString()
}

module.exports = {
    setConfigs,
    importSales,
    getLogs,
    clear,
    validatapin,
    runQuery
}


