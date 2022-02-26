async function readJson(url, store) {
    let response = await getJson(url);
    store.set(response);
}

async function getJson(url) {
    const response = await fetch(url, {
        mode: 'cors'
    });
    return await response.json();
}

async function postJson(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    });
    return await response.json();
}

module.exports = {
    getJson: getJson,
    readJson: readJson,
    postJson: postJson
};
