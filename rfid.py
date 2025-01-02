import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
import mysql.connector
import time
from RPLCD.i2c import CharLCD
import threading
from gpiozero import Servo
from time import sleep

# Initialize servo on GPIO 18
servo = Servo(18)


# Initialize the RFID reader
reader = SimpleMFRC522()

# Initialize the I2C LCD (adjust the I2C address if necessary)
lcd = CharLCD(i2c_expander='PCF8574', address=0x27, port=1)

GPIO.setwarnings(False)

# Connect to the MySQL database
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="phuongpham",
    database="rfid_payment_system"
)
cursor = db.cursor()


def check_and_update_status():
    """Check the most recent transaction and update the LCD."""
    query_latest_transaction = """
        SELECT id, customer_rftag, payment_status 
        FROM transactions 
        ORDER BY created_at DESC 
        LIMIT 1
    """
    cursor.execute(query_latest_transaction)
    latest_transaction = cursor.fetchone()

    if latest_transaction:
        transaction_id, customer_rftag, payment_status = latest_transaction

        # If payment_status is 'waiting', ask user to place the card
        if payment_status == 'waiting':
            lcd.clear()
            lcd.cursor_pos = (0, 0)
            lcd.write_string("Please checkout")
            lcd.cursor_pos = (1, 0)
            lcd.write_string("Place your card")
            print("Waiting for customer to place their card...")

            # Wait for card to be placed
            uid, text = reader.read()
            rfid_code = str(uid)
            print(f"Card detected: {rfid_code}")

            # Check if card matches customer in the 'customers' table
            query_customer = "SELECT id FROM customers WHERE rfid_tag = %s"
            cursor.execute(query_customer, (rfid_code,))
            result = cursor.fetchone()

            if result:
                # If card matches a customer, update the transaction and set payment_status to 'success'
                update_transaction = """
                    UPDATE transactions 
                    SET payment_status = 'success', customer_rftag = %s 
                    WHERE id = %s
                """
                cursor.execute(update_transaction, (rfid_code, transaction_id))
                db.commit()  # Commit the changes to the database

                lcd.clear()
                lcd.cursor_pos = (0, 0)
                lcd.write_string("Payment success!")
                print("Payment marked as success.")
                rotate_servo()
                return
            else:
                lcd.clear()
                lcd.cursor_pos = (0, 0)
                lcd.write_string("Invalid card")
                print("RFID tag does not exist in customers table.")
                return
        else:
            lcd.clear()
            lcd.cursor_pos = (0, 0)
            lcd.write_string("No active txn")
            print("No active transaction.")
            return
    else:
        lcd.clear()
        lcd.cursor_pos = (0, 0)
        lcd.write_string("No transaction found")
        print("No transaction found.")
        return


def welcome():
    try:
        # Read RFID card
        uid, text = reader.read()
        rfid_code = str(uid)

        # Query the database
        query = "SELECT name FROM customers WHERE rfid_tag = %s"
        cursor.execute(query, (rfid_code,))
        result = cursor.fetchone()

        # Check if card is recognized
        if result:
            customer_name = result[0]
            print(f"Customer: {customer_name}")
            lcd.clear()
            lcd.cursor_pos=(0, 4)
            lcd.write_string(f"Welcome")
            lcd.cursor_pos=(1,0)
            lcd.write_string(customer_name)
            rotate_servo()
            return
        else:
            print("Unknown card")
            lcd.clear()
            lcd.cursor_pos=(0, 0)
            lcd.write_string("Unknown card")
            return

    except Exception as e:
        print(f"Error reading card: {e}")
        lcd.clear()
        lcd.cursor_pos=(0,0)
        lcd.write_string("Error reading card")
        return

    time.sleep(1)



def get_latest_transaction_status(conn):
    """
    Retrieve the payment_status from the most recent transaction
    Maintain the MySQL connection.
    """
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT payment_status 
            FROM transactions 
            ORDER BY created_at DESC 
            LIMIT 1
        """)
        result = cursor.fetchone()
        return result['payment_status'] if result else None
    except mysql.connector.Error as err:
        print(f"MySQL query error: {err}")
        return None
    finally:
        cursor.close()

def monitor_database():
    """
    Monitor payment_status and call function B when necessary.
    """
    last_status = None  # Status from the previous check
    conn = None

    try:
        conn = db  # Single connection
        print("Connected to MySQL, starting monitoring...")

        while True:
            welcome()  # Function A runs continuously

            # Retrieve the payment_status of the most recent transaction
            current_status = get_latest_transaction_status(conn)

            if current_status != last_status:
                print(f"New status: {current_status}")
                last_status = current_status

                # Call function B if the status is 'waiting'
                if current_status == 'waiting':
                    check_and_update_status()

            time.sleep(1)  # Wait 1 second before the next check

    except mysql.connector.Error as err:
        print(f"MySQL connection error: {err}")
    finally:
        if conn.is_connected():
            conn.close()
            print("MySQL connection closed.")


def rotate_servo():
    try:
        # Move to 90 degrees
        print("Rotating to 90 degrees...")
        servo.value = 0  # Middle position corresponds to 90 degrees
        sleep(5)

        # Return to initial position
        print("Returning to initial position...")
        servo.value = -1  # Minimum position corresponds to 0 degrees
    except Exception as e:
        print(f"An error occurred: {e}")
        
        
if __name__ == "__main__":
    monitor_database()



