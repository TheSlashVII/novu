# Novu - Create New Connections

#### The project is deployed on this domain: https://novu.cat (Not online anymore)

## This is a Tinder-like web app to find new friendships with other students.

It includes technologies such as facial scanning for ID verification to check if the ID submitted by the user actually belongs to a real person.

## Pre-requisites
* Python 3.13 and package dependencies.
* Django 6.0.4+
* MySQL DBMS with a database named **novudb** already created. (We used Laragon during development.)
* Angular 19

## Technologies Used

#### Frontend

### Angular

The official page is [here](https://v19.angular.dev/overview).

#### Important Notice

For the frontend to work as intended, you will need to locate the **src/app/baseURLconfig.ts** file and switch the *development* variable to `true`.

```javascript
// inside src/app/baseURLconfig.ts
development = true
```
This is done to facilitate the deployment process.

##### Tailwind CSS

The official page is [here](https://tailwindcss.com/).

#### Backend

### Django

#### Important Notice

If you want to try the chat functionality, you must use Daphne to run the Django server instead of Django's own development server. You can find Daphne's documentation [here](https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/daphne/).

Also, images might not work when using Daphne to run the Django server locally.

***

## Starting the Project
In order to run the project, you must have a database named **novudb**, as specified in the `db.conf` file inside the **novu/novu** folder of the Django project.

### 1. Starting the Backend

*Make sure you have the **MySQL Server** running with a database named **novudb**, a user with permissions over that database, and a **Python virtual environment**.*

To create the user, open your MySQL Shell and run the following commands:

```sql
-- user creation
CREATE USER 'novu'@'localhost' IDENTIFIED BY 'BDnovu3';
-- permissions
GRANT ALL ON novudb.* TO 'novu'@'localhost';
```

If the database has not been created yet, you can create it with the following command:

```sql
CREATE DATABASE novudb;
```
**Python Virtual Environment Configuration**

Execute this command inside a terminal to create your virtual environment:

```powershell
python -m venv /path/to/new/virtual/environment
```

Then, activate your virtual environment.

**On Windows**

```powershell
./path/to/new/virtual/environment/Scripts/activate
```

Running this command will activate a new prompt with `(venv)` displayed at the beginning.

Next, locate the `requirements.txt` file and run the following command in the terminal to install all dependencies:

```powershell
pip install -r requirements.txt
```

Be aware that you must run migrations before starting Django; otherwise, an exception will occur.

Run the following commands inside the folder where **manage.py** is located.

Create the migrations:

```powershell
python ./manage.py makemigrations
```
Apply the migrations:

```powershell
python ./manage.py migrate
```

*If the migrations fail to apply, double-check that the MySQL Server is running, that a database named **novudb** exists, and that the configured user has the appropriate permissions.*

### 2. Starting the Frontend

To start the frontend, simply run the following command:

```powershell
ng serve -o
```

Make sure you have installed all Node.js packages beforehand:

```powershell
npm install

```
