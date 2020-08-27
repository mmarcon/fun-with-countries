FROM node:14-alpine
# Create app directory
WORKDIR /usr/src/app
# Copy app source code
COPY app/ ./
# Install app dependencies
RUN npm install
#Expose port and start application
EXPOSE 3000
CMD [ "npm", "start" ]