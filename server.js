const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('./'));

const DB_FILE = path.join(__dirname, 'shipments.json');

// Initialize database file
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([
    {
      trackingNumber: "AF-2024-00123",
      sender: "Lagos, Nigeria",
      destination: "London, UK",
      service: "Air Freight",
      weight: "245 kg",
      status: "in-transit",
      estimatedDelivery: "May 24, 2026",
      steps: [
        { label: "Shipment Picked Up", location: "Lagos, Nigeria", date: "May 18, 2026", time: "09:30 AM", done: true },
        { label: "Departed Origin", location: "Murtala Muhammed Airport, Lagos", date: "May 19, 2026", time: "02:15 AM", done: true },
        { label: "Arrived Hub", location: "Dubai International Airport, UAE", date: "May 20, 2026", time: "11:45 AM", done: true },
        { label: "Customs Clearance", location: "Heathrow Airport, London", date: "May 21, 2026", time: "08:00 AM", done: true },
        { label: "Out for Delivery", location: "London Distribution Centre", date: "May 24, 2026", time: "Pending", done: false },
        { label: "Delivered", location: "London, UK", date: "May 24, 2026", time: "Pending", done: false }
      ]
    },
    {
      trackingNumber: "AF-2024-00456",
      sender: "Shanghai, China",
      destination: "New York, USA",
      service: "Sea Freight",
      weight: "12,400 kg",
      status: "delivered",
      estimatedDelivery: "May 20, 2026",
      steps: [
        { label: "Shipment Picked Up", location: "Shanghai, China", date: "May 1, 2026", time: "10:00 AM", done: true },
        { label: "Departed Origin", location: "Port of Shanghai", date: "May 3, 2026", time: "06:00 AM", done: true },
        { label: "In Transit", location: "Pacific Ocean", date: "May 10, 2026", time: "All Day", done: true },
        { label: "Arrived Port", location: "Port of New York, USA", date: "May 18, 2026", time: "03:30 PM", done: true },
        { label: "Customs Clearance", location: "New York Customs", date: "May 19, 2026", time: "09:00 AM", done: true },
        { label: "Delivered", location: "New York, USA", date: "May 20, 2026", time: "02:45 PM", done: true }
      ]
    },
    {
      trackingNumber: "AF-2024-00789",
      sender: "Dubai, UAE",
      destination: "Nairobi, Kenya",
      service: "Road Freight",
      weight: "3,200 kg",
      status: "pending",
      estimatedDelivery: "May 28, 2026",
      steps: [
        { label: "Shipment Booked", location: "Dubai, UAE", date: "May 22, 2026", time: "11:00 AM", done: true },
        { label: "Pickup Scheduled", location: "Dubai Logistics City", date: "May 23, 2026", time: "Pending", done: false },
        { label: "In Transit", location: "En Route", date: "May 24, 2026", time: "Pending", done: false },
        { label: "Customs Clearance", location: "Nairobi, Kenya", date: "May 27, 2026", time: "Pending", done: false },
        { label: "Out for Delivery", location: "Nairobi Distribution", date: "May 28, 2026", time: "Pending", done: false },
        { label: "Delivered", location: "Nairobi, Kenya", date: "May 28, 2026", time: "Pending", done: false }
      ]
    }
  ], null, 2));
}

// Helper functions
function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Track a shipment
app.get('/api/track/:trackingNumber', (req, res) => {
  const shipments = readDB();
  const shipment = shipments.find(s =>
    s.trackingNumber === req.params.trackingNumber.toUpperCase()
  );
  if (!shipment) {
    return res.status(404).json({ message: 'Shipment not found' });
  }
  res.json(shipment);
});

// Get all shipments
app.get('/api/shipments', (req, res) => {
  res.json(readDB());
});

// Add a shipment
app.post('/api/shipments', (req, res) => {
  const shipments = readDB();
  const exists = shipments.find(s => s.trackingNumber === req.body.trackingNumber);
  if (exists) {
    return res.status(400).json({ message: 'Tracking number already exists' });
  }
  shipments.push(req.body);
  writeDB(shipments);
  res.status(201).json({ message: 'Shipment created', shipment: req.body });
});

// Update a shipment
app.put('/api/shipments/:trackingNumber', (req, res) => {
  const shipments = readDB();
  const index = shipments.findIndex(s =>
    s.trackingNumber === req.params.trackingNumber.toUpperCase()
  );
  if (index === -1) {
    return res.status(404).json({ message: 'Shipment not found' });
  }
  shipments[index] = { ...shipments[index], ...req.body };
  writeDB(shipments);
  res.json({ message: 'Shipment updated', shipment: shipments[index] });
});

// Delete a shipment
app.delete('/api/shipments/:trackingNumber', (req, res) => {
  const shipments = readDB();
  const filtered = shipments.filter(s =>
    s.trackingNumber !== req.params.trackingNumber.toUpperCase()
  );
  writeDB(filtered);
  res.json({ message: 'Shipment deleted' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Aurum Freight server running on port ${PORT}`);
  console.log(`✅ JSON Database ready`);
  console.log(`📦 Test: http://localhost:3000/api/track/AF-2024-00123`);
});