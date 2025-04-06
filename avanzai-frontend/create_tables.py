import sqlite3

def create_tables():
    conn = sqlite3.connect('allie.db')
    cursor = conn.cursor()

    # Create User table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS User (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT NOT NULL,
        password TEXT
    )
    ''')

    # Create Chat table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS Chat (
        id TEXT PRIMARY KEY NOT NULL,
        createdAt TIMESTAMP NOT NULL,
        userId TEXT NOT NULL,
        title TEXT NOT NULL,
        visibility TEXT NOT NULL DEFAULT 'private',
        templates TEXT NOT NULL DEFAULT '{}',
        FOREIGN KEY (userId) REFERENCES User(id)
    )
    ''')

    # Create Message table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS Message (
        id TEXT PRIMARY KEY NOT NULL,
        chatId TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt TIMESTAMP NOT NULL,
        FOREIGN KEY (chatId) REFERENCES Chat(id)
    )
    ''')

    # Create Vote table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS Vote (
        chatId TEXT NOT NULL,
        messageId TEXT NOT NULL,
        isUpvoted INTEGER NOT NULL,
        PRIMARY KEY (chatId, messageId),
        FOREIGN KEY (chatId) REFERENCES Chat(id),
        FOREIGN KEY (messageId) REFERENCES Message(id)
    )
    ''')

    # Create Document table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS Document (
        id TEXT PRIMARY KEY NOT NULL,
        createdAt TIMESTAMP NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        kind TEXT NOT NULL DEFAULT 'text',
        userId TEXT NOT NULL,
        chatId TEXT NOT NULL,
        metadata TEXT,
        FOREIGN KEY (userId) REFERENCES User(id),
        FOREIGN KEY (chatId) REFERENCES Chat(id)
    )
    ''')

    # Create Suggestion table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS Suggestion (
        id TEXT PRIMARY KEY NOT NULL,
        documentId TEXT NOT NULL,
        documentCreatedAt TIMESTAMP NOT NULL,
        originalText TEXT NOT NULL,
        suggestedText TEXT NOT NULL,
        description TEXT,
        isResolved INTEGER NOT NULL DEFAULT 0,
        userId TEXT NOT NULL,
        createdAt TIMESTAMP NOT NULL,
        FOREIGN KEY (userId) REFERENCES User(id),
        FOREIGN KEY (documentId) REFERENCES Document(id)
    )
    ''')

    conn.commit()
    conn.close()
    print("Tables created successfully!")

if __name__ == "__main__":
    create_tables() 