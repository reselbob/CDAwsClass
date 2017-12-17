const http = require('http');

exports.handler = (event, context, callback) => {
    if(!process.env.API_KEY) throw new Error('The required Environment Var, API_KEY is not set');
    const config = event;
    console.log ({config: config});
    if(!config) throw new Error('No configuration defined');
    let param;
    if(config.search ) param = `s=${config.search}&type=movie&page=100`;
    if(config.id ) param = `i=${config.id}`;
    if(config.title ) param = `t=${config.title}`;
    if(!param) throw new Error('No proper configuration object define.');

    const pm = encodeURI(param);
    const url = `http://www.omdbapi.com/?${pm}&apikey=${process.env.API_KEY}&r=json`;
    
    function mapTitleResponse(data){
    if(!data || data.Error) return;
    const model = {};
    model.genre = '';
    model.id = data.imdbID;
    model.title = data.Title;
    model.releaseDate = data.Released;
    model.studio = data.Production;
    return model;
    }
    
    function mapSearchResponse(data){
        const arr= [];
        if(Array.isArray(data)){
            data.forEach(item => {
                const model = {};
                model.genre = '';
                model.id = item.imdbID;
                model.title = item.Title;
                if(item.Year) model.releaseDate = item.Year;
                arr.push(model);
            });
        }
        return arr;
    }    
    
    http.get(url, (res) => {
        const {statusCode} = res;
        const contentType = res.headers['content-type'];
        let error;
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                `Status Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
            error = new Error('Invalid content-type.\n' +
                `Expected application/json but received ${contentType}`);
        }
        if (error) {
            console.error(JSON.stringify(error.message));
            // consume response data to free up memory
            res.resume();
            return;
        }
        
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => {
            rawData += chunk;
        });
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                let data;
                if(parsedData.Search){
                    data = mapSearchResponse(parsedData.Search);
                }else{
                    data = mapTitleResponse(parsedData);
                }
                console.log({responseData: data});
                callback(null, data);
            } catch (e) {
                console.error(JSON.stringify(e.message));
            }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
};
