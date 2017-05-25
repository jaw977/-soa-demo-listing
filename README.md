# soa-demo-listing

## SOA Demo: Listing Service

Listens for JSON messages on an HTTP port, allowing listings to be created, or searched for.

Listings are stored in a PostgreSQL database.  The app has its own DB instance and does not share data with other apps.  `node model.js --sync` can be used to create the database tables.  (A real world listing service would use a specialized search platform such as Solr or Elastic Search.)

Use `npm start` to start the service.  The app can be directly deployed to Heroku, however it is not tied to Heroku in any way.

http://senecajs.org and https://github.com/jaw977/soa-demo-service are used to route incoming messages to handler functions, and send messages to other services.

### Messages

* Creating a new listing (requires an authenticated user token):
  * Request:  `{"role":"listing","cmd":"add","token":"eyJugIA",category:"Toys","title":"Spinners","amount":100}`
  * Response: `{"listing":{"listingId":1,...}}`
* Searching for listings:
  * "category" and "sellerUsername" params may be used as search filters.
  * "page" parameter chooses which page to display (default page 1).  10 results per page are returned.
  * Request:  `{"role":"listing","cmd":"search","category":"Toys"}`
  * Response: 
  
```
{"pages":1,"count":2,"fromNumber":1,"toNumber":2,"listings":[
  {"listingId":1,"sellerId":3,"category":"Toys","title":"PS4 Consoles","currentBidAmount":100,"nextBidAmount":100,"user":{"username":"seller1"}},
  {"listingId":2,"sellerId":3,"category":"Toys","title":"XBox1 Consoles","currentBidAmount":100,"nextBidAmount":100,"user":{"username":"seller1"}}]}
```

* The service subscribes to "addUser" events from the user service, using them to keep its local copy of the users table in sync, so that it can associate seller userId to usernames.

### Configuration

All configuration happens in environment variables.  

* `PORT`: The port that the app listens on.
* `DATABASE_URL`: The URL of the PostgreSQL database instance.
* `CLIENTS`: Other services the app may connect to.  `[user,bid]`
* `user.ADDR`: Port or hostname of the user service.
* `bid.ADDR`: Port or hostname of the bid service.
* `SUBSCRIPTIONS`: Other services to contact when events are published.  `addListing:[bid]`
* `TOKEN_SECRET`: Shared secret for token verification.

The config variables to manage connections with other services would become unmanageable as the number of services grows.  Using an automatic service discovery mechanism such as https://github.com/senecajs/seneca-mesh would help greatly.
