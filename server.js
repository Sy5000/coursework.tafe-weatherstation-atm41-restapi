// https://www.sohamkamani.com/nodejs/mongodb-express-rest-api/
// https://zellwk.com/blog/crud-express-mongodb/#convertkit
// https://flaviocopes.com/rest-api-express-mongodb/
// swagger documentation https://www.youtube.com/watch?v=eiSem0cqaN0

// import dependencies
const express = require("express");
const bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");
const mongo = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
const cors = require("cors");
const app = express(); //init app
const swaggerUI = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const bcrypt = require("bcryptjs");

const swaggerDefinition = {
  openapi: "3.0.0", //OAStandard
  info: {
    title: "Express API for WeatherStation ATM41 (IoT)",
    version: "1.0.0",
    description: "This is a REST API application made with Express.",
    license: {
      name: "Licensed Under MIT",
      url: "https://spdx.org/licenses/MIT.html",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["server.js"],
};

const swaggerSpec = swaggerJSDoc(options);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // accept JSON objects from PUT 'main.js'

let db, users, weatherStn;

mongo.connect(
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, client) => {
    if (err) {
      console.error(err);
      return;
    }
    db = client.db("climateDB");
    weatherStn = db.collection("stationAtm41");
    users = db.collection("users");
  }
);

//url whitelist
app.use(
  cors({
    origin: "http://localhost:6069",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);
// test - fetch("http://localhost:6069/maxRainfall").then(req => req.text()).then(console.log)
function isAuth(req, res, next) {
  const auth = req.headers.permissions;
  if (auth === "teacher" || auth === "admin") {
    next();
  } else {
    res.status(401);
    res.send("No Access ⛔️");
  }
}
// endpoint to return info
app.get("/", (req, res) => {
  //res.send("dev mode, REST API");
  res.sendFile(__dirname + "/index.html");
});
/** route a - documented +tested ✅
 * @swagger
 *  /weatherStations:
 *  post:
 *    summary: A-Insert new reading for a weather station (single)
 *    description:
 *    parameters:
 *      - in : header
 *        name: permissions
 *        type: string
 *        required: true
 *        description: read write permissions level
 *    requestBody:
 *      description:
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          deviceName:
 *           type: string
 *           example: DLB ATM41 Charlestown Skate Park
 *          atmosphericPressure:
 *           type: string
 *           example: 100.00
 *          humidity:
 *           type: string
 *           example: 95.0
 *          lightningAvgDistance:
 *           type: string
 *           example: 0
 *          lightningStrikeCount:
 *           type: string
 *           example: 0
 *          maxWind:
 *           type: string
 *           example: 6.00
 *          rainfall:
 *           type: string
 *           example: 0.123
 *          solarRadiation:
 *           type: string
 *           example: 10
 *          vapourPressure:
 *           type: string
 *           example: 1.23
 *          windDirection:
 *           type: string
 *           example: 123.4
 *          windSpeed:
 *           type: string
 *           example: 1.23
 *          location:
 *           type: string
 *           example: -32.96599, 151.69513
 *          tempC:
 *           type: string
 *           example: 12.3
 *          time:
 *           type: string
 *           example: 2023-03-11T12:01:23+10:00
 *    responses:
 *      201:
 *        description: ok / true
 */
app.post("/weatherStations/", isAuth, (req, res) => {
  const deviceName = req.body.deviceName;
  const atmosphericPressure = req.body.atmosphericPressure;
  const humidity = req.body.humidity;
  const lightningAvgDistance = req.body.lightningAvgDistance;
  const lightningStrikeCount = req.body.lightningStrikeCount;
  const maxWind = req.body.maxWind;
  const rainfall = req.body.rainfall;
  const solarRadiation = req.body.solarRadiation;
  const vapourPressure = req.body.vapourPressure;
  const windDirection = req.body.windDirection;
  const windSpeed = req.body.windSpeed;
  const location = req.body.location;
  const tempC = req.body.tempC;
  const time = req.body.time;
  weatherStn.insertOne(
    {
      deviceName: deviceName,
      atmosphericPressure: atmosphericPressure,
      humidity: humidity,
      lightningAvgDistance: lightningAvgDistance,
      lightningStrikeCount: lightningStrikeCount,
      maxWind: maxWind,
      rainfall: rainfall,
      solarRadiation: solarRadiation,
      vapourPressure: vapourPressure,
      windDirection: windDirection,
      windSpeed: windSpeed,
      location: location,
      tempC: tempC,
      time: time,
    },
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ err: err });
        return;
      }
      console.log(result);
      res.status(201).json({ ok: true });
    }
  );
});
/** route b
 * @swagger
 *  /user:
 *  post:
 *    summary: B-Insert a new user (single)
 *    description:
 *    requestBody:
 *     description: ignored
 *     required: true
 *     content:
 *      application/json:
 *       schema:
 *         type: object
 *         properties:
 *           username:
 *             type: string
 *             example: mrPoopyButhole
 *           email:
 *             type: string
 *           password:
 *             type: string
 *           permissions:
 *             type: string
 *  responses:
 *      201:
 *        description: Created
 */
app.post("/user", (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const permissions = req.body.permissions;

  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(req.body.password, salt);

  users.insertOne(
    {
      username: username,
      email: email,
      password: hash,
      permissions: permissions,
    },
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ err: err });
        return;
      }
      console.log(result);
      res.status(201).json({ ok: true });
    }
  );
});
/** route c - documented +tested ✅
 * @swagger
 *  /weatherStation/update:
 *  put:
 *    summary : C-Insert a new field to record temp in F (tempC will be converted)
 *    parameters:
 *      - in : header
 *        name:  permissions
 *        required: true
 *        description: read write permissions level
 *    requestBody:
 *     description:
 *     content:
 *      application/json:
 *       schema:
 *          properties:
 *           id1:
 *            type: string
 *            example: 63fdd760dfb11755e2bd100b
 *           tempC:
 *            type: string
 *            example: 11.9
 *    responses:
 *      200:
 *        description: ok / true
 */
app.put("/weatherStation/update", isAuth, (req, res) => {
  tempC = req.body.tempC;
  tempF = JSON.stringify(tempC * 1.8 + 32);
  weatherStn.updateOne(
    { _id: ObjectId(req.body.id1) },
    { $set: { tempF: tempF } },
    {},
    (err, response) => {
      if (err) {
        console.log(err);
        res.status(500).json({ err: err });
        return;
      }
      res.status(200).json(response);
    }
  );
});

/** route d - documented +tested ✅
 * @swagger
 *  /maxRainfall:
 *  get:
 *    summary: D-Maximum precipitation recorded
 *    description:
 *    responses:
 *      200:
 *        description: Success
 */
app.get("/maxRainfall", (req, res) => {
  weatherStn
    .find()
    .sort({ rainfall: -1 })
    .limit(1)
    .toArray((err, items) => {
      if (err) {
        console.error(err);
        res.status(500).json({ err: err });
        return;
      }
      res.status(200).json({ maxRainfallResults: items });
    });
});
/** route e
 * @swagger
 *  /weatherStations/:time/:device:
 *  get:
 *    summary: E-Find records @ specific location and time
 *    description: return data from specific station at a given time and date
 *    perameters:
 *    - name: time
 *      description: timestamp
 *      in: formData
 *      required: true
 *      type: String
 *    - name: deviceName
 *      description: weather device name
 *      in: formData
 *      required: true
 *      type: String
 *    responses:
 *      200:
 *        description: Success
 */
app.get("/weatherStations/:time/:device", (req, res) => {
  const time = req.params.time;
  const deviceName = req.params.device;
  weatherStn
    .find({ time: time, deviceName: deviceName })
    .toArray((err, items) => {
      if (err) {
        console.error(err);
        res.status(500).json({ err: err });
        return;
      }
      res.status(200).json({ results: items });
    });
});
/** route f
 * @swagger
 *  /batches:
 *  get:
 *    summary: F-Return multiple records using a batch operation
 *    description: get multiple documents in batches
 *    responses:
 *      200:
 *        description: Success
 */
app.get("/batches", (req, res) => {
  weatherStn
    .find({ rainfall: { $gt: "5" } })
    .batchSize(3)
    .toArray((err, items) => {
      if (err) {
        console.log(err);
        res.status(500).json({ err: err });
        return;
      }
      res.status(200).json({ byBatch: items });
    });
});
/** route g
 * @swagger
 *  /byIndex:
 *  get:
 *    summary: G-Return a query that contains an index key
 *    description: get documents using an index key
 *    responses:
 *      200:
 *        description: Success
 */
app.get("/byIndex", (req, res) => {
  weatherStn
    .find()
    .limit(10)
    .sort({ rainfall: -1 })
    .toArray((err, items) => {
      if (err) {
        console.log(err);
        res.status(500).json({ err: err });
        return;
      }
      res.status(200).json({ byIndex: items });
    });
});
/** route h - documented +tested ✅
 * @swagger
 *  /user/{id}/delete:
 *  delete:
 *    summary: H-Delete user by _id
 *    description:
 *    parameters:
 *      - in : header
 *        name:  permissions
 *        required: true
 *        description: read write permissions level
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: _id of user to delete
 *    responses:
 *      200:
 *        description: Success
 */
app.delete("/user/:id/delete", isAuth, (req, res) => {
  //users.deleteOne({ _id: ObjectId(req.params.num) });
  users.deleteOne({ _id: ObjectId(req.params.id) }, (err, response) => {
    if (err) {
      console.log(err);
      res.status(500).json({ err: err });
      return;
    }
    res.status(200).json(response);
  });
});
// i) Delete multiple users (multiple)
/** route i
 * @swagger
 *  /users/delete:
 *  delete:
 *    summary: I-Delete multiple users
 *    description: Delete multiple users by _id
 *    perameters:
 *    - name: _id1
 *      description: user #1 to delete by _id
 *      in: formData
 *      required: true
 *      type: String
 *    - name: _id2
 *      description: user #2 to delete by _id
 *      in: formData
 *      required: true
 *      type: String
 *    responses:
 *      200:
 *        description: Success
 */
app.delete("/users/delete", isAuth, (req, res) => {
  users.remove(
    { _id: { $in: [ObjectId(req.body.id1), ObjectId(req.body.id2)] } }, //refactor to accept array of values
    (err, response) => {
      if (err) {
        console.log(err);
        res.status(500).json({ err: err });
        return;
      }
      res.status(200).json(response);
    }
  );
});
// j) Update a specific weather station longitude and latitude (single) *(MULTIPLE)
// -32.96599, 151.69513
// i) Delete multiple users (multiple)
/** route j
 * @swagger
 *  /weatherStations/update:
 *  put:
 *    summary: J-Update location of a specific station (multiple docs)
 *    description: update the coordinates of a weather device
 *    perameters:
 *    - name: deviceName
 *      description: weather device name
 *      in: formData
 *      required: true
 *      type: String
 *    - name: location
 *      description: new co-ordinates
 *      in: formData
 *      required: true
 *      type: String
 *    responses:
 *      200:
 *        description: Success
 */
app.put("/weatherStations/update", isAuth, (req, res) => {
  weatherStn.updateMany(
    { deviceName: req.body.deviceName },
    { $set: { location: req.body.location } },
    {},
    (err, response) => {
      if (err) {
        console.log(err);
        res.status(500).json({ err: err });
        return;
      }
      res.status(200).json(response);
    }
  );
});
/** route k
 * @swagger
 *  /users/update:
 *  put:
 *    summary: K-Update access level for multiple users (array)
 *    description: Update access level for at least two users
 *    parameters:
 *    - name: _id1
 *      description: user #1 to update by _id
 *      in: formData
 *      required: true
 *      type: String
 *    - name: _id2
 *      description: user #2 to update by _id
 *      in: formData
 *      required: true
 *      type: String
 *    - name: permissions
 *      description: permission level (admin, teacher, student)
 *      in: formData
 *      required: true
 *      type: String
 *    responses:
 *      200:
 *        description: Success
 */
app.put("/users/update", isAuth, (req, res) => {
  users.updateMany(
    { _id: { $in: [ObjectId(req.body.id1), ObjectId(req.body.id2)] } }, //refactor to accept array of values
    { $set: { permissions: req.body.permissions } },
    {},
    (err, response) => {
      if (err) {
        console.log(err);
        res.status(500).json({ err: err });
        return;
      }
      res.status(200).json(response);
    }
  );
});
// start the NODE.JS server
app.listen(3000, () => {
  console.log("Server Ready port 3000");
});
