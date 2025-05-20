const RabbitMQService = require('./rabbitmq-service')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

var report = {}

async function updateReport(products) {
    for (let product of products) {
        if (!product.name) {
            continue
        } else if (!report[product.name]) {
            report[product.name] = 1
        } else {
            report[product.name]++
        }
    }
}

async function printReport() {
    for (const [key, value] of Object.entries(report)) {
        console.log(`${key} = ${value} vendas`)
    }
}

async function auxiliarConsumeFila(msg) {
    const deliveryInfo = JSON.parse(msg.content.toString())

    if (deliveryInfo.products) {
        await updateReport(deliveryInfo.products)
        await printReport()
    } else {
        console.log('⚠ Mensagem sem produtos.')
    }
}

async function consume() {
    console.log(`Inscrição feita corretamente na fila: report`)
    const rabbit = await RabbitMQService.getInstance()
    await rabbit.consume('report', auxiliarConsumeFila)
}

consume()
