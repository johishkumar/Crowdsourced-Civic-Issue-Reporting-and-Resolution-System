import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Database connection
const MONGODB_URI = 'mongodb://localhost:27017/';
mongoose.connect(MONGODB_URI, { dbName: 'SIH' })
  .then(() => {
    console.log('Successfully connected to MongoDB (SIH)');
    seedUsers();
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// ================= USER SCHEMA (CITIZEN, ADMIN, NGO) =================
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['citizen', 'admin', 'ngo'], default: 'citizen' },
  department: { type: String, default: '' },
  organization: { type: String, default: '' },
  points: { type: Number, default: 250 },
  badges: [{
    id: String,
    name: String,
    description: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  location: {
    city: { type: String, default: 'Ranchi' },
    state: { type: String, default: 'Jharkhand' }
  },
  language: { type: String, default: 'en' },
  notificationsEnabled: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// ================= ISSUE SCHEMA =================
const issueSchema = new mongoose.Schema({
  ticketId: String,
  title: String,
  description: String,
  category: String,
  status: { type: String, default: 'submitted' },
  priority: { type: String, default: 'medium' },
  isEmergency: { type: Boolean, default: false },
  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  reportedBy: {
    id: String,
    name: String,
    email: String
  },
  assignedTo: {
    id: String,
    name: String,
    department: String
  },
  images: [String],
  upvotes: { type: Number, default: 0 },
  comments: [{
    id: String,
    userId: String,
    userName: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  ratings: [{
    userId: String,
    userName: String,
    rating: Number,
    review: String,
    createdAt: { type: Date, default: Date.now }
  }],
  logs: [{
    id: String,
    status: String,
    action: String,
    updatedBy: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Issue = mongoose.model('Issue', issueSchema);

// ================= SEED INITIAL DEMO ACCOUNTS INTO MONGO DB =================
async function seedUsers() {
  try {
    const seedAccounts = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@demo.com',
        password: 'demo123',
        phone: '+911234567890',
        role: 'citizen',
        points: 250,
        badges: [
          { id: '1', name: 'First Reporter', description: 'Reported first issue', icon: '🏆' },
          { id: '2', name: 'Community Hero', description: 'Active community member', icon: '🦸' }
        ],
        location: { city: 'Khunti', state: 'Jharkhand' }
      },
      {
        name: 'Priya Singh',
        email: 'priya@demo.com',
        password: 'admin123',
        phone: '+911234567891',
        role: 'admin',
        department: 'Public Works'
      },
      {
        name: 'Priya Singh (Roads)',
        email: 'road_admin@demo.com',
        password: 'admin123',
        role: 'admin',
        department: 'Road Maintenance'
      },
      {
        name: 'Suresh Prasad (Sanitation)',
        email: 'garbage_admin@demo.com',
        password: 'admin123',
        role: 'admin',
        department: 'Garbage & Sanitation'
      },
      {
        name: 'Anil Tirkey (Water)',
        email: 'water_admin@demo.com',
        password: 'admin123',
        role: 'admin',
        department: 'Water Supply'
      },
      {
        name: 'Sanjay Mahato (Power)',
        email: 'electricity_admin@demo.com',
        password: 'admin123',
        role: 'admin',
        department: 'Electricity Dept'
      },
      {
        name: 'Ravi Mundu (Lighting)',
        email: 'streetlight_admin@demo.com',
        password: 'admin123',
        role: 'admin',
        department: 'Streetlight Dept'
      },
      {
        name: 'Inspector Oraon (Safety)',
        email: 'safety_admin@demo.com',
        password: 'admin123',
        role: 'admin',
        department: 'Public Safety'
      },
      {
        name: 'Karan Horo (Forestry)',
        email: 'parks_admin@demo.com',
        password: 'admin123',
        role: 'admin',
        department: 'Forestry Dept'
      },
      {
        name: 'Manoj Soren (Drainage)',
        email: 'drainage_admin@demo.com',
        password: 'admin123',
        role: 'admin',
        department: 'Drainage Dept'
      },
      {
        name: 'Asha Lakra (Environment)',
        email: 'noise_admin@demo.com',
        password: 'admin123',
        role: 'admin',
        department: 'Environment Dept'
      },
      {
        name: 'Jharkhand Green Foundation',
        email: 'ngo@demo.com',
        password: 'ngo123',
        phone: '+911234567892',
        role: 'ngo',
        organization: 'Jharkhand Green Welfare Trust'
      }
    ];

    for (const acc of seedAccounts) {
      const exists = await User.findOne({ email: acc.email });
      if (!exists) {
        await User.create(acc);
        console.log(`[MongoDB Seed] Created initial user: ${acc.email} (${acc.role})`);
      }
    }
  } catch (err) {
    console.error('Error seeding users:', err);
  }
}

// ================= USER & AUTH ROUTES =================

// Login API Endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    let user = await User.findOne({ email });

    // If user does not exist yet in MongoDB, create automatically
    if (!user) {
      user = await User.create({
        name: email.split('@')[0],
        email,
        password: password || 'default123',
        role: role || 'citizen',
        points: 100
      });
      console.log(`[MongoDB Auth] Created new user: ${email} (${user.role})`);
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        organization: user.organization,
        points: user.points,
        badges: user.badges,
        location: user.location,
        language: user.language,
        notificationsEnabled: user.notificationsEnabled
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register New User API Endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, department, organization } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: role || 'citizen',
      department: department || '',
      organization: organization || '',
      points: role === 'citizen' ? 250 : 0
    });

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        department: newUser.department,
        organization: newUser.organization,
        points: newUser.points,
        badges: newUser.badges,
        location: newUser.location
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (Citizen, Admin, NGO)
app.get('/api/users', async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user profile by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile in MongoDB
app.put('/api/users/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= ISSUE REST ROUTES =================
app.get('/api/issues', async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/issues', async (req, res) => {
  try {
    const newIssue = new Issue(req.body);
    const count = await Issue.countDocuments();
    newIssue.ticketId = `JH${String(count + 1).padStart(3, '0')}`;
    if (!newIssue.createdAt) newIssue.createdAt = new Date();
    if (!newIssue.updatedAt) newIssue.updatedAt = new Date();
    
    const saved = await Issue.create(newIssue);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/issues/:id', async (req, res) => {
  try {
    const updated = await Issue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/issues/:id/upvote', async (req, res) => {
  try {
    const updated = await Issue.findByIdAndUpdate(
      req.params.id, 
      { $inc: { upvotes: 1 } }, 
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend Server is running on http://localhost:${PORT}`);
});

