const express = require('express');
const router = express.Router();
const pool = require('../database');

// GET platform analytics
router.get('/', async (req, res) => {
  try {
    const [jobs, gigs, workers, employers, applications, bids, cats, recentJobs, recentGigs] = await Promise.all([
      pool.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='active') as active FROM job_posts"),
      pool.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='open') as open FROM gig_tasks"),
      pool.query('SELECT COUNT(*) as total FROM worker_profiles'),
      pool.query('SELECT COUNT(*) as total FROM employer_profiles'),
      pool.query('SELECT COUNT(*) as total FROM job_applications'),
      pool.query('SELECT COUNT(*) as total FROM gig_bids'),
      pool.query(`
        SELECT category, COUNT(*) as count FROM (
          SELECT category FROM job_posts UNION ALL SELECT category FROM gig_tasks
        ) combined GROUP BY category ORDER BY count DESC LIMIT 8
      `),
      pool.query(`
        SELECT jp.id, jp.title, jp.category, jp.job_type, jp.salary_min, jp.salary_max, jp.created_at,
               ep.company_name
        FROM job_posts jp LEFT JOIN employer_profiles ep ON jp.employer_id = ep.id
        WHERE jp.status='active' ORDER BY jp.created_at DESC LIMIT 5
      `),
      pool.query(`
        SELECT gt.id, gt.title, gt.category, gt.budget, gt.is_remote, gt.created_at,
               u.name as poster_name
        FROM gig_tasks gt LEFT JOIN users u ON gt.poster_id = u.id
        WHERE gt.status='open' ORDER BY gt.created_at DESC LIMIT 5
      `),
    ]);

    res.json({
      totalJobs: Number(jobs.rows[0].total),
      activeJobs: Number(jobs.rows[0].active),
      totalGigs: Number(gigs.rows[0].total),
      openGigs: Number(gigs.rows[0].open),
      totalWorkers: Number(workers.rows[0].total),
      totalEmployers: Number(employers.rows[0].total),
      totalApplications: Number(applications.rows[0].total),
      totalBids: Number(bids.rows[0].total),
      topCategories: cats.rows.map(r => ({ category: r.category, count: Number(r.count) })),
      recentJobs: recentJobs.rows,
      recentGigs: recentGigs.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
