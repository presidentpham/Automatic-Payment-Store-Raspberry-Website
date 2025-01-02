const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'phuongpham',
  database: 'rfid_payment_system'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// API Collect product list
app.get('/', async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM products');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// API Show all bills for admin
app.get('/bills', async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM transactions');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/cart', async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM transaction_items');
    res.json(results);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
}); 

app.post('/add-products', async (req, res) => {
  const { name, description, price, image_url } = req.body;

  // check exits ?
  if (!name || !description || !price || !image_url) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // print value for debugging
  console.log('Received product data:', { name, description, price, image_url });

  const sql = 'INSERT INTO products (name, description, price, image_url) VALUES (?, ?, ?, ?)';
  
  try {
    // Data querying
    await db.promise().query(sql, [name, description, price, image_url]);

    // Data querying success
    res.status(201).json({ message: 'Product added successfully' });
  } catch (err) {
    // Data querying error
    console.error('Error inserting product:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/edit-product/:id', async (req, res) => {
  const { id } = req.params;  
  const { name, description, price, image_url } = req.body;  

  const sql = `
    UPDATE products 
    SET name = ?, description = ?, price = ?, image_url = ? 
    WHERE id = ?;
  `;

  try {
    await db.promise().query(sql, [name, description, price, image_url, id]);

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.delete('/delete-product/:id', async (req, res) => {
  const { id } = req.params;  

  const sql = 'DELETE FROM products WHERE id = ?';

  try {

    await db.promise().query(sql, [id]);

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    db.query('SELECT * FROM admin WHERE username = ?', [username], async (err, results) => {
      if (err) {
        console.error('Data querying error:', err);
        return res.status(500).json({ message: 'Data querying error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Incorrect username or password' });
      }

      const user = results[0];
      const match = await bcrypt.compare(password, user.password);  

      if (!match) {
        return res.status(401).json({ message: 'Incorrect username or password' });
      }

      res.status(200).json({ message: 'Login successfully' });
    });
  } catch (error) {
    console.error('Login error !:', error);
    res.status(500).json({ message: 'Error in server' });
  }
}); 

// ExpressJS API route
app.post('/transaction_items', async (req, res) => {
  const { product_id, product_name, quantity, price, image_url } = req.body;

  if (!product_id || !product_name || !quantity || !price || !image_url) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Add to transaction_items
    const result = await db.promise().query(
      'INSERT INTO transaction_items (product_id, product_name, quantity, price, image_url) VALUES (?, ?, ?, ?, ?)',
      [product_id, product_name,  quantity, price, image_url]
    );
    res.status(201).json({ message: 'Product added to cart', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/checkout', async (req, res) => {
  const { product_ids } = req.body; 

  if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
    return res.status(400).json({ message: 'Missing or invalid product_ids' });
  }

  try {

    const [items] = await db.promise().query(
      `SELECT SUM(total) AS total_amount FROM transaction_items WHERE product_id IN (?)`,
      [product_ids]
    );

    const total_amount = items[0].total_amount;

    if (!total_amount) {
      return res.status(400).json({ message: 'No matching products found' });
    }

    const sql = 'INSERT INTO transactions (total_amount, payment_status) VALUES (?, ?)';
    await db.promise().query(sql, [total_amount, 'waiting']);

    const deleteSql = 'DELETE FROM transaction_items';
    await db.promise().query(deleteSql);

    res.status(201).json({ message: 'Checkout successful', total_amount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Server listen
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
