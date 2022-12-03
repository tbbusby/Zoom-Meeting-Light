const {readFileSync, promises: fsPromises} = require('fs');

function checkIfContainsSync(filename, str) {
    const contents = readFileSync(filename, 'utf-8');

    const result = contents.includes(str);

    return result;
}

console.log(checkIfContainsSync('./ZoomWebhook.json', '"presence_status": "Offline"'));

async function checkIfContainsAsync(filename, str) {
    try {
        const contents = await fsPromises.readFile(filename, 'utf-8');

        const result = contents.includes(str);
        console.log(result);

        return result;
    } catch (err) {
        console.log(err);
    }
}

checkIfContainsAsync('./Zoomwebhook.json', '"presence_status": "Offline"');