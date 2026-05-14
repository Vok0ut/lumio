-- Enable RLS on new nutrition tables
ALTER TABLE "NutritionProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FoodEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MealTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WeightLog" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'nutrition_profile_user') THEN
    CREATE POLICY "nutrition_profile_user" ON "NutritionProfile" FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'food_entry_user') THEN
    CREATE POLICY "food_entry_user" ON "FoodEntry" FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'meal_template_user') THEN
    CREATE POLICY "meal_template_user" ON "MealTemplate" FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'weight_log_user') THEN
    CREATE POLICY "weight_log_user" ON "WeightLog" FOR ALL USING (true);
  END IF;
END $$;
