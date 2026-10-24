import Roadmap from '../models/Roadmap.js';
import Skill from '../models/Skill.js';
import StudentSkill from '../models/StudentSkill.js';

// Helper: Seed initial roadmap for student
const generateInitialRoadmapData = async (userId, targetRole = 'SDE') => {
    try {
        const allSkills = await Skill.find();

        // Group skills into phases
        // Phase 1: Foundation (Arrays, Hashing, Strings, Languages)
        // Phase 2: Core Patterns (Linked Lists, Trees, DBMS, SQL, CS Fundamentals)
        // Phase 3: Advanced Prep (Graphs, DP, OOP, System Design, Mock Interviews)
        const phases = [
            {
                name: 'Foundation',
                status: 'In Progress',
                order: 1,
                skills: []
            },
            {
                name: 'Core Patterns',
                status: 'Locked',
                order: 2,
                skills: []
            },
            {
                name: 'Advanced Prep',
                status: 'Locked',
                order: 3,
                skills: []
            }
        ];

        allSkills.forEach(skill => {
            const skillNameLower = skill.name.toLowerCase();
            const item = {
                skillId: skill._id,
                name: skill.name,
                masteryRequired: 70,
                isCompleted: false
            };

            if (
                skill.category === 'LANGUAGE' ||
                skillNameLower.includes('array') ||
                skillNameLower.includes('string') ||
                skillNameLower.includes('hash')
            ) {
                phases[0].skills.push(item);
            } else if (
                skillNameLower.includes('list') ||
                skillNameLower.includes('tree') ||
                skillNameLower.includes('dbms') ||
                skillNameLower.includes('sql') ||
                skill.category === 'CS_FUNDAMENTALS'
            ) {
                phases[1].skills.push(item);
            } else {
                phases[2].skills.push(item);
            }
        });

        return await Roadmap.create({
            userId,
            targetRole,
            phases
        });
    } catch (error) {
        console.error('Error generating initial roadmap data:', error.message);
        return null;
    }
};

// @desc    Get user's roadmap (or generate if empty)
// @route   GET /api/roadmap
// @access  Private
export const getMyRoadmap = async (req, res, next) => {
    try {
        let roadmap = await Roadmap.findOne({ userId: req.user._id });

        if (!roadmap) {
            return res.json({
                success: true,
                data: null
            });
        }

        // Refresh and sync roadmap completions with student's actual mastery scores
        const studentSkills = await StudentSkill.find({ userId: req.user._id });
        const skillMap = {}; // Maps skillId -> masteryScore
        studentSkills.forEach(ss => {
            skillMap[ss.skillId.toString()] = ss.masteryScore;
        });

        let modified = false;
        let allPriorPhasesDone = true;

        for (let i = 0; i < roadmap.phases.length; i++) {
            const phase = roadmap.phases[i];
            let allSkillsInPhaseCompleted = true;

            for (const skill of phase.skills) {
                const currentMastery = skillMap[skill.skillId.toString()] || 0;
                const metReq = currentMastery >= skill.masteryRequired;

                if (skill.isCompleted !== metReq) {
                    skill.isCompleted = metReq;
                    modified = true;
                }

                if (!skill.isCompleted) {
                    allSkillsInPhaseCompleted = false;
                }
            }

            // Update Phase statuses adaptive logic
            let newStatus = phase.status;
            if (allSkillsInPhaseCompleted) {
                newStatus = 'Completed';
            } else if (allPriorPhasesDone) {
                newStatus = 'In Progress';
                allPriorPhasesDone = false; // Next phases will lock out
            } else {
                newStatus = 'Locked';
            }

            if (phase.status !== newStatus) {
                phase.status = newStatus;
                modified = true;
            }
        }

        if (modified) {
            roadmap.updatedAt = new Date();
            await roadmap.save();
        }

        res.json({
            success: true,
            data: roadmap
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Regenerate user roadmap (admin utility or debug)
// @route   POST /api/roadmap/generate
// @access  Private
export const regenerateRoadmap = async (req, res, next) => {
    try {
        const { targetRole } = req.body;
        await Roadmap.deleteOne({ userId: req.user._id });
        const roadmap = await generateInitialRoadmapData(req.user._id, targetRole || 'SDE');
        res.json({
            success: true,
            message: 'Roadmap reset successfully',
            data: roadmap
        });
    } catch (error) {
        next(error);
    }
};
