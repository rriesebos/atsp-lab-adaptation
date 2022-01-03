# Web vulnerabilities
This repository contains a web application which serves as an example of current web vulnerabilities and their effects. 
Students and enthusiasts alike can use this setup in order to learn about these vulnerabilities, how they work and what can be done to prevent them.

## Running the application
* Install Docker: <https://docs.docker.com/install/>
* Install Docker Compose: <https://docs.docker.com/compose/install/>
* Navigate to the root folder
* Build the Docker images: `docker-compose build`
* Start the application: `docker-compose up`
* Navigate to <http://localhost:80> for the instruction page

## Technology stack
* Front-end:
  * NGINX
  * Javascript, HTML5, CSS3
* Back-end:
  * Node.js
  * Express
* Database:
  * PostgreSQL

## Example screenshot
![Session hijacking screenshot](https://github.com/rriesebos/atsp-lab-adaptation/blob/develop/screenshots/session-hijacking.png)
