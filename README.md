# CS50W Mail
A web-based email client built using Django, HTML, CSS (with Bootstrap), and JavaScript. This project was created as part of Harvard’s CS50 Web Programming with Python and JavaScript course.

## Features
- Compose and send emails
- View inbox, sent, and archived mailboxes
- Read individual emails
- Archive and unarchive messages
- Mark emails as read
- Built using JavaScript for dynamic frontend interaction

## Getting Started
Follow the steps below to get this project running on your local machine.

### Prerequisites
- Python 3.6+
- pip
- Git
- A web browser

### Installation

1. **Clone the Repository**
   
git clone https://github.com/ruissouw/cs50w-mail.git

cd cs50w-mail

2. **Create a Virtual Environment**
   
python -m venv env

3. **Activate the Virtual Environment**
   
On macOS/Linux:

source env/bin/activate

On Windows:

env\Scripts\activate

4. **Install Dependencies**
   
pip install -r requirements.txt

5. **Apply Migrations**
   
python manage.py migrate

6. **Run the Development Server**
   
python manage.py runserver

7. **Open the App in Your Browser**
    
Visit http://127.0.0.1:8000/ to start using the application.
