const amqp = require('amqplib')

class RabbitMQ {
    constructor() {
        this.url = `amqp://${process.env.RABBITMQ_LOGIN}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}${process.env.RABBITMQ_VHOST}`
        this.connection = null
        this.channel = null
    }

    async connect() {
        if (!this.connection) this.connection = await amqp.connect(this.url)
        if (!this.channel) this.channel = await this.connection.createChannel()
        this.channel.prefetch(1)
    }

    async consume(queue, callback) {
        if (!this.channel) throw new Error('Canal não inicializado')
        await this.channel.assertQueue(queue, { durable: true, arguments: { 'x-queue-mode': 'lazy' } })
        await this.channel.consume(queue, (msg) => {
            if (msg !== null) {
                callback(msg)
                this.channel.ack(msg)
            }
        })
    }
}

class RabbitMQService {
    static async getInstance() {
        if (!RabbitMQService.instance) {
            const instance = new RabbitMQ()
            await instance.connect()
            RabbitMQService.instance = instance
        }
        return RabbitMQService.instance
    }
}

module.exports = RabbitMQService
