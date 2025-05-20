const RabbitMQService = require('./rabbitmq-service')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

var report = {}

async function updateReport(products) {
    for(let product of products) {
        if(!product.name) {
            continue
        } else if(!report[product.name]) {
            report[product.name] = 1;
        } else {
            report[product.name]++;
        }
    }
}

async function printReport() {
    for (const [key, value] of Object.entries(report)) {
        console.log(`${key} = ${value} vendas`)
    }
}

async function processMessage(msg) {
    try {
        const data = JSON.parse(msg.content)
        await updateReport(data.products || [])
        await printReport()
    } catch (err) {
        console.error('Erro ao processar mensagem:', err)
    }
}

async function consume() {
    console.log(`INSCRITO COM SUCESSO NA FILA: report`)
    await (await RabbitMQService.getInstance()).consume('report', processMessage)
}

consume()