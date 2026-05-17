export type Pet = {
  id: string;
  user_id: string;
  name: string;
  type: "猫" | "狗" | "其他";
  breed: string | null;
  gender: string | null;
  birthday: string | null;
  weight: number | null;
  personality: string | null;
  original_photo_url: string | null;
  ai_avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ImageGeneration = {
  id: string;
  user_id: string;
  pet_id: string | null;
  style: string;
  prompt: string | null;
  source_image_url: string | null;
  result_image_url: string | null;
  status: "pending" | "succeeded" | "failed";
  created_at: string;
};

export type HealthRecord = {
  id: string;
  user_id: string;
  pet_id: string;
  weight: number | null;
  food: string | null;
  water: string | null;
  poop: string | null;
  exercise: string | null;
  note: string | null;
  health_score: number;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  pet_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};
