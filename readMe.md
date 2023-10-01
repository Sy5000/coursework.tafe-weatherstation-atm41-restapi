# IoT Weather station API project

NSW weather station climate data
API Endpoints run on Express.js server (framework)  
Endpoints point to mongodb NoSQL database storage  
Docemnted in swaggerUI located 'localhost:3000/api-docs'

## Installation

1.

```

```

---

### notes

cmd line - 'brew services start/stop --all' turns mongo background services on / off
cmd line - 'mongo' - starts a mongo instance, --port 27017 is default, can change
open mongodb compass and connect to port eg mongodb://localhost:27017
OR cmd line mongo -27017 and type commands directly

REST API runs on express server
npm run dev ( package.json > scripts > dev auto start/restart server when changes are made)

connect to express in browser 'localhost:3000'
full swagger documentation located 'localhost:3000/api-docs/