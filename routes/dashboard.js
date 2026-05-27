import { Router } from 'express';
import { getPool } from '../local-modules/db.mjs';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const pool = getPool();
    const now = new Date();

    // Week starts Monday 00:00 local time.
    const startOfWeek = new Date(now);
    const day = now.getDay();
    startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const uid = req.user.id;

    const [
      { rows: [{ count: decisionsThisWeek }] },
      { rows: [{ count: medicalThisWeek }] },
      { rows: [{ count: bigFiveThisWeek }] },
      { rows: [{ count: openFollowUps }] },
      { rows: [{ count: overdueFollowUps }] },
      { rows: upcomingFollowUps },
    ] = await Promise.all([
      pool.query(
        'SELECT COUNT(*)::int FROM ll_decision_log WHERE user_id=$1 AND created_at>=$2',
        [uid, startOfWeek]
      ),
      pool.query(
        'SELECT COUNT(*)::int FROM ll_medical_case WHERE user_id=$1 AND created_at>=$2',
        [uid, startOfWeek]
      ),
      pool.query(
        'SELECT COUNT(*)::int FROM ll_big_five WHERE user_id=$1 AND created_at>=$2',
        [uid, startOfWeek]
      ),
      pool.query(
        "SELECT COUNT(*)::int FROM ll_follow_up WHERE user_id=$1 AND status='OPEN' AND due_date>=$2",
        [uid, now]
      ),
      pool.query(
        "SELECT COUNT(*)::int FROM ll_follow_up WHERE user_id=$1 AND status='OPEN' AND due_date<$2",
        [uid, now]
      ),
      pool.query(
        `SELECT id, user_id AS "userId", source_type AS "sourceType", source_id AS "sourceId",
                commitment, owner, due_date AS "dueDate", status, outcome,
                created_at AS "createdAt", updated_at AS "updatedAt"
         FROM ll_follow_up
         WHERE user_id=$1 AND status='OPEN'
         ORDER BY due_date ASC
         LIMIT 5`,
        [uid]
      ),
    ]);

    const activitiesThisWeek = decisionsThisWeek + medicalThisWeek + bigFiveThisWeek;

    // TODO (Phase 2): Replace proxy with real principle-level count once PracticeLog is populated.
    const typesUsedThisWeek = [decisionsThisWeek, medicalThisWeek, bigFiveThisWeek].filter(
      (n) => n > 0
    ).length;

    res.json({
      activitiesThisWeek,
      openFollowUps,
      overdueFollowUps,
      principlesPractised: typesUsedThisWeek,
      upcomingFollowUps,
      currentPrincipleFocus: null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
