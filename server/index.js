const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/contractors', require('./routes/contractors'));
app.use('/api/contractor-agreements', require('./routes/contractorAgreements'));
app.use('/api/contract-details', require('./routes/contractDetails'));
app.use('/api/contractor-payments', require('./routes/contractorPayments'));
app.use('/api/operational-plans', require('./routes/operationalPlans'));
app.use('/api/daily-reports', require('./routes/dailyReports'));
app.use('/api/monthly-reports', require('./routes/monthlyReports'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Only listen when running directly (not as a Vercel serverless function)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`OPS Management Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
