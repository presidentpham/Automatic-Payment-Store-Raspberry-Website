const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'phuongpham',
  database: 'rfid_payment_system'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connect error:', err);
    return;
  }
  console.log('MySQL connect successfully.');
});


async function addUser(username, plainPassword) {
  try {

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const query = 'INSERT INTO admin (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error when add admin:', err);
        return;
      }
      console.log('Admin added successfully:', result);

      db.end((endErr) => {
        if (endErr) {
          console.error('MySQL stop connect error:', endErr);
          return;
        }
        console.log('MySQL stop connect successfully');
      });
    });
  } catch (error) {
    console.error('Error encript password:', error);
  }
}

addUser('phuongpham', '123456');
