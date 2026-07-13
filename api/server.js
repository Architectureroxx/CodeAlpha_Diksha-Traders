const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());
// Serve static assets from the root directory
app.use(express.static(path.join(__dirname, '../')));

// Simplified Inventory Catalog
const products = [
    { id: 1, name: "Archit Pant", category: "Pant", price: 450, brand: "Archit", stock: 120, img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500" },
    { id: 2, name: "RNG Jeans", category: "Jeans", price: 700, brand: "RNG", stock: 150, img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500" },
    { id: 3, name: "Maxi", category: "Legi", price: 350, brand: "Self Manufacturing (Suresh Collection / Suraj)", stock: 200, img: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=500" },
    { id: 4, name: "Vardhaman Shirt", category: "Shirt", price: 400, brand: "Vardhaman", stock: 110, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500" },
    { id: 5, name: "Sardara Kurta", category: "Kurta", price: 800, brand: "Sardara", stock: 45, img: "https://images.unsplash.com/photo-1647661905663-e5eeab45f778?w=500" },
    { id: 6, name: "Reewaz Kurta", category: "Kurta", price: 950, brand: "Reewaz", stock: 70, img: "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=500" }
];

let users = [];
let orders = [];
let supportTickets = [];

// Configured with your specific 16-character Google App Password
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'upendrav13@gmail.com',
        pass: 'kasw rzwe xixm ahbh' 
    }
});

app.get('/api/products', (req, res) => res.json(products));

app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ success: false, message: "All fields are required." });
    if (users.find(u => u.username === username || u.email === email)) {
        return res.status(400).json({ success: false, message: "Merchant credentials already exist." });
    }
    users.push({ username, email, password });
    return res.status(201).json({ success: true });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials." });
    return res.json({ success: true, user: { username: user.username, email: user.email } });
});

// Process Orders + Automated Invoice Delivery
app.post('/api/orders', async (req, res) => {
    const { items, totalAmount, username, email } = req.body;
    const orderId = "DT-" + Math.floor(100000 + Math.random() * 900000);
    const newOrder = { orderId, username: username || "Guest", email: email || "upendrav13@gmail.com", items, totalAmount, date: new Date().toISOString().split('T')[0] };
    
    orders.push(newOrder);

    let rows = items.map(i => `<li>${i.name} (Qty: ${i.qty}) - ₹${i.price * i.qty}</li>`).join('');
    const mailOptions = {
        from: '"Diksha Traders" <upendrav13@gmail.com>',
        to: `${newOrder.email}, upendrav13@gmail.com`,
        subject: `Wholesale Order Confirmation [${orderId}]`,
        html: `<h3>Diksha Traders Invoice Summary</h3><p>Order ID: ${orderId}</p><ul>${rows}</ul><h4>Total Paid: ${totalAmount}</h4>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, order: newOrder, emailSent: true });
    } catch (err) {
        res.json({ success: true, order: newOrder, emailSent: false, error: err.message });
    }
});

app.get('/api/orders/:username', (req, res) => {
    res.json(orders.filter(o => o.username === req.params.username));
});

// Customer Support Ticket Pipeline
app.post('/api/support', (req, res) => {
    const { name, email, message } = req.body;
    const ticketId = "TK-" + Math.floor(1000 + Math.random() * 9000);
    supportTickets.push({ ticketId, name, email, message, date: new Date().toLocaleDateString() });
    res.json({ success: true, ticketId });
});

// Built-in AI Chatbot Knowledge System
app.post('/api/chatbot', (req, res) => {
    const msg = req.body.message.toLowerCase();
    let reply = "Thank you for contacting Diksha Traders support. For urgent distribution orders, call us directly at +91 9839183050.";
    
    if (msg.includes("address") || msg.includes("location") || msg.includes("plaza")) {
        reply = "Diksha Traders is located at Krishna Plaza, near Manjushree Talkies.";
    } else if (msg.includes("contact") || msg.includes("phone") || msg.includes("mobile")) {
        reply = "You can reach out to our helpdesk at +91 9839183050 or email us via upendrav13@gmail.com.";
    } else if (msg.includes("pant") || msg.includes("jeans") || msg.includes("shirt") || msg.includes("kurta")) {
        reply = "We offer bulk custom variants of Archit Pants, RNG Jeans, Vardhaman Shirts, and Sardara/Reewaz Kurtas.";
    } else if (msg.includes("wholesale") || msg.includes("price")) {
        reply = "All system pricing tables list our specific base wholesale rates in fixed Rupees.";
    }
    res.json({ reply });
});

// FIXED: Adjusted to reference one level up since this file now lives inside the /api folder
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// EXPORT: Required for Vercel serverless environment execution
module.exports = app;