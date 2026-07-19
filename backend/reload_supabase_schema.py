import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.db import connection

def reload_schema():
    with connection.cursor() as cursor:
        print("Reloading Supabase PostgREST schema cache...")
        cursor.execute("NOTIFY pgrst, 'reload schema';")
        print("Schema reload notification sent successfully.")

if __name__ == "__main__":
    reload_schema()
