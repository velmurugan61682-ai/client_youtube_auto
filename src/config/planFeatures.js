/**
 * Frontend Subscription Plan Features Configuration
 * Only supported plan names: 'free' and 'pro'.
 */
export const PLAN_FEATURES = {
  free: {
    name: 'Free Plan',
    liveStreamingCommentReply: true,
    toxicCommentRemove: true,
    autoDM: true
  },
  pro: {
    name: 'Pro Plan (₹999/month)',
    liveStreamingCommentReply: true,
    toxicCommentRemove: true,
    autoDM: true
  }
};

export const normalizePlanName = (planType = 'free') => {
  const p = (planType || '').toLowerCase().trim();
  if (p === 'pro' || p.includes('999') || p.includes('quarterly') || p.includes('professional') || p.includes('yearly') || p.includes('three_months')) {
    return 'pro';
  }
  return 'free';
};

export const hasFeatureAccess = (user, featureName) => {
  if (!user) return false;
  const rawPlan = user.plan || user.subscription?.planId || user.subscription?.planType || 'free';
  const planType = normalizePlanName(rawPlan);
  return Boolean(PLAN_FEATURES[planType]?.[featureName]);
};
