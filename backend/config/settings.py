# backend/config/settings.py
from pathlib import Path
import os

# =========================
# BASE CONFIG
# =========================
BASE_DIR = Path(__file__).resolve().parent.parent

# WARNING: this secret key is fine for local development only.
# For production put a secure value in the environment and read it with os.environ.
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret-key-change-in-production")

DEBUG = os.environ.get("DJANGO_DEBUG", "True").lower() in ("1", "true", "yes")

# Allow local addresses and any host during development; lock this down for production
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "127.0.0.1,localhost").split(",")

# =========================
# APPLICATIONS
# =========================
INSTALLED_APPS = [
    # Default Django apps (admin uses templates so ensure TEMPLATES is configured)
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third party
    "rest_framework",
    "corsheaders",

    # Your apps
    "feed",
]

# =========================
# MIDDLEWARE
# =========================
MIDDLEWARE = [
    # corsheaders middleware should be as high as possible (before CommonMiddleware)
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.security.SecurityMiddleware",

    # whitenoise for serving static files in production (and local)
    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",

    # csrf, auth and messages
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",

    # clickjacking protection
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# =========================
# URL / WSGI
# =========================
ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

# =========================
# TEMPLATES (admin requires this)
# =========================
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        # you can optionally place project-level templates here
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",  # required by admin
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# =========================
# DATABASE (sqlite for dev)
# =========================
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# =========================
# AUTH / I18N
# =========================
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# =========================
# STATIC FILES (deployment ready)
# =========================
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Optional: If you build the React frontend into backend/frontend_build, point here:
# STATICFILES_DIRS = [BASE_DIR / "frontend" / "build" / "static"]
STATICFILES_DIRS = [
    # Uncomment and adjust if you plan to serve built frontend static files from Django
    # BASE_DIR / "frontend" / "build" / "static",
]

# whitenoise recommended storage for compressed manifests (good for production)
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# =========================
# DEFAULTS
# =========================
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# =========================
# DJANGO REST FRAMEWORK
# =========================
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
}

# =========================
# CORS (frontend connect)
# =========================
# For local dev you can allow all origins.
# If you'd prefer to lock it down, set CORS_ALLOWED_ORIGINS instead.
CORS_ALLOW_ALL_ORIGINS = os.environ.get("CORS_ALLOW_ALL_ORIGINS", "True").lower() in (
    "1",
    "true",
    "yes",
)

# If you prefer to whitelist only the dev frontend hosts, use this instead:
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
#     "http://localhost:3001",
# ]
#
# (If CORS_ALLOW_ALL_ORIGINS is True, Django will ignore CORS_ALLOWED_ORIGINS.)

# For Django >= 4.x you may need to add CSRF trusted origins for cross-origin POSTs from your frontend:
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

# =========================
# Optional security / session settings for local dev
# =========================
# SESSION_COOKIE_SECURE = False
# CSRF_COOKIE_SECURE = False

# =========================
# Logging (simple, write to console)
# =========================
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}

