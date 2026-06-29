"""
WSGI config for socialmedia_backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'socialmedia_backend.settings')

application = get_wsgi_application()
app = application  # Required for Vercel @vercel/python

# Run migrations automatically on startup so database is always up to date
try:
    from django.core.management import call_command
    call_command('migrate', interactive=False)
except Exception as e:
    print("Auto-migration failed:", e)


