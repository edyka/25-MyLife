import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { database, auth } from '../lib/supabase';

export const useEngagementStore = create(
    persist(
        (set, get) => ({
            streak: 0,
            lastVisit: null,
            lastActionDate: null,
            unlockedBadges: [],

            // Actions
            setStreak: (streak) => set({ streak }),

            incrementStreak: () => {
                const { streak, lastActionDate } = get();
                const today = new Date().toDateString();

                // If already acted today, don't increment
                if (lastActionDate === today) return;

                // Check if last action was yesterday (consecutive)
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                if (lastActionDate === yesterday.toDateString()) {
                    set({ streak: streak + 1, lastActionDate: today });
                } else {
                    // Reset streak if broken (or start new if first time)
                    // Ideally we might want a grace period, but for now strict streak
                    // If it's the first time ever, streak becomes 1
                    set({ streak: 1, lastActionDate: today });
                }

                get().syncToSupabase();
            },

            unlockBadge: (badgeId) => {
                const { unlockedBadges } = get();
                if (!unlockedBadges.includes(badgeId)) {
                    const newBadges = [...unlockedBadges, badgeId];
                    set({ unlockedBadges: newBadges });
                    get().syncToSupabase();
                    return true; // Badge newly unlocked
                }
                return false; // Already unlocked
            },

            // Sync with Supabase
            syncToSupabase: async () => {
                const { user } = await auth.getCurrentUser();
                if (!user) return;

                const state = get();
                const stats = {
                    streak: state.streak,
                    lastVisit: state.lastVisit,
                    lastActionDate: state.lastActionDate,
                    unlockedBadges: state.unlockedBadges
                };

                await database.saveEngagementStats(user.id, stats);
            },

            loadFromSupabase: async (userId) => {
                if (!userId) return;

                const { data, error } = await database.getUserProfile(userId);
                if (data && data.engagement_stats) {
                    set({
                        streak: data.engagement_stats.streak || 0,
                        lastVisit: data.engagement_stats.lastVisit || null,
                        lastActionDate: data.engagement_stats.lastActionDate || null,
                        unlockedBadges: data.engagement_stats.unlockedBadges || []
                    });
                }
            },

            // Check for specific badges based on state
            checkBadges: (milestones, goals, selections) => {
                const { unlockBadge } = get();
                const unlocked = [];

                // Badge: First Week Painted
                if (Object.keys(milestones).length >= 1) {
                    if (unlockBadge('first_paint')) unlocked.push('first_paint');
                }

                // Badge: Time Traveler (Filled 10 past weeks)
                if (Object.keys(milestones).length >= 10) {
                    if (unlockBadge('time_traveler')) unlocked.push('time_traveler');
                }

                // Badge: Goal Setter (Set 1 goal)
                if (goals && Object.keys(goals).length >= 1) {
                    if (unlockBadge('goal_setter')) unlocked.push('goal_setter');
                }

                return unlocked;
            }
        }),
        {
            name: 'viventiva-engagement', // unique name
            partialize: (state) => ({
                streak: state.streak,
                lastVisit: state.lastVisit,
                lastActionDate: state.lastActionDate,
                unlockedBadges: state.unlockedBadges
            }),
        }
    )
);
