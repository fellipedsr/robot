const path = require('path')
const os = require('os');
const fs = require('fs');
const knex = require('knex')

const production = fs.existsSync('./.production');
function boot(){
    if (production){
        const prodHomeDir = `${os.homedir()}/trackr-robot`
        if (!fs.existsSync(prodHomeDir)) {
            console.log('creating project home folder')
            fs.mkdirSync(prodHomeDir);
        }
    }
}

const dbName = './robot.db3'
const dbFilePath = path.join(os.homedir(), 'trackr-robot', dbName)
const dbFile = production ? dbFilePath : dbName

const configFileName = './robot.config.json'
const configFilePath = path.join(os.homedir(), 'trackr-robot', configFileName)
const configFile = production ? configFilePath : configFileName

// const updaterFileName = './updater.exe'
// const updaterFilePath = path.join(os.homedir(), 'trackr-robot', updaterFileName)
// const updaterFile = production ? updaterFilePath : updaterFileName

function bootconfig(){
    if (!fs.existsSync(configFile)){
        console.log('creating config file')
        fs.copyFileSync('./db/robot.config.base.json', configFile)
    } else {
        console.log('config file already exists')
    }
}

function bootdb(){
    if (!fs.existsSync(dbFile)){
        console.log('creating db file')
        fs.copyFileSync('./db/base.db3', dbFile)
    } else {
        console.log('db file already exists')
    }
}

// function bootUpdate(){
//     console.log('creating update file')
//     fs.copyFileSync('./db/updater.exe', updaterFile)
// }

boot()
bootdb()
bootconfig()
//bootUpdate()

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: production ? dbFilePath : dbName,
    },
    useNullAsDefault: true,
})

module.exports = db