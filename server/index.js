const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Auth (public routes inside)
app.use('/api/auth', require('./routes/auth'));

// Protected routes
app.use('/api/projects', require('./routes/projects'));
app.use('/api/daily-reports', require('./routes/dailyReports'));
app.use('/api/dashboard', require('./routes/dashboard'));

// These routes still work (keeping contractors, agreements, payments, etc.)
const { requireAuth } = require('./middleware/auth');
app.use('/api/contractors', requireAuth, require('./routes/contractors'));
app.use('/api/contractor-agreements', requireAuth, require('./routes/contractorAgreements'));
app.use('/api/contract-details', requireAuth, require('./routes/contractDetails'));
app.use('/api/contractor-payments', requireAuth, require('./routes/contractorPayments'));
app.use('/api/operational-plans', requireAuth, require('./routes/operationalPlans'));
app.use('/api/monthly-reports', requireAuth, require('./routes/monthlyReports'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`OPS Management Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
