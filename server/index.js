import express from 'express';
//import WorkerSheet from 'methods.js';
import config from 'config';

import fs from 'fs';
import bodyParser from 'body-parser';
import WorkSheet from './methods.js';

const app = express();
const port = process.env.PORT || 5000;

const TableMethods = new WorkSheet()

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))

// Process application/json
app.use(bodyParser.json());

app.listen(port, () => console.log(`server started \n Listening on port ${port}`));

app.get('/express_backend', (req, res) => {
    console.log(' *** express_backend ***')
    
    res.send({ up_server: 'server connected' });
});

app.post('/searchTablesTitles', async(req, res) => {
    console.log(' *** searchTables ***')
    let {body:{link}} = req
    //link = config.get("link")
    
    res.send({ tables_name: await TableMethods._getTitles(link)  });

})

app.post('/getTables', async (req, res) => {
    console.log(' *** getTables ***')
    let {body:{titles,link}} = req 
  
    res.send({ tables: await TableMethods._selectTablesData(titles, link.link)});
})

app.post('/sortTables', async (req, res) => {
    console.log(' *** sortTables ***')
    let {body:{titles,link}} = req 

    res.send({ tableC: await TableMethods._setCTable(titles,link.link)})

}) 
