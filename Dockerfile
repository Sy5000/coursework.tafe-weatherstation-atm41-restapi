# base image
FROM node:18-alpine
# create app directory 
WORKDIR /app
# copy project files (all) 
COPY . .
# install packages
RUN npm install && npm update
# port
# EXPOSE 3000
CMD ["npm", "start", "npm run dev"]