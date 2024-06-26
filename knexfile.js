
module.exports = {
    development: {
        client: 'sqlite3',
        connection: {
            filename: './robot.db3',
        },
        migrations:{
            directory:'./db/migrations'
        },
        useNullAsDefault: true,
    },
};