const express = require('express');
const router = express.Router();
const pool = require('../database');

// POST /api/ai-match/job/:jobId — rank top workers for a job
router.post('/job/:jobId', async (req, res) => {
  try {
    const jobId = parseInt(req.params.jobId);

    // Get job details
    const { rows: jobs } = await pool.query(
      `SELECT jp.*, ep.company_name FROM job_posts jp
       LEFT JOIN employer_profiles ep ON ep.id = jp.employer_id
       WHERE jp.id = $1`, [jobId]
    );
    if (!jobs.length) return res.status(404).json({ error: 'Job not found' });
    const job = jobs[0];

    // Get available workers
    const { rows: workers } = await pool.query(`
      SELECT wp.*, u.name, u.email, u.country
      FROM worker_profiles wp
      JOIN users u ON u.id = wp.user_id
      WHERE wp.availability = 'available'
      ORDER BY wp.rating DESC
      LIMIT 50
    `);

    if (!workers.length) return res.json({ matches: [] });

    // Score workers locally (keyword + skill matching)
    const jobSkills = (job.skills_required || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    const jobTitle = (job.title || '').toLowerCase();
    const jobCategory = (job.category || '').toLowerCase();

    const scored = workers.map(w => {
      const workerSkills = (w.skills || '').toLowerCase();
      let score = 0;

      // Skill overlap
      jobSkills.forEach(skill => {
        if (workerSkills.includes(skill)) score += 20;
      });

      // Category/title keyword match
      if (workerSkills.includes(jobCategory)) score += 15;
      if (workerSkills.includes(jobTitle)) score += 10;

      // Experience level match
      const expRequired = job.experience_level;
      if (expRequired === 'entry' && w.experience_years <= 2) score += 10;
      if (expRequired === 'mid' && w.experience_years >= 2 && w.experience_years <= 5) score += 10;
      if (expRequired === 'senior' && w.experience_years >= 5) score += 10;

      // Rating bonus
      score += (w.rating || 0) * 5;

      // Remote & international bonus
      if (job.is_remote && w.open_to_remote_international) score += 10;

      // Country match bonus
      if (w.country === job.country) score += 5;

      return {
        worker_id: w.id,
        name: w.name,
        email: w.email,
        skills: w.skills,
        experience_years: w.experience_years,
        rating: w.rating,
        location: w.location,
        country: w.country,
        hourly_rate: w.hourly_rate,
        currency: w.currency,
        verified: w.verified,
        match_score: Math.min(score, 100),
      };
    });

    scored.sort((a, b) => b.match_score - a.match_score);
    res.json({ job_id: jobId, job_title: job.title, matches: scored.slice(0, 10) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai-match/worker/:workerId — find best jobs for a worker
router.post('/worker/:workerId', async (req, res) => {
  try {
    const workerId = parseInt(req.params.workerId);

    const { rows: workers } = await pool.query(
      `SELECT wp.*, u.name, u.country FROM worker_profiles wp
       JOIN users u ON u.id = wp.user_id WHERE wp.id = $1`, [workerId]
    );
    if (!workers.length) return res.status(404).json({ error: 'Worker not found' });
    const worker = workers[0];

    const { rows: jobs } = await pool.query(`
      SELECT jp.*, ep.company_name
      FROM job_posts jp
      LEFT JOIN employer_profiles ep ON ep.id = jp.employer_id
      WHERE jp.status = 'active'
      ORDER BY jp.created_at DESC LIMIT 100
    `);

    const workerSkills = (worker.skills || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

    const scored = jobs.map(job => {
      const jobSkills = (job.skills_required || '').toLowerCase();
      let score = 0;

      workerSkills.forEach(skill => {
        if (jobSkills.includes(skill)) score += 20;
      });

      if (jobSkills.includes(worker.country?.toLowerCase() || '')) score += 5;

      if (job.experience_level === 'entry' && worker.experience_years <= 2) score += 10;
      if (job.experience_level === 'mid' && worker.experience_years >= 2 && worker.experience_years <= 5) score += 10;
      if (job.experience_level === 'senior' && worker.experience_years >= 5) score += 10;

      if (job.country === worker.country) score += 10;
      if (job.is_remote && worker.open_to_remote_international) score += 15;

      return {
        job_id: job.id,
        title: job.title,
        company: job.company_name,
        category: job.category,
        location: job.location,
        country: job.country,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        currency: job.currency,
        is_remote: job.is_remote,
        match_score: Math.min(score, 100),
      };
    });

    scored.sort((a, b) => b.match_score - a.match_score);
    res.json({ worker_id: workerId, worker_name: worker.name, matches: scored.slice(0, 10) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
