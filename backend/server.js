const cors = require("cors");
const express = require("express");
const connection = require("./db/connection");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Home Route
app.get("/", (req, res) => {
    res.send("Welcome to CSIR Canteen Stock Management System");
});

// Items API
app.get("/api/items", (req, res) => {

    connection.query(
        "SELECT * FROM items",
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(results);

        }
    );

});
app.post("/api/items", (req, res) => {

    let { name, stock_quantity, unit } = req.body;

    stock_quantity = Number(stock_quantity);

    if (!name || !unit || isNaN(stock_quantity) || stock_quantity < 0) {
        return res.status(400).json({ message: "Invalid Input Data" });
    }

    const query =
        "INSERT INTO items (name, stock_quantity, unit) VALUES (?, ?, ?)";

    connection.query(query, [name, stock_quantity, unit], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message });
        }

        res.json({ message: "Item Added Successfully" });

    });

});

app.put("/api/items/:id", (req, res) => {

    const id = req.params.id;
    const { stock_quantity } = req.body;

    if (stock_quantity < 0) {
        return res.status(400).json({
            message: "Stock cannot be negative"
        });
    }

    // Step 1: get item details first
    connection.query(
        "SELECT * FROM items WHERE id = ?",
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const item = result[0];

            const oldStock = item.stock_quantity;
            const newStock = stock_quantity;

            let change = newStock - oldStock;

            let actionType = change >= 0 ? "INCREASE" : "DECREASE";

            // Step 2: update stock
            connection.query(
                "UPDATE items SET stock_quantity = ? WHERE id = ?",
                [newStock, id],
                (err2) => {

                    if (err2) {
                        return res.status(500).json({ error: err2.message });
                    }

                    // Step 3: insert history
                    connection.query(
                        `INSERT INTO stock_history 
                        (item_name, change_quantity, final_stock, action_type)
                        VALUES (?, ?, ?, ?)`,
                        [
                            item.name,
                            change,
                            newStock,
                            actionType
                        ]
                    );

                    res.json({
                        message: "Stock Updated Successfully"
                    });

                }
            );
        }
    );
});

app.delete("/api/items/:id", (req, res) => {

    const id = req.params.id;

    const query =
        "DELETE FROM items WHERE id = ?";

    connection.query(
        query,
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Item Deleted Successfully"
            });

        }
    );

});

app.get("/api/items/low-stock", (req, res) => {

    const query =
        "SELECT * FROM items WHERE stock_quantity < 5";

    connection.query(
        query,
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(results);

        }
    );

});

app.get("/api/items/search", (req, res) => {

    const name = req.query.name;

    const query =
        "SELECT * FROM items WHERE name LIKE ?";

    connection.query(
        query,
        [`%${name}%`],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(results);

        }
    );

});

app.get("/api/dashboard", (req, res) => {

    connection.query(
        "SELECT COUNT(*) AS totalItems FROM items",
        (err, totalResult) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            connection.query(
                "SELECT COUNT(*) AS lowStockItems FROM items WHERE stock_quantity < 10",
                (err, lowStockResult) => {

                    if (err) {
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    res.json({
                        totalItems: totalResult[0].totalItems,
                        lowStockItems: lowStockResult[0].lowStockItems
                    });

                }
            );

        }
    );

});

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    // check empty input
    if (!username || !password) {
        return res.status(400).json({
            message: "Username and Password required"
        });
    }

    const sql = "SELECT * FROM admins WHERE username = ? AND password = ?";

    connection.query(sql, [username, password], (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Server Error",
                error: err.message
            });
        }

        if (result.length > 0) {
            return res.json({
                message: "Login Successful",
                admin: result[0].username
            });
        } else {
            return res.status(401).json({
                message: "Invalid Credentials"
            });
        }

    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


app.get("/api/history", (req, res) => {
    const { action_type, item_name, startDate, endDate } = req.query;
    
    let query = "SELECT * FROM stock_history WHERE 1=1";
    let params = [];

    if (action_type) {
        query += " AND action_type = ?";
        params.push(action_type);
    }

    if (item_name) {
        query += " AND item_name LIKE ?";
        params.push(`%${item_name}%`);
    }

    if (startDate && endDate) {
        query += " AND DATE(created_at) BETWEEN ? AND ?";
        params.push(startDate, endDate);
    }

    query += " ORDER BY created_at DESC";

    connection.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});
