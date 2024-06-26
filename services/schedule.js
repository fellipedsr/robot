const { CronJob, CronTime } = require('cron')
const { readConfigs } = require('./configsFunction')
const writeLog = require('./writeLog')
const { importSales, clear } = require('./tarefas')

let jobConciliador

const jobIntegracao = {
    setTime: setTimeSchedule,
    create: createSchedule
}

async function createSchedule() {
    let cronTime = await agendamento()

    jobConciliador = new CronJob(cronTime, async () => {
        await importSales()
        await clear('events', true)
        await clear('system', true)
    })
    jobConciliador.start()
}

async function setTimeSchedule() {

    const agendamentoTime = await agendamento()

    if (jobConciliador.running) {
        jobConciliador.stop();
        jobConciliador.setTime(new CronTime(agendamentoTime))
        jobConciliador.start()
    }
    else {
        jobConciliador.setTime(new CronTime(agendamentoTime))
    }
    return
}

async function agendamento() {

    const configuracoes = await readConfigs()
    if (!configuracoes.INTERVALO) return `* * * * *`
    return `*/${configuracoes.INTERVALO} * * * *`

}


module.exports = { jobIntegracao }