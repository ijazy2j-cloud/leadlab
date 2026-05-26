import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const now = new Date();

    // Week starts Monday 00:00 local time (stored UTC).
    // day===0 (Sun) → back 6 days; otherwise back (day-1) days.
    const startOfWeek = new Date(now);
    const day = now.getDay();
    startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    // activitiesThisWeek = sum of DecisionLog + MedicalCase + BigFive created this week.
    // PracticeLog is never written by the current forms, so we count the actual activity tables.
    const [
      decisionsThisWeek,
      medicalThisWeek,
      bigFiveThisWeek,
      openFollowUps,
      overdueFollowUps,
      upcomingFollowUps,
    ] = await Promise.all([
      prisma.decisionLog.count({
        where: { userId: req.user.id, createdAt: { gte: startOfWeek } },
      }),
      prisma.medicalCase.count({
        where: { userId: req.user.id, createdAt: { gte: startOfWeek } },
      }),
      prisma.bigFive.count({
        where: { userId: req.user.id, createdAt: { gte: startOfWeek } },
      }),
      prisma.followUp.count({
        where: { userId: req.user.id, status: 'OPEN', dueDate: { gte: now } },
      }),
      prisma.followUp.count({
        where: { userId: req.user.id, status: 'OPEN', dueDate: { lt: now } },
      }),
      prisma.followUp.findMany({
        where: { userId: req.user.id, status: 'OPEN' },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
    ]);

    const activitiesThisWeek = decisionsThisWeek + medicalThisWeek + bigFiveThisWeek;

    // TODO (Phase 2): Replace this proxy with a real "Principles practised" count.
    // That requires PracticeLog.principleId to be populated when DecisionLog/MedicalCase/BigFive
    // are submitted. Until that flow exists, we count how many distinct entry types were used
    // this week as a rough proxy — not a true principle-level count.
    const typesUsedThisWeek = [decisionsThisWeek, medicalThisWeek, bigFiveThisWeek].filter(
      (n) => n > 0
    ).length;

    res.json({
      activitiesThisWeek,
      openFollowUps,
      overdueFollowUps,
      principlesPractised: typesUsedThisWeek,
      upcomingFollowUps,
      currentPrincipleFocus: null, // PracticeLog not yet populated by forms
    });
  } catch (err) {
    next(err);
  }
});

export default router;
