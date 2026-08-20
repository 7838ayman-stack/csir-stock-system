let selectedItemId = null;

const API_URL = "https://csir-canteen-backend.onrender.com";

// ---------------- LOGIN ----------------
function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {

        if (data.message === "Login Successful") {
            localStorage.setItem("admin", data.admin);
            window.location.href = "dashboard.html";
        } else {
            document.getElementById("msg").innerText = data.message;
        }

    })
    .catch(err => {
        console.log(err);
        document.getElementById("msg").innerText = "Server Error";
    });
}


// ---------------- AUTO LOAD DASHBOARD ----------------
if (window.location.pathname.includes("dashboard.html")) {
    loadDashboard();
}


// ---------------- DASHBOARD ----------------
function loadDashboard() {

    const admin = localStorage.getItem("admin");

    if (!admin) {
        window.location.href = "index.html";
        return;
    }

    const welcome = document.getElementById("welcome");

    if (welcome) {
        welcome.innerText = "Welcome, " + admin;
    }

    // Dashboard statistics
    fetch(`${API_URL}/api/dashboard`)
        .then(res => res.json())
        .then(data => {

            const totalItems = document.getElementById("totalItems");
            const lowStock = document.getElementById("lowStock");

            if (totalItems) {
                totalItems.innerText = data.totalItems;
            }

            if (lowStock) {
                lowStock.innerText = data.lowStockItems;
            }

        })
        .catch(err => {
            console.log("Dashboard error:", err);
        });


    // Low stock items
    fetch(`${API_URL}/api/items/low-stock`)
        .then(res => res.json())
        .then(data => {

            let html = "";

            if (data.length === 0) {

                html = `<tr><td colspan="3">No low stock items 🎉</td></tr>`;

            } else {

                data.forEach(item => {

                    html += `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.stock_quantity}</td>
                            <td>${item.unit}</td>
                        </tr>
                    `;

                });

            }

            const table = document.getElementById("lowStockTable");

            if (table) {
                table.innerHTML = html;
            }

        })
        .catch(err => {
            console.log("Low stock error:", err);
        });
}


// ---------------- TOGGLE LOW STOCK ----------------
function toggleLowStock() {

    const section = document.getElementById("lowStockSection");

    if (section) {
        section.classList.toggle("hidden");
    }
}


// ---------------- SEARCH ----------------
function searchItems() {

    const input = document.getElementById("itemSearch");

    if (!input) return;

    const name = input.value.toLowerCase();

    fetch(`${API_URL}/api/items`)
        .then(res => res.json())
        .then(data => {

            const filtered = data.filter(item =>
                item.name.toLowerCase().includes(name)
            );

            let html = "";

            filtered.forEach(item => {

                html += `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.stock_quantity}</td>
                        <td>${item.unit}</td>
                        <td style="position:relative;">

                            <button
                                class="menu-btn"
                                onclick="openMenu(event, ${item.id})">
                                ⋮
                            </button>

                            <div
                                id="menu-${item.id}"
                                class="dropdown-menu hidden">

                                <button onclick="increasePrompt(${item.id})">
                                    ➕ Increase
                                </button>

                                <button onclick="decreasePrompt(${item.id})">
                                    ➖ Decrease
                                </button>

                                <button onclick="deleteItem(${item.id})">
                                    🗑 Delete
                                </button>

                            </div>

                        </td>
                    </tr>
                `;

            });

            const table = document.getElementById("itemsTable");

            if (table) {
                table.innerHTML = html;
            }

        })
        .catch(err => {
            console.log("Search error:", err);
        });
}


// ---------------- DELETE ITEM ----------------
function deleteItem(id) {

    if (!confirm("Are you sure you want to delete this item?")) {
        return;
    }

    fetch(`${API_URL}/api/items/${id}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {

        alert(data.message);

        loadItemsPage();
        loadDashboard();

    })
    .catch(err => {

        console.log(err);
        alert("Error deleting item");

    });
}


// ---------------- ADD ITEM ----------------
function addItem() {

    const name = document.getElementById("itemName").value;
    const stock_quantity = document.getElementById("itemStock").value;
    const unit = document.getElementById("itemUnit").value;

    fetch(`${API_URL}/api/items`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            stock_quantity,
            unit
        })
    })
    .then(res => res.json())
    .then(data => {

        const msg = document.getElementById("addMsg");

        if (msg) {
            msg.innerText = data.message;
        }

        if (data.message === "Item Added Successfully") {

            document.getElementById("itemName").value = "";
            document.getElementById("itemStock").value = "";
            document.getElementById("itemUnit").value = "";

            loadDashboard();
            loadItemsPage();
        }

        setTimeout(() => {

            if (msg) {
                msg.innerText = "";
            }

        }, 3000);

    })
    .catch(err => {

        console.log(err);

        const msg = document.getElementById("addMsg");

        if (msg) {
            msg.innerText = "Error adding item";
        }

    });
}


// ---------------- LOGOUT ----------------
function logout() {

    localStorage.removeItem("admin");

    window.location.href = "index.html";
}


// ---------------- OPEN ITEMS PAGE ----------------
function openItemsPage() {

    window.location.href = "items.html";
}


// ---------------- LOAD ITEMS PAGE ----------------
function loadItemsPage() {

    fetch(`${API_URL}/api/items`)
        .then(res => res.json())
        .then(data => {

            let html = "";

            data.forEach(item => {

                html += `
                    <tr>

                        <td>${item.name}</td>

                        <td>${item.stock_quantity}</td>

                        <td>${item.unit}</td>

                        <td style="position:relative;">

                            <button
                                class="menu-btn"
                                onclick="openMenu(event, ${item.id})">
                                ⋮
                            </button>

                            <div
                                id="menu-${item.id}"
                                class="dropdown-menu hidden">

                                <button
                                    onclick="increasePrompt(${item.id})">
                                    ➕ Increase
                                </button>

                                <button
                                    onclick="decreasePrompt(${item.id})">
                                    ➖ Decrease
                                </button>

                                <button
                                    onclick="deleteItem(${item.id})">
                                    🗑 Delete
                                </button>

                            </div>

                        </td>

                    </tr>
                `;

            });

            const table = document.getElementById("itemsTable");

            if (table) {
                table.innerHTML = html;
            }

        })
        .catch(err => {

            console.log(err);

            const table = document.getElementById("itemsTable");

            if (table) {
                table.innerHTML =
                    "<tr><td colspan='4'>Error loading items</td></tr>";
            }

        });
}


// ---------------- LOAD LOW STOCK PAGE ----------------
function loadLowStockPage() {

    fetch(`${API_URL}/api/items/low-stock`)
        .then(res => res.json())
        .then(data => {

            let html = "";

            if (data.length === 0) {

                html =
                    `<tr><td colspan="3">No low stock items 🎉</td></tr>`;

            } else {

                data.forEach(item => {

                    html += `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.stock_quantity}</td>
                            <td>${item.unit}</td>
                        </tr>
                    `;

                });

            }

            const table = document.getElementById("lowStockTable");

            if (table) {
                table.innerHTML = html;
            }

        })
        .catch(err => {
            console.log(err);
        });
}


// ---------------- OPEN LOW STOCK PAGE ----------------
function openLowStockPage() {

    window.location.href = "lowstock.html";
}


// ---------------- TOGGLE MENU ----------------
function toggleMenu(id) {

    const menu = document.getElementById(`menu-${id}`);

    if (!menu) return;

    document.querySelectorAll(".dropdown-menu").forEach(m => {

        if (m !== menu) {
            m.classList.add("hidden");
        }

    });

    menu.classList.toggle("hidden");
}


// ---------------- INCREASE PROMPT ----------------
function increasePrompt(id) {

    const value = prompt("Enter stock to ADD:");

    if (value === null || value === "") {
        return;
    }

    const quantity = Number(value);

    if (isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid positive number.");
        return;
    }

    changeStock(id, quantity);
}


// ---------------- DECREASE PROMPT ----------------
function decreasePrompt(id) {

    const value = prompt("Enter stock to REMOVE:");

    if (value === null || value === "") {
        return;
    }

    const quantity = Number(value);

    if (isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid positive number.");
        return;
    }

    changeStock(id, -quantity);
}


// ---------------- CHANGE STOCK ----------------
function changeStock(id, change) {

    fetch(`${API_URL}/api/items`)
        .then(res => res.json())
        .then(data => {

            const item = data.find(i => i.id === id);

            if (!item) {
                alert("Item not found.");
                return;
            }

            const newStock =
                Number(item.stock_quantity) + Number(change);

            if (newStock < 0) {
                alert("Stock cannot go below 0.");
                return;
            }

            return fetch(`${API_URL}/api/items/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    stock_quantity: newStock
                })
            });

        })
        .then(res => {

            if (!res) return null;

            return res.json();

        })
        .then(data => {

            if (!data) return;

            alert(data.message);

            loadItemsPage();
            loadDashboard();

            const actionMenu =
                document.getElementById("actionMenu");

            if (actionMenu) {
                actionMenu.classList.add("hidden");
            }

        })
        .catch(err => {

            console.log(err);
            alert("Error updating stock");

        });
}


// ---------------- OPEN ACTION MENU ----------------
function openMenu(event, itemId) {

    selectedItemId = itemId;

    const menu = document.getElementById("actionMenu");

    if (!menu) return;

    menu.style.left = (event.pageX + 10) + "px";
    menu.style.top = (event.pageY + 10) + "px";

    menu.classList.remove("hidden");
}


// ---------------- CLOSE ACTION MENU ----------------
document.addEventListener("click", function (event) {

    const menu = document.getElementById("actionMenu");

    if (!menu) return;

    const isClickInsideMenu =
        menu.contains(event.target);

    const isClickOnButton =
        event.target.closest(".menu-btn");

    if (!isClickInsideMenu && !isClickOnButton) {
        menu.classList.add("hidden");
    }

});


// ---------------- UPDATE STOCK DIRECTLY ----------------
function updateStock(id, newStock) {

    if (newStock < 0) {
        alert("Stock cannot go below 0");
        return;
    }

    fetch(`${API_URL}/api/items/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            stock_quantity: newStock
        })
    })
    .then(res => res.json())
    .then(data => {

        alert(data.message);

        loadItemsPage();
        loadDashboard();

        const actionMenu =
            document.getElementById("actionMenu");

        if (actionMenu) {
            actionMenu.classList.add("hidden");
        }

    })
    .catch(err => {

        console.log(err);
        alert("Error updating stock");

    });
}


// ---------------- INCREASE STOCK ----------------
function increaseStock() {

    const value = prompt("Enter quantity to ADD:");

    if (value === null || value === "") {
        return;
    }

    const quantity = Number(value);

    if (isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid positive number.");
        return;
    }

    fetch(`${API_URL}/api/items`)
        .then(res => res.json())
        .then(data => {

            const item = data.find(i => i.id === selectedItemId);

            if (!item) {
                alert("Item not found.");
                return;
            }

            const newStock =
                Number(item.stock_quantity) + quantity;

            updateStock(selectedItemId, newStock);

        })
        .catch(err => {

            console.log(err);
            alert("Error loading item.");

        });
}


// ---------------- DECREASE STOCK ----------------
function decreaseStock() {

    const value = prompt("Enter quantity to REMOVE:");

    if (value === null || value === "") {
        return;
    }

    const quantity = Number(value);

    if (isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid positive number.");
        return;
    }

    fetch(`${API_URL}/api/items`)
        .then(res => res.json())
        .then(data => {

            const item = data.find(i => i.id === selectedItemId);

            if (!item) {
                alert("Item not found.");
                return;
            }

            const newStock =
                Number(item.stock_quantity) - quantity;

            if (newStock < 0) {
                alert("Stock cannot go below 0");
                return;
            }

            updateStock(selectedItemId, newStock);

        })
        .catch(err => {

            console.log(err);
            alert("Error loading item.");

        });
}


// ---------------- LOAD HISTORY ----------------
function loadHistory() {

    fetch(`${API_URL}/api/history`)
        .then(res => res.json())
        .then(data => {

            let html = "";

            data.forEach(item => {

                const formattedDate =
                    new Date(item.created_at)
                        .toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                        });

                html += `
                    <tr>
                        <td>${item.item_name}</td>
                        <td>${item.change_quantity}</td>
                        <td>${item.final_stock}</td>
                        <td>${item.action_type}</td>
                        <td>${formattedDate}</td>
                    </tr>
                `;
            });

            const table =
                document.getElementById("historyTable");

            if (table) {
                table.innerHTML = html;
            }

        })
        .catch(err => {
            console.log("History error:", err);
        });
}


// ---------------- OPEN HISTORY ----------------
function openHistory() {

    window.location.href = "history.html";
}


// ---------------- RESET ITEMS SEARCH ----------------
function resetItems() {

    const input =
        document.getElementById("itemSearch");

    if (input) {
        input.value = "";
    }

    loadItemsPage();
}