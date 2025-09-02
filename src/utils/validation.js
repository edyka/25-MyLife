import { z } from "zod";

export const UserDataSchema = z.object({
  birthDay: z.string().regex(/^\d{1,2}$/, "Birth day must be 1-2 digits"),
  birthMonth: z.string().regex(/^\d{1,2}$/, "Birth month must be 1-2 digits"),
  birthYear: z.string().regex(/^\d{4}$/, "Birth year must be 4 digits"),
  lifeExpectancy: z
    .string()
    .regex(/^\d{1,3}$/, "Life expectancy must be 1-3 digits"),
});

export const MilestoneSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  category: z.string().min(1, "Category is required"),
  description: z.string().max(1000, "Description too long").optional(),
  weekNum: z.number().int().min(1).max(5200),
});

export const MilestonesSchema = z.record(z.string(), MilestoneSchema);

export const GoalSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  category: z.string().min(1, "Category is required"),
  completed: z.boolean().default(false),
  createdAt: z.string().datetime().optional(),
});

export const GoalsSchema = z.array(GoalSchema);

export const CustomCategorySchema = z.object({
  color: z.string().min(1, "Color is required"),
  icon: z.any(),
  label: z.string().min(1, "Label is required").max(50, "Label too long"),
});

export const CustomCategoriesSchema = z.record(
  z.string(),
  CustomCategorySchema
);

export const AppDataSchema = z.object({
  birthDay: z.string(),
  birthMonth: z.string(),
  birthYear: z.string(),
  lifeExpectancy: z.string(),
  milestones: MilestonesSchema.default({}),
  customCategories: CustomCategoriesSchema.default({}),
  goals: GoalsSchema.default([]),
});

export const validateUserData = (data) => {
  try {
    return UserDataSchema.parse(data);
  } catch (error) {
    throw new Error(`Invalid user data: ${error.message}`);
  }
};

export const validateMilestone = (milestone) => {
  try {
    return MilestoneSchema.parse(milestone);
  } catch (error) {
    throw new Error(`Invalid milestone: ${error.message}`);
  }
};

export const validateAppData = (data) => {
  try {
    return AppDataSchema.parse(data);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
       
      console.warn("Data validation failed, using defaults:", error.message);
    }
    return AppDataSchema.parse({
      birthDay: data?.birthDay || "",
      birthMonth: data?.birthMonth || "",
      birthYear: data?.birthYear || "",
      lifeExpectancy: data?.lifeExpectancy || "",
      milestones: data?.milestones || {},
      customCategories: data?.customCategories || {},
      goals: data?.goals || [],
    });
  }
};

export const sanitizeHtml = (str) => {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\//g, "&#x2F;");
};
