exports.handler = (event, context) => {
    //We'll need the HTTP package to call the OMDB API
    const http = require('http');

    //helpder function that combines log and context.fail()
    function errorExit(dataObject){
        const str = JSON.stringify(dataObject);
        console.log(str);
        context.fail(str); 
    }
    
// check to see if the OMDB API key is available
    if(!process.env.API_KEY) 
    {
        //Leave the handler
        const err = new Error('A required internal parameter is not present');
        const obj = {type: 'Internal parameter Error', data: err};
        errorExit(obj);
    }
    const config = event;
    console.log ({config});
    if(!config) 
        {
            //Leave the handler
            const err = new Error('A required configuration object is not present');
            const obj = {type: 'Configuration Error', data: err};
            errorExit(obj);    
        }
    let param;
    if(config.search ) param = `s=${config.search}&type=movie&page=100`;
    if(config.id ) param = `i=${config.id}`;
    if(config.title ) param = `t=${config.title}`;
    if(!param)
        {
            //Leave the handler
            const err = new Error('A required retrieval parameterization object is not set');
            const obj = {type: 'Paramterization Error', data: err};   
            errorExit(obj);  
        }

    //Set the parameterized URL for the OMDB API
    const pm = encodeURI(param);
    const url = `http://www.omdbapi.com/?${pm}&apikey=${process.env.API_KEY}&r=json`;
    
    /*
    This function maps data returned from the title retreival
    on the OMDB API onto generic return object. OMBD returns
    searches data based on title in a structure that is different
    differnt search
    */
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

    /*
    Maps the object returned from the OMBD general
    searchon to the movide object used by MovieRater
    */
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
    
    //Get data from OMDB
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
            const obj = {type: "HTTP GET Error", data: error};
            console.log(JSON.stringify(obj));
            // consume response data to free up memory
            res.resume();
            return;
        }
        
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => {
            //Called as data keeps comingin from the GET request
            rawData += chunk;
        });
        res.on('end', () => {
            //Event that gets called at the end of the data streaming from the GET request
            try {
                const parsedData = JSON.parse(rawData);
                let data;
                if(parsedData.Search){
                    data = mapSearchResponse(parsedData.Search);
                }else{
                    data = mapTitleResponse(parsedData);
                }
                console.log({type: 'HTTP GET Response', responseData: data});
                context.done(null, data);
            } catch (err) {
                const obj = {type:'HTTP GET Respone Parse Error', data: err};
                errorExit(obj);
            }
        });
    }).on('error', (err) => {
        //Called when an Error is encountered in the HTTP GET request
        const obj = {type:'HTTP GET Respone Error', data: err};
        errorExit(obj);
    });
};
