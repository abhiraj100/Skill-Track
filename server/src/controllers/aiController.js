import { runAI } from "../services/aiService.js";

const skillSet = ["React", "JavaScript", "TypeScript", "Node.js", "Express.js", "MongoDB", "REST APIs", "Docker", "AWS", "Testing", "System Design", "Git"];

export const skillGap = async (req, res, next) => {
  try {
    const { careerGoal = "MERN Stack Developer", skills = [] } = req.body;
    const normalized = skills.map(s => s.toLowerCase());
    const gaps = skillSet.filter(s => !normalized.includes(s.toLowerCase())).slice(0, 6);
    const fallback = JSON.stringify({
      careerGoal,
      score: Math.max(35, 100 - gaps.length * 9),
      strengths: skillSet.filter(s => normalized.includes(s.toLowerCase())).slice(0, 6),
      gaps,
      roadmap: gaps.slice(0, 5).map((skill, i) => ({ order: i + 1, skill, reason: `Build practical ${skill} capability for ${careerGoal}.` }))
    });
    const result = await runAI(`Target role: ${careerGoal}. Current skills: ${skills.join(", ")}. Identify gaps and provide a JSON object with score, strengths, gaps and roadmap.`, fallback);
    res.json({ success: true, result });
  } catch (e) { next(e); }
};

export const resumeAnalysis = async (req, res, next) => {
  try {
    const text = String(req.body.text || "").slice(0, 12000);
    if (!text.trim()) { res.status(400); throw new Error("Resume text is required"); }
    const fallback = JSON.stringify({
      score: 78,
      strengths: ["Project experience", "Modern web stack", "API development"],
      improvements: ["Add measurable outcomes", "Mention testing and deployment", "Tailor keywords to each job"],
      keywords: ["React", "Node.js", "Express", "MongoDB", "REST API", "Git"]
    });
    const result = await runAI(`Analyze this resume text. Return JSON with score, strengths, improvements and keywords. Resume: ${text}`, fallback);
    res.json({ success: true, result });
  } catch (e) { next(e); }
};

export const jobMatch = async (req, res, next) => {
  try {
    const { resume = "", jobDescription = "" } = req.body;
    const fallback = JSON.stringify({
      match: 82,
      matched: ["React", "Node.js", "MongoDB", "REST API"],
      missing: ["Docker", "AWS"],
      recommendation: "Good match. Tailor your project bullets and highlight deployment experience."
    });
    const result = await runAI(`Compare resume and job description. Return JSON with match, matched, missing and recommendation. Resume: ${resume.slice(0,6000)} Job: ${jobDescription.slice(0,6000)}`, fallback);
    res.json({ success: true, result });
  } catch (e) { next(e); }
};
