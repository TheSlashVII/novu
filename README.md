# Novu - Create new connections
#### The project is deployed on this domain: https://novu.cat
## This is a tinder like webapp to find new friendships with other students. 
It includes technologies such as face scan for the id to check if the id submitted by the user is actually a human being
## Pre-requisites
* Python 3.13 and package dependencies. Check here
* Django 6.0.4+
* MySQL DBMS with a database created named novudb. (We used Laragon while developing)
* Angular 19


## Technologies used
#### Frontend
### Angular
The official page is [here](https://v19.angular.dev/overview)

#### Important notice
For the frontend to work as intended you will need to locate the **src/app/baseURLconfig.ts** file and switch the _development_ variable to true. 

````javascript
// inside src/app/baseURLconfig.ts
development = true
````

This is done to facilitate the deployment process.



##### Tailwind CSS
The official page is [here](https://tailwindcss.com/)

#### Backend
### Django 


## Starting the project

In order to run the project you have to make sure to have a database named **novudb** as stated in the file db.conf inside the **novu/novu** folder of Django files


