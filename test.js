const axios = require('axios');

async function main() {
    const a = (await axios.get('https://programforyou.ru/js/json/karno_1.json?v=3')).data;
    console.log(a)
}
main()