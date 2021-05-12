# court-case-management-sgp
A court case management software that has facility to record information like adding a case, adding lawyers (have facility select from existing list of lawyers), send invoice for each hearing. In short, the system provides end to end management of court case from client perspective and is easy to use.

## Features

- Basic Authentication (Register/Login with hashed password)
- Adding a case(Client only).
- Choose lawyers from the registered lawyer list(Client only).
- Mailing invoices(lawyer only).
- Resolving Cases(lawyer only).

## Software Requirements

- Node.js
- MongoDB

## How to install

### Using manual download ZIP

1.  Download repository
2.  Uncompress to your desired directory

### Install npm dependencies after installing (Git or manual download)

~~~bash
npm install
~~~

## How to run

### Running API server locally

~~~bash
node app.js
~~~
If you have nodemon package then,

~~~bash
nodemon app.js
~~~

You will know server is running by checking the output of the command `node app.js`


## Bugs or improvements

Every project needs improvements, Feel free to report any bugs or improvements. Pull requests are always welcome.

### bugs
- Currently, when the client chooses a lawyer the lawyer doesn’t get notified.  
- All the active cases are listed together and are not properly organised according to case types.
