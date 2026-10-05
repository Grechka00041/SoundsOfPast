import sqlite3

DB_NAME = "sounds_of_past.db"
def get_tracks_by_region(region_name: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute('''SELECT * FROM ethno_tracks WHERE region=?''',region_name)
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

add_to_db('Byranbay', 'Inshar_Sultan', 'север', 'Красноярский Край', 22, False, 'https://disk.yandex.ru/d/lBgkQRuFlvWBsA')