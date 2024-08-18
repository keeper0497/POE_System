# POE_System


## Table of Contents

- [Installation](#installation)
- [Usage](#usage)


## Installation

To install this project, follow these steps:

1. clone the main branch:
    "git clone https://github.com/keeper0497/POE_System.git"

2. install python:

    note: if you already install this feel free to skip

    if there is no python install follow this:

        2.1 download python in this link https://www.python.org/downloads/

        2.2 after installing try to check if the python is install by using this command

            "python --version"

        2.3 if you incounter error just contact me hahaha!

3. install virtual environment:

    note: if you already install this feel free to skip

        3.1 to install virtualenv use this command

            "pip install virtualenv"

4. Create a virtual environment:
    
    4.1 to create virtualenv use this command

        "python -m venv .env"

    note: the ".env" is the name of the virtualenv

5. install the requirements.txt

    5.1 install the requirements.txt by the command below

        "pip install -r requirements.txt"

    note: wait for the installation to finish. it will vary to the internet connection

6. Make the migrations

    6.1 to patch the migration use this command

        "python manage.py makemigrations"

    6.2 to install the migration use this command

        "python manage.py migarte"

7. Last is to create the superuser

    note: the super user is the user that can access the django admin panel

    7.1 to create a superuser use the command below

        "python manage.py createsuperuser"

    7.2 just fill out all the required fields

8. Then last is to run the server to access its content

    8.1 use this command
    
        "python manage.py runserver"

## Usage

1. To access the login page use this url path. just paste the url to the browser
    "http://127.0.0.1:8000/login/"

2. To access the register page use this url path
    "http://127.0.0.1:8000/register/"

