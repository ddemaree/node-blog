'use strict';

var pg = require('pg');
pg.defaults.ssl = true;
var Item = require('./models/item');

function getAllItems_p() {
  return new Promise(function(resolve, reject){
    try {
      var allItems = [];
      pg.connect(process.env.DATABASE_URL, function(err, client, done){
        if(err) throw err;
        var query = client.query('SELECT * FROM items ORDER BY created_at desc;');
        query.on('row', function(row){
          var item = new Item(row);
          allItems.push(item);
        });

        query.on('end', function(){
          done();
          resolve(allItems);
        });
      });
    }
    catch(err) {
      reject(err);
    }
  });
}

function initializeDatabase(){
  try {
    pg.connect(process.env.DATABASE_URL, function(err, client){
      if(err) throw err;
      client.query("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";\
      CREATE TABLE IF NOT EXISTS items (\
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),\
        attributes json NOT NULL DEFAULT '{}'::json,\
        body_text text, title text);\
      DROP TABLE IF EXISTS schema_versions;\
      alter table items drop column if exists created_at;\
      alter table items drop column if exists createdat;\
      alter table items drop column if exists created_t;\
      ALTER TABLE IF EXISTS items ADD created_at timestamptz DEFAULT now();");
      console.log('Connected to postgres!');
    });
  } catch(err) {
    console.log(err);
  }
}

function rollback(client){
  client.query("ROLLBACK;", function(err){
    client.end();
  });
}

// TODO: Wrap this insert in a transaction
function createItem(itemObj) {
  return new Promise(function(resolve, reject){
    pg.connect(process.env.DATABASE_URL, function(err, client, done){
      if(err) throw err;

      client.query({
        text: "INSERT INTO items (title, body_text, attributes) VALUES ($1, $2, $3)",
        values: [itemObj.title, itemObj.body, itemObj]
      }, function(err, result){
        if(err) reject(err);
        done();
        resolve(result);
      });
    });
  });
}

function findItemByShortID(shortID){
  return new Promise(function(resolve, reject){
    pg.connect(process.env.DATABASE_URL, function(err, client, done){
      if(err) throw err;
      
      client.query("SELECT * FROM items WHERE attributes->>'id' = $1 LIMIT 1", [shortID], function(err, result){
        if(err) throw err;
        
        if(result.rowCount === 0){
          reject(Error("Not found"));
        }
        else {
          var itemRow = result.rows[0];
          done();
          resolve(itemRow);
        }
      });
    });
  });
}

function findItemByUUID(uuid) {
  return new Promise(function(resolve, reject){
    pg.connect(process.env.DATABASE_URL, function(err, client, done){
      if(err) throw err;
      
      client.query("SELECT * FROM items WHERE (id = $1) LIMIT 1;", [uuid], function(err, result){
        if(err) {
          reject(Error("Not found"));
        }
        else if(result.rowCount === 0) {
          reject(Error("Not found"));
        }
        else {
          done();
          var foundItem = new Item(result.rows[0]);
          resolve(foundItem);
        }
      });
    });
  });
}

var pgstore = {
  initializeDatabase: initializeDatabase,
  getAllItems:       getAllItems_p,
  createItem:        createItem,
  findItem:          findItemByUUID,
  findItemByUUID:    findItemByUUID,
  findItemByShortID: findItemByShortID
};

module.exports = pgstore;