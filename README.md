Just run RAS
============
A lightweight script to use with Node that will run ONLY the 
[ONS RAS frontstage project](https://github.com/ONSdigital/ras-frontstage) service, which uses services 
running on the network to remove memory hogging services, minimise setup time 
involved in borrowing a more capable machine and speed up development builds.



Running in Docker
=================

Prerequisites
-------------
From the project root
* Run `docker build .` and make note of the image id in the console

Run
---
Before you run the below script from project root, replace `<docker image>` with 
the image id created in the prerequisites and `<username>`, `<password>`, `<jwt>` with 
correct credentials
```
node just-run-ras.js --basic-auth-username=<username> --basic-auth-password=<password> --jwt=<jwt> --port=8082 --service-suffix=-concourse-latest.apps.devtest.onsclofo.uk --docker-image=<docker-image> --run-with=docker
```



Running for development
=======================

Prerequisites
-------------
From project root
* Install Node (v8^)
* Install [Docker](https://www.docker.com/) optionally with brew ```brew install docker```
* Install pyenv `brew install pyenv`
* Install python 3.6.1 `pyenv install 3.6.1`
* Set pyenv global python version `pyenv global 3.6.1`
* Copy the script file `just-run-ras.js` into the root of the project

Install/Setup a new environment
--------------
Before you run the below script from project root replace `<username>`, `<password>`, `<jwt>` and `<python path>` with correct credentials and path and adjust any settings to your needs
```
node just-run-ras.js --basic-auth-username=<username> --basic-auth-password=<password> --jwt=<jwt> --port=8082 --service-suffix=-concourse-latest.apps.devtest.onsclofo.uk --python-path=<python path> —-install
```

Run existing environment
------------------------
If you've previously installed and setup an environment, just run again with
replacing `<username>`, `<password>`, `<jwt>` and `<python path>` with correct 
credentials and path and adjust any settings to your needs
```
node just-run-ras.js --basic-auth-username=<username> --basic-auth-password=<password> --jwt=<jwt> --port=8082 --service-suffix=-concourse-latest.apps.devtest.onsclofo.uk
```
