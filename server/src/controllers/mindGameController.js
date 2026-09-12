import MindGameAttempt from "../models/MindGameAttempt.js";

const difficulties = ["easy", "medium", "hard"];

export const getMindGameSummary = async (req, res, next) => {
  try {
    const [recent, bestByDifficulty, leaderboard] = await Promise.all([
      MindGameAttempt.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(8).select("difficulty score correct total duration createdAt"),
      MindGameAttempt.aggregate([
        { $match: { user: req.user._id } },
        { $sort: { score: -1, createdAt: 1 } },
        { $group: { _id: "$difficulty", score: { $first: "$score" }, correct: { $first: "$correct" }, total: { $first: "$total" } } }
      ]),
      MindGameAttempt.aggregate([
        { $sort: { score: -1, createdAt: 1 } },
        { $group: { _id: "$user", score: { $first: "$score" }, difficulty: { $first: "$difficulty" } } },
        { $sort: { score: -1 } }, { $limit: 8 },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $project: { _id: 0, name: "$user.name", score: 1, difficulty: 1 } }
      ])
    ]);
    const best = Object.fromEntries(bestByDifficulty.map((entry) => [entry._id, entry]));
    res.json({ success: true, recent, best, leaderboard });
  } catch (e) { next(e); }
};

export const saveMindGameAttempt = async (req, res, next) => {
  try {
    const { difficulty, score, correct, total, duration } = req.body;
    if (!difficulties.includes(difficulty)) { res.status(400); throw new Error("Choose a valid difficulty"); }
    if (![score, correct, total, duration].every(Number.isInteger) || score < 0 || correct < 0 || total < 1 || correct > total || duration < 1 || duration > 180) {
      res.status(400); throw new Error("Invalid game result");
    }
    const attempt = await MindGameAttempt.create({ user: req.user._id, difficulty, score: Math.min(score, 10000), correct, total, duration });
    res.status(201).json({ success: true, attempt });
  } catch (e) { next(e); }
};
