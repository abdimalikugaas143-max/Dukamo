const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const { requireAuth } = require('./middleware/auth');

// Auth (public routes inside)
app.use('/api/auth', require('./routes/auth'));

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
app.use('/api/messages',          requireAuth, require('./routes/messages'));
app.use('/api/payments',          requireAuth, require('./routes/payments'));
app.use('/api/ai-match',          requireAuth, require('./routes/aiMatch'));
app.use('/api/referrals',         requireAuth, require('./routes/referrals'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Dukamo Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
