# Ten minute blog in Node.js (Express)

_This document is a work in progress._

This grew out of some playing around on [HyperDev](https://hyperdev.com) to get my feet wet (finally) with Node, Express, and that whole ecosystem.

This is not an impressive app in any way. Really, the best thing I can say about it is that it runs, renders HTML, can successfully talk to a SQL database, all tasks I can do with my eyes closed in Ruby but actually had to learn in Node.

That said, there are a few nascent opinions expressed in this code:

## Database stuff

One thing I'm (sort of) intentionally avoiding here is a ton of ORM-like abstraction around the database (which here is Postgres—partly because it's familiar, partly because Heroku's free plan is very generous).

All my database accessor methods are currently written in a kind of RPC-like style, e.g. `db.findItemByUUID` (as opposed to `Item.findByUUID`), mainly so I can separate the `Item` "class" and its structure from the code that talks to a database.

More importantly, all my database functions return Promises.

On the one hand, I could have written my talking-to-the-DB API like this:

```javascript
app.get("/items/:itemID", function(req, res){  
  // the `item` parameter is an `Item` object if found, null otherwise
  db.findItemByUUID(req.params.itemID, function(item){
    if(item) {
      res.render("single-item", {
        item: item
      })
    }
    else {
      // This function sends a static 404 page
      handleNotFound(error, res);
    }
  })
});
```

Now that I type that out, there's nothing wrong with it. But I wanted to learn what Promises were all about, and I think there could be some value in having DB methods return them for the sake of composability and reuse.

Also, a rejected Promise strikes me as less passive-aggressive about whether a given operation succeeded or failed, compared to the very Ruby-ish alternative of having the method return a nil value on failure.

So, my finder method works like this instead:

```javascript
function findItemByUUID(uuid) {
  return new Promise(function(resolve, reject){
    pg.query("SELECT * FROM items WHERE uuid = $1", [uuid],
      function(error, result){
        if (error) {
          // Something actually went wrong — raise hell
          throw error;
        } else if (result.rowCount === 0) {
          // Oh nbd, not found
          reject(Error("Item not found"));
        } else {
          // Success!
          resolve(result.rows[0]);
        }
      }
    );
  });
}
```

Here's the API in use in a web app method:

```javascript
app.get("/items/:itemID", function(req, res){  
  db.findItemByUUID(req.params.itemID).then(
    // Success case, passes in the found Item
    function(item){
      res.render("single-item", {item: item})
    },
    // Error case, passes in the error (usually 404)
    function(error){
      handleNotFound(error, res);
    }
  );
}
```
