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

// Dukamo Marketplace routes
app.use('/api/jobs',              require('./routes/jobPosts'));
app.use('/api/job-applications',  requireAuth, require('./routes/jobApplications'));
app.use('/api/gigs',              require('./routes/gigTasks'));
app.use('/api/gig-bids',          requireAuth, require('./routes/gigBids'));
app.use('/api/worker-profiles',   require('./routes/workerProfiles'));
app.use('/api/employer-profiles', require('./routes/employerProfiles'));
app.use('/api/skill-badges',      require('./routes/skillBadges'));
app.use('/api/reviews',           requireAuth, require('./routes/reviews'));
app.use('/api/dukamo-dashboard',  require('./routes/dukamoDashboard'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`OPS Management Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
