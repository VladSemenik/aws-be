const { faker } = require('@faker-js/faker')
const fetch = require('node-fetch-commonjs')

const QTT = 10
const API = "https://yfymjxb9wf.execute-api.eu-west-1.amazonaws.com/prod/products"

const fetcher = () => {
    return fetch(API,
        {
            method: "POST",
            body: JSON.stringify({
                title: faker.commerce.product(),
                description: faker.commerce.productDescription(),
                price: faker.commerce.price({ min: 100, max: 200, dec: 0 }),
                stock: faker.number.int(100)
            })
        }
    )
}

(async () => {
    for await (let _ of new Array(QTT).fill(0)) {
        await fetcher()
    }
})()