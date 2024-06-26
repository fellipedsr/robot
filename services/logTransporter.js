const knex = require('../db/sqlite');

async function transportLog(log, index){
    try {
        const [configs] = await knex('CONFIGS');
        const _log = { ...log }
        _log['filial'] = configs.FILIAL
        
        await fetch(`${configs.TRANSPORTER_HOST}/${index}/_doc`, {
            method: 'POST',
            body: JSON.stringify(_log),
            headers: {
                'Content-type': 'application/json',
                'Authorization': `Basic ${configs.TRANSPORTER_TOKEN}`
            }
        });
        
    } catch (error) {
        console.log('erro ao transportar log. api talvez offline', error)   
    }
}

module.exports = { transportLog }