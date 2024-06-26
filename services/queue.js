const writeLog = require("./writeLog");

const requestQueue = [];
let isProcessing = false;

async function processQueue() {
    if (isProcessing) return;

    const { enviarMsgn } = require("./receiveactio");
    isProcessing = true;

    while (requestQueue.length > 0) {
        const { promisse, processo, FILIAL, channel } = requestQueue.shift();
        const msgn = { filial: FILIAL, processo, channel };
        try {
            const result = await promisse()
            await new Promise(resolve=>setTimeout(resolve,3000))
            msgn.msgn = result ? 'Processado com sucesso' : 'Falha no envio, favor verificar logs no sistema da loja';
            msgn.status = result ? 'success' : 'error';
        } catch (error) {
            msgn.msgn = error.toString();
            msgn.status = 'error';
            await writeLog('erro', 'queue', error.toString());
            console.log(error);
        }

        enviarMsgn('return', msgn);
    }

    isProcessing = false;
}

function enqueueRequest(promisse, processo, FILIAL, channel) {
    requestQueue.push({ promisse, processo, FILIAL, channel });
    processQueue();
}

module.exports = { enqueueRequest };
