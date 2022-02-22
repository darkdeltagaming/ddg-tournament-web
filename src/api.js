async function readJson(url, store) {
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.send();
    request.onload = () => {
        if (request.status === 200) {
            store.set(JSON.parse(request.response));
            return Promise.resolve();
        }
        console.log(`GET Request failed with code ${request.status}`);
        return Promise.resolve();
    }
}

async function postJson(url, data) {
    let request = new XMLHttpRequest();
    request.open("POST", url);

    request.setRequestHeader("Accept", "application/json");
    request.setRequestHeader("Content-Type", "application/json");

    request.onreadystatechange = function () {
       if (request.readyState === 4) {
          console.log(request.responseText);
    }};

    request.send(data);
}

module.exports = {
    readJson: readJson,
    postJson: postJson
};
