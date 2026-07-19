import os
import django
from pathlib import Path

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.db import connection

def apply_migrations():
    migrations_dir = Path("../frontend/supabase/migrations")
    if not migrations_dir.exists():
        print(f"Migrations directory not found at {migrations_dir.resolve()}")
        return

    sql_files = sorted(migrations_dir.glob("*.sql"))
    print(f"Found {len(sql_files)} SQL migration files.")

    with connection.cursor() as cursor:
        for sql_file in sql_files:
            print(f"Applying migration: {sql_file.name} ...")
            sql_content = sql_file.read_text(encoding="utf-8")
            
            # Split SQL statements by semicolon if needed, or execute as block
            # For PostgreSQL, running the entire block is usually fine unless there are transactions issues,
            # but since we are running definitions, running as a block inside a transaction is perfect.
            try:
                # We need to strip out any client-side commands or run them as a block
                # Supabase SQL migs are standard Postgres statements.
                cursor.execute(sql_content)
                print(f"Successfully applied {sql_file.name}")
            except Exception as e:
                print(f"Error applying {sql_file.name}: {e}")
                # Rollback current transaction to allow subsequent ones if any, or just fail
                connection.rollback()

if __name__ == "__main__":
    apply_migrations()
