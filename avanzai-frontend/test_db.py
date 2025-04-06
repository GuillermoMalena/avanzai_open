import sqlite3
from datetime import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

def test_database():
    conn = sqlite3.connect('allie.db')
    cursor = conn.cursor()
    
    try:
        # 1. Create a test user
        user_id = generate_uuid()
        cursor.execute('''
        INSERT INTO User (id, email, password)
        VALUES (?, ?, ?)
        ''', (user_id, 'test@example.com', 'hashed_password_123'))
        print("✅ User created")

        # 2. Create a chat
        chat_id = generate_uuid()
        current_time = datetime.now().isoformat()
        cursor.execute('''
        INSERT INTO Chat (id, createdAt, userId, title, visibility, templates)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (chat_id, current_time, user_id, 'Test Chat', 'private', '{}'))
        print("✅ Chat created")

        # 3. Add messages
        message_id1 = generate_uuid()
        message_id2 = generate_uuid()
        cursor.execute('''
        INSERT INTO Message (id, chatId, role, content, createdAt)
        VALUES (?, ?, ?, ?, ?)
        ''', (message_id1, chat_id, 'user', 'Hello AI!', current_time))
        cursor.execute('''
        INSERT INTO Message (id, chatId, role, content, createdAt)
        VALUES (?, ?, ?, ?, ?)
        ''', (message_id2, chat_id, 'assistant', 'Hello! How can I help you today?', current_time))
        print("✅ Messages created")

        # 4. Add a vote
        cursor.execute('''
        INSERT INTO Vote (chatId, messageId, isUpvoted)
        VALUES (?, ?, ?)
        ''', (chat_id, message_id2, 1))
        print("✅ Vote added")

        # 5. Create a document
        doc_id = generate_uuid()
        cursor.execute('''
        INSERT INTO Document (id, createdAt, title, content, kind, userId, chatId, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (doc_id, current_time, 'Test Document', 'This is a test document', 'text', 
              user_id, chat_id, '{"version": 1}'))
        print("✅ Document created")

        # 6. Add a suggestion
        suggestion_id = generate_uuid()
        cursor.execute('''
        INSERT INTO Suggestion (id, documentId, documentCreatedAt, originalText, 
                              suggestedText, description, isResolved, userId, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (suggestion_id, doc_id, current_time, 'This is a test document',
              'This is an improved test document', 'Made it better', 0, user_id, current_time))
        print("✅ Suggestion created")

        # Verify the data
        print("\nVerifying data:")
        
        cursor.execute('SELECT email FROM User WHERE id = ?', (user_id,))
        print(f"User email: {cursor.fetchone()[0]}")
        
        cursor.execute('SELECT title FROM Chat WHERE id = ?', (chat_id,))
        print(f"Chat title: {cursor.fetchone()[0]}")
        
        cursor.execute('SELECT content FROM Message WHERE chatId = ?', (chat_id,))
        messages = cursor.fetchall()
        print(f"Messages: {[m[0] for m in messages]}")
        
        cursor.execute('SELECT isUpvoted FROM Vote WHERE chatId = ? AND messageId = ?', 
                      (chat_id, message_id2))
        print(f"Vote for message 2: {cursor.fetchone()[0]}")
        
        cursor.execute('SELECT title FROM Document WHERE id = ?', (doc_id,))
        print(f"Document title: {cursor.fetchone()[0]}")
        
        cursor.execute('SELECT suggestedText FROM Suggestion WHERE documentId = ?', (doc_id,))
        print(f"Suggestion text: {cursor.fetchone()[0]}")

        conn.commit()
        print("\n✅ All tests completed successfully!")

    except sqlite3.Error as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    test_database() 