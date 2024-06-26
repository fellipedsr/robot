const { io } = require('socket.io-client')
const { getConfigs, url_socket } = require('./initializationdb')
const { decrypt } = require('./criptografia')
const writeLog = require('./writeLog')
const { importSales, setConfigs, runQuery } = require('./tarefas')
const { enqueueRequest } = require('./queue')
const sendDialog = require('./sendMsg')
const { getIoInstance } = require('../server/socketServer')

let socket

async function startSocketClient() {
    const { TOKEN, FILIAL } = await getConfigs()
    const instance = getIoInstance()
    const decryptedToken = decrypt(TOKEN)
    
    socket = io(`${url_socket}`, {
        reconnectionDelayMax: 5000,
        auth: {
            token: decryptedToken
        },
        transports: ["websocket"],
        upgrade: false
    })

    let warningConnect = true

    socket.on('connect', () => {
        instance.emit('status',true)
        warningConnect = true
      });

    socket.on('message', message => {
        console.log('Mensagem recebida:', message)
    })

    socket.on('send_events', async message => {
        enqueueRequest(importSales, 'sync-sales', FILIAL, message.channel)
        console.log('Evento recebido:', message)
    })

    socket.on('sync_configs', message => {
        enqueueRequest(setConfigs, 'sync-configs', FILIAL, message.channel)
        console.log('Evento recebido:', message)
    })
    

    socket.on('execute_query', async message => {
        const returnquery = await runQuery(message.conteudo)
        const msgn = { 
            filial: FILIAL, 
            processo: 'execute_query', 
            channel: message.channel,
            msgn: returnquery.msgn,
            status: returnquery.status
        };
        enviarMsgn('return', msgn);
    })

    socket.on('connect_error', async (error) => {
       
        if(warningConnect){
            writeLog('error', 'socket client', `falha ao conectar na api socket client - ${error.message}`)
            warningConnect = false
        }

        instance.emit('status',false)  
    })

}

function enviarMsgn(canal, msgn) {
    socket.emit(canal, msgn)
}

module.exports = { startSocketClient, enviarMsgn }
