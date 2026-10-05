import sqlite3

def init_database():
    conn = sqlite3.connect("sounds_of_past.db")
    cursor = conn.cursor()

    cursor.execute('''
CREATE TABLE IF NOT EXISTS ethno_tracks (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name_of_track TEXT NOT NULL,
performer TEXT NOT NULL,
global_region TEXT NOT NULL,
region TEXT NOT NULL,
duration_sec Integer NOT NULL,
is_instrument BOOLEAN NOT NULL,
url_for_track TEXT NOT NULL
)
''')
    conn.commit()
    conn.close()
    print("База данных успешно создана.")


init_database()