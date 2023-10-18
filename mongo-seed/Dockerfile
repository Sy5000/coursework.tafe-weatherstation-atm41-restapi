FROM mongodb/mongodb-community-server:4.4.21-ubi8

COPY climateDB.stationAtm41.json /climateDB.stationAtm41.json 
COPY climateDB.users.json /climateDB.users.json 

CMD mongoimport --host mongodb --db climateDB --collection stationAtm41 --type json --file /climateDB.stationAtm41.json --jsonArray && \
mongoimport --host mongodb --db climateDB --collection users --type json --file /climateDB.users.json --jsonArray
