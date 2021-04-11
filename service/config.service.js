const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    node_env: process.env.node_env,

    wqtt_host: process.env.wqtt_host,
    wqtt_wss_port: process.env.wqtt_wss_port,
    wqtt_username: process.env.wqtt_username,
    wqtt_password: process.env.wqtt_password,

    mysql_host: process.env.mysql_host,
    mysql_user: process.env.mysql_user,
    mysql_password: process.env.mysql_password,
    mysql_database: process.env.mysql_database
};