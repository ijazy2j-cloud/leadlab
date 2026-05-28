import { getPool } from '../local-modules/db.mjs';

async function getStats(userId) {
  const pool = getPool();
  const now = new Date();

  const startOfWeek = new Date(now);
  const day = now.getDay();
  startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  startOfWeek.setHours(0, 0, 0, 0);

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
      [userId, startOfWeek]
    ),
    pool.query(
      'SELECT COUNT(*)::int FROM ll_medical_case WHERE user_id=$1 AND created_at>=$2',
      [userId, startOfWeek]
    ),
    pool.query(
      'SELECT COUNT(*)::int FROM ll_big_five WHERE user_id=$1 AND created_at>=$2',
      [userId, startOfWeek]
    ),
    pool.query(
      "SELECT COUNT(*)::int FROM ll_follow_up WHERE user_id=$1 AND status='OPEN' AND due_date>=$2",
      [userId, now]
    ),
    pool.query(
      "SELECT COUNT(*)::int FROM ll_follow_up WHERE user_id=$1 AND status='OPEN' AND due_date<$2",
      [userId, now]
    ),
    pool.query(
      `SELECT id, user_id AS "userId", source_type AS "sourceType", source_id AS "sourceId",
              commitment, owner, due_date AS "dueDate", status, outcome,
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM ll_follow_up
       WHERE user_id=$1 AND status='OPEN'
       ORDER BY due_date ASC
       LIMIT 5`,
      [userId]
    ),
  ]);

  const activitiesThisWeek = decisionsThisWeek + medicalThisWeek + bigFiveThisWeek;
  // TODO (Phase 2): Replace proxy with real principle-level count once PracticeLog is populated.
  const principlesPractised = [decisionsThisWeek, medicalThisWeek, bigFiveThisWeek].filter(
    (n) => n > 0
  ).length;

  return {
    activitiesThisWeek,
    openFollowUps,
    overdueFollowUps,
    principlesPractised,
    upcomingFollowUps,
    currentPrincipleFocus: null,
  };
}

export { getStats };
