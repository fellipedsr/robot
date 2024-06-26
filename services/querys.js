const knex = require('../db/sqlite');

async function querys(nome) {

    const query = (await knex('QUERYS')).find(e => e.SERVICE === nome)
    const newQuery = atob(query.QUERY)
    return newQuery
}

module.exports = querys