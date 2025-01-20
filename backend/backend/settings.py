"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 4.2.11.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import os
import dj_database_url  # For parsing database URL

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Set the GDAL library path
# GDAL_LIBRARY_PATH = os.path.join(os.getenv('OSGEO4W_ROOT', r'C:\OSGeo4W'), 'bin', 'gdal309.dll')
GDAL_LIBRARY_PATH = os.getenv('GDAL_LIBRARY_PATH', '/usr/lib/libgdal.so')  # For deployment

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'your-default-secret-key') # For deployment
# SECRET_KEY = "django-insecure-nma=xi6x2p-crjg^ifqqkapyu1qjd0l=+wn)-rijk_o%$!k3w_"


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False') == 'True' # For deployment
# DEBUG = True


ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',') # For deployment
# ALLOWED_HOSTS = ["*"]


REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}

# Application definition

INSTALLED_APPS = [    
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    'daphne',
    "django.contrib.staticfiles",
    "api",
    "features",
    "rest_framework",
    "corsheaders",
    "channels",
    

]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",

]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# WSGI_APPLICATION = "backend.wsgi.application"
ASGI_APPLICATION = 'backend.asgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

# DATABASES = {
#     "default": {
#         "ENGINE": "django.contrib.gis.db.backends.postgis",
#         # "ENGINE": "django.db.backends.postgresql",
#         "NAME": "geofence",
#         "USER": "postgres",
#         "PASSWORD": "password",
#         "HOST": "127.0.0.1",
#         "PORT": "5432",
#     }
# }


# For deployment 1.0
DATABASES = {
    'default': {
            'ENGINE': 'django.contrib.gis.db.backends.postgis',
            'NAME': 'geodatabase_1',
            'USER': 'geodatabase_1_user',
            'PASSWORD': 'VC4mSiJU6Yz6KDHdqRNwHmFDjn72amgg',
            'HOST': 'dpg-cu6s2gi3esus73fde7j0-a',
            'PORT': '5432',
        }
}

# # For deployment 2.0
# DATABASES = {
#     'default': {
#             'ENGINE': 'django.contrib.gis.db.backends.postgis',
#             'NAME': 'geodb_e48a',
#             'USER': 'geodb_e48a_user',
#             'PASSWORD': 'OeGGHrVEYxbIh75IVg753OKQHDDLBKLi',
#             'HOST': 'dpg-cthvm02j1k6c739ibrm0-a',
#             'PORT': '5432',
#         }
# }


# Explicitly set the engine to PostGIS if not already present
if not DATABASES['default'].get('ENGINE'):
    DATABASES['default']['ENGINE'] = 'django.contrib.gis.db.backends.postgis'
 
if not DATABASES['default'].get('NAME'):
    DATABASES['default']['NAME'] = 'peo_vi7s'



# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWS_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://poe-system.vercel.app",
    "http://localhost:8000",

]
# CORS settings using environment variables
# CORS_ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')]

CSRF_TRUSTED_ORIGINS = [
    'https://poe-system.onrender.com',
    'https://poe-system.vercel.app',
]


CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            # "hosts": [('127.0.0.1', 6379)],
            # "hosts": [os.getenv('REDIS_URL', 'redis://red-cs71lmbtq21c73clh2kg:6379')],
            "hosts": [("red-cs71lmbtq21c73clh2kg",6379)], # For deployment?
        },
    },
}

# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'handlers': {
#         'console': {
#             'class': 'logging.StreamHandler',
#         },
#     },
#     'loggers': {
#         'django': {
#             'handlers': ['console'],
#             'level': 'DEBUG',
#         },
#         '': {
#             'handlers': ['console'],
#             'level': 'DEBUG',
#         },
#     },
# }