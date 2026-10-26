const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

const PORT = 3000;

const DATA_FILE = path.join(__dirname, 'data.json');
const jsonData = require('./data.json');
app.use(express.json());
app.use(express.static(__dirname));

// Retrieve all data
app.get("/api/reservations", (req, res) => {
    res.json(jsonData);
});

// Retrieve one reservation through id
app.get("/api/reservations/:id", (req, res) => {
    const id = Number(req.params.id);

    const reservation = jsonData.find(item => item.id === id);

    if (!reservation) {
        return res.status(404).json({
            message: "Reservation not found"
        });
    }

    res.json(reservation);
});

// Add a new reservation
app.post("/api/reservations", (req, res) => {
    const { name, lab, date, seats, purpose } = req.body;

    // Check required fields
    if (!name || !lab || !date || !seats || !purpose) {
        return res.status(400).json({
            message: "Name, lab, date, seats, purpose are required"
        });
    }

    if (seats < 1) {
        return res.status(400).json({
            message: "You must reserve at least 1 seat"
        });
    }

    if (seats > 30) {
        return res.status(400).json({
            message: "You may only reserve up to 30 seats"
        });
    }

    // Automatically assign the next ID
    const newReservation = {
        id: jsonData.length > 0
            ? Math.max(...jsonData.map(reservation => reservation.id)) + 1
            : 1,
        name: name,
        lab: lab,
        date: date,
        seats: Number(seats),
        purpose: purpose
    };

    jsonData.push(newReservation);

    res.status(201).json(newReservation);
});

// Delete one reservation through id
app.delete("/api/reservations/:id", (req, res) => {
    const id = Number(req.params.id);

    const reservationIndex = jsonData.findIndex(item => String(item.id) === String(id));

    if (reservationIndex === -1) {
        return res.status(404).json({
            message: "Reservation not found"
        });
    }

    jsonData.splice(reservationIndex, 1);

    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(jsonData, null, 2), 'utf-8');

        return res.status(200).json({
            message: `Reservation with ID ${id} has been successfully deleted.`
        });
    } catch (error) {
        console.error("Failed to write to data.json:", error);
        return res.status(500).json({
            message: "Server failed to save database updates."
        });
    }
});

app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});