import sqlite3
import json

DB_NAME = "sounds_of_past.db"

def get_tracks_by_region(region_name: str):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row 
    cursor = conn.cursor()

    cursor.execute('''SELECT * FROM ethno_tracks WHERE LOWER(region)=LOWER(?)''', (region_name,))
    rows = cursor.fetchall()
    conn.close()
    
    tracks_list = [dict(row) for row in rows]
    tracks_json = json.dumps(tracks_list, ensure_ascii=False)
    return tracks_json

def add_to_db(name_of_track, performer, global_region, region, duration_sec, is_instrument, url_for_track):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
INSERT INTO ethno_tracks (name_of_track, performer, global_region, region, duration_sec, is_instrument, url_for_track)
VALUES (?,?,?,?,?,?,?)
''', (name_of_track, performer, global_region, region, duration_sec, is_instrument, url_for_track))
    conn.commit()
    conn.close()
    print("Добавление трека успешно")

def get_track_by_id_json(track_id: int) -> str:
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('''SELECT * FROM ethno_tracks WHERE id=?''', (track_id,))
    row = cursor.fetchone()
    conn.close()
    if row is None:
        return json.dumps({"error": "Track not found"}, ensure_ascii=False)
    track_dict = dict(row)
    track_json = json.dumps(track_dict, ensure_ascii=False)
    
    return track_json

#add_to_db('Byranbay', 'Inshar_Sultan', 'север', 'Красноярский край', 21, False, '/audio/Buranbay_Inshar Sultanbaev_Bashkiria_1.mp3')

# для микшера
def get_all_instruments_json() -> str:
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM ethno_tracks WHERE is_instrument = 1')
    rows = cursor.fetchall()
    conn.close()
    
    instruments_list = [dict(row) for row in rows]
    print("Нашли следуйщие инструменты;", track_json)
    return json.dumps(instruments_list, ensure_ascii=False)


def get_all_tracks_json() -> str:
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM ethno_tracks WHERE is_instrument = 0')
    rows = cursor.fetchall()
    conn.close()
    
    tracks_list = [dict(row) for row in rows]
    print("Нашли следуйщие треки;", track_json)
    return json.dumps(tracks_list, ensure_ascii=False)