# IoT Weather station API project (development)

NSW weather station climate data  
API Endpoints run on Express.js server (framework)  
Endpoints point to mongodb NoSQL (database storage)  
Documented in swaggerUI located 'localhost:3000/api-docs'

Create, Read, Update endpoints require 'admin' or 'teacher' permissions

## Installation

1. start application

Using docker, the entire stack can be constructed by running;

```
docker-compose up
```

from the same directory as the docker-compose file / project files.

2. stop application

run;

```
docker-compose down
```

from the same directory

### notes

'mongo_seed' container will run a single cmd to populate the database then exit running.

mongoDB compass can be used as a GUI for MongoDB.

https://www.mongodb.com/try/download/compass

### manually start express (local mongo-community server required)

https://www.mongodb.com/try/download/community

> open 'server.js' project file
> comment in/out required 'url' variable for local/containerised mongo database
> start mongo server and upload JSON files from '/mongo-seed' directory manually
> open project in VSCode
> from terminal
> npm init
> npm install
> npm run dev ( package.json > scripts > dev auto start/restart server when changes are made )

database will be available on port 27017 eg 'mongodb://localhost:27017'
