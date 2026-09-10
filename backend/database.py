import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "mineguard.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Create tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS coalfields (
        id TEXT PRIMARY KEY,
        org_id TEXT,
        name TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mines (
        id TEXT PRIMARY KEY,
        coalfield_id TEXT,
        name TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS panels (
        id TEXT PRIMARY KEY,
        mine_id TEXT,
        name TEXT NOT NULL,
        boundary_coords TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS nodes (
        id TEXT PRIMARY KEY,
        panel_id TEXT,
        lat REAL,
        lng REAL,
        status TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS telemetry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        node_id TEXT,
        tilt_x_deg REAL,
        tilt_y_deg REAL,
        tilt_magnitude_deg REAL,
        vibration_rms REAL,
        displacement_mm REAL,
        crack_detected INTEGER,
        battery_percent INTEGER,
        signal_strength INTEGER,
        sequence INTEGER,
        status TEXT,
        packet_id TEXT,
        current_relay TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        severity TEXT,
        node_id TEXT,
        message TEXT,
        acknowledged INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
