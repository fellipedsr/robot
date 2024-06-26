const { readConfigs } = require('../services/configsFunction')
const writeLog = require('../services/writeLog')
const EncryptRsa = require('encrypt-rsa').default

async function connect() {
    try {
        const database = await readConfigs()
        const ersa = new EncryptRsa();

        const pass = ersa.decryptStringWithRsaPrivateKey({
            text: database.PASSWORD,
            privateKey: privateKey
        })

        const dec_settings = atob(pass)

        const configs = {
            client: 'mssql',
            connection: {
                host: database.HOST,
                database: database.DB,
                user: database.USER,
                password: dec_settings,
            },
            pool: {
                min: 2,
                max: 10
            }
        }

        if (database.INSTANCIA) {
            configs.connection.options = {
                instanceName: database.INSTANCIA,
            }
        }

        return configs
    } catch (e) {
        console.log(e)
        writeLog('erro', 'sistema', `falha ao coletar informações ${e}`)

        return false
    }
}

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIICYQIBAAKBgQDeWepNNGFZEdTexymK8LfJX5K6U+mJGFWP7vP+uCJ+AxOOJCxm
feB8LZPGo4AOyCH+agyDS6UJ9arcTybtvYbB8pguPJQ0Wgs6xPzxnwT1tGTivbra
nvERXjz5qIIi5+qLcwViyxyRwDCmVYqliC07UJ/9rF/rxtNFLOJhoNxJ9QIDAQAB
AoGAAuyv1kAgH6nKYPvBoiA0aqOlLGo6IiF9zpzX/LuzSHEF6tKy+s4hC8EVtoEk
CA291LjUXU27Z/whOTCZUU5mEq1A0VQXDP/pGuot7FAcu9M3Z2a+Ky36FaRDHvtA
fCpMiGETqIQwtObf4Q2bUVFYyPPmvYEvZg9WEupek2WzQcECRQDxY21912wN46NR
kqvuZ9nTsBT6iPGkR2iir6gUNa+BslkdxUs42WnslnsZHNFCErgpzAII2cS4whMg
7fY4EjzrfWnC+QI9AOvPfIBQu+xTYUMnu2tWxXJQ1o6YrMfm7Dii5dSUDWt4oF6f
XtWc1zQ2ozEMPx1gQohpz+oLMMYy8CwB3QJFAM7PZd6cM1qO/r0D0cQ3O5wvTzn7
HDSobZB8uJ9gA5c2Cz4Da9gwBZ2Kq7qvQuW+DgTZYaDdmrrEpAjhd8NAdOs5juRZ
Aj0AnOOgDvMoBLT46ig+Ls09crBL//WeRyXhllDzHrseLpnEARCBlRfTqp6Ldu+R
8mZ//aiAt1OYsNVlK7JVAkR0HpioSegvnlRzcA2WL65VKQIVxdPLJp4JKWyn+kna
oLtEykG3+M7o/tYPZ3dQfhFiLqu6A3xM3lWERuw44j9rXOsCHA==
-----END RSA PRIVATE KEY-----`


module.exports = connect