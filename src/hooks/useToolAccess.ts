import { useUserTier } from "./useUserTier";

const TOOL_TIER_REQUIREMENTS: Record<string, string> = {
  'colorpro': 'starter',
  'fadewraps': 'professional',
  'wbty': 'professional',
  'designpanelpro': 'proshop',
  'approvemode': 'proshop'
};

const TIER_HIERARCHY = ['free', 'starter', 'professional', 'proshop', 'agency'];

export const useToolAccess = (toolName: string) => {
  const userTier = useUserTier();
  const requiredTier = TOOL_TIER_REQUIREMENTS[toolName] || 'starter';
  
  const userTierIndex = TIER_HIERARCHY.indexOf(userTier);
  const requiredTierIndex = TIER_HIERARCHY.indexOf(requiredTier);
  
  const hasAccess = userTierIndex >= requiredTierIndex;
  
  return {
    hasAccess,
    requiredTier,
    userTier,
    upgradeUrl: '/pricing'
  };
};
