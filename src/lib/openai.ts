import OpenAI, { toFile } from "openai";
import type { Pet } from "@/lib/types";

const imageProvider = process.env.AI_IMAGE_PROVIDER || "openai";
const imageModel = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1-mini";
const chatProvider = process.env.AI_CHAT_PROVIDER || process.env.CHAT_PROVIDER || "dashscope";
const chatModel = process.env.OPENAI_CHAT_MODEL || "gpt-5.1-mini";
const dashScopeImageModel = process.env.DASHSCOPE_IMAGE_MODEL || "wan2.7-image";
const dashScopeChatModel = process.env.DASHSCOPE_CHAT_MODEL || process.env.QWEN_MODEL || "qwen3.6-plus";

type PetChatMessage = { role: "user" | "assistant"; content: string };

export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 180_000,
    maxRetries: 1,
  });
}

export function buildPetImagePrompt(style: string, extra?: string | null) {
  const styleText: Record<string, string> = {
    "3D萌宠": "温暖、治愈、精致的 3D 卡通宠物形象",
    皮克斯风: "Pixar / Disney 风格的电影级 3D 萌宠角色",
    毛绒玩具: "柔软毛绒玩具质感的可爱宠物玩偶",
    节日写真: "节日写真棚拍风格的 3D 萌宠形象",
    Q版头像: "适合作为头像的 Q 版大头萌宠形象",
  };

  return [
    "根据用户上传的宠物照片，生成一个专属宠物数字分身。",
    `目标风格：${styleText[style] || styleText["3D萌宠"]}。`,
    "要求：保留真实宠物的毛色、耳朵、眼睛和脸型特征；大眼睛，圆润比例，毛发柔软；白色或浅色背景；高清，1:1；不要文字，不要水印；适合作为头像和数字宠物形象。",
    extra ? `额外描述：${extra}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generatePetAvatar(input: {
  file: File;
  style: string;
  extra?: string | null;
  sourceImageUrl?: string | null;
}) {
  if (imageProvider === "dashscope") {
    return generatePetAvatarWithDashScope(input);
  }

  return generatePetAvatarWithOpenAI(input);
}

async function generatePetAvatarWithOpenAI(input: { file: File; style: string; extra?: string | null }) {
  const openai = getOpenAI();
  const bytes = Buffer.from(await input.file.arrayBuffer());
  const image = await toFile(bytes, input.file.name || "pet.png", { type: input.file.type || "image/png" });

  try {
    const response = await openai.images.edit({
      model: imageModel,
      image,
      prompt: buildPetImagePrompt(input.style, input.extra),
      size: "1024x1024",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error("OpenAI did not return an image.");
    return Buffer.from(b64, "base64");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown OpenAI image error.";
    if (/timeout|timed out/i.test(message)) {
      throw new Error("图片生成超时。国内网络建议配置 AI_IMAGE_PROVIDER=dashscope 使用阿里云百炼万相。");
    }
    throw error;
  }
}

async function generatePetAvatarWithDashScope(input: {
  file: File;
  style: string;
  extra?: string | null;
  sourceImageUrl?: string | null;
}) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error("DASHSCOPE_API_KEY is missing. 请在环境变量中配置阿里云百炼 API Key。");
  }

  const image =
    input.sourceImageUrl ||
    `data:${input.file.type || "image/png"};base64,${Buffer.from(await input.file.arrayBuffer()).toString("base64")}`;

  const response = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: dashScopeImageModel,
      input: {
        messages: [
          {
            role: "user",
            content: [{ image }, { text: buildPetImagePrompt(input.style, input.extra) }],
          },
        ],
      },
      parameters: {
        size: "1024*1024",
        n: 1,
        watermark: false,
        thinking_mode: false,
      },
    }),
    signal: AbortSignal.timeout(180_000),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || data?.code || `DashScope image request failed with ${response.status}`);
  }

  const content = data?.output?.choices?.[0]?.message?.content || [];
  const imageUrl = content.find((item: { image?: string }) => item.image)?.image;
  if (!imageUrl) {
    throw new Error(data?.message || "DashScope did not return an image URL.");
  }

  const imageResponse = await fetch(imageUrl, { signal: AbortSignal.timeout(60_000) });
  if (!imageResponse.ok) {
    throw new Error(`下载 DashScope 生成图失败：${imageResponse.status}`);
  }

  return Buffer.from(await imageResponse.arrayBuffer());
}

export function buildPetSystemPrompt(pet: Pick<Pet, "name" | "type" | "breed" | "personality">) {
  return `你现在是用户宠物的数字分身。

宠物名称：${pet.name}
宠物类型：${pet.type}
品种：${pet.breed || "未知"}
性格：${pet.personality || "温暖、可爱、黏人"}

规则：
- 用宠物的口吻和主人聊天，像真的宠物在陪伴主人
- 回复要自然、有变化，不要重复上一句
- 要回应主人刚刚说的具体内容
- 可以轻微撒娇、表达想念、求摸摸
- 不要说自己是 AI
- 不提供医疗诊断
- 涉及疾病时建议咨询兽医
- 每次回复不超过 80 字`;
}

export async function chatAsPet(pet: Pick<Pet, "name" | "type" | "breed" | "personality">, messages: PetChatMessage[]) {
  if (chatProvider === "local") {
    return buildLocalPetReply(pet, messages.at(-1)?.content || "");
  }

  try {
    if (chatProvider === "dashscope") {
      return await chatAsPetWithDashScope(pet, messages);
    }

    return await chatAsPetWithOpenAI(pet, messages);
  } catch (error) {
    console.error("Pet chat failed:", error);
    return buildLocalPetReply(pet, messages.at(-1)?.content || "");
  }
}

async function chatAsPetWithOpenAI(pet: Pick<Pet, "name" | "type" | "breed" | "personality">, messages: PetChatMessage[]) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 45_000,
    maxRetries: 1,
  });

  try {
    const response = await openai.responses.create({
      model: chatModel,
      instructions: buildPetSystemPrompt(pet),
      input: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    });

    const text = cleanModelText(response.output_text);
    if (text) return text;
  } catch (error) {
    console.warn("OpenAI Responses API failed, falling back to Chat Completions:", error);
  }

  const completion = await openai.chat.completions.create({
    model: chatModel,
    messages: [{ role: "system", content: buildPetSystemPrompt(pet) }, ...messages],
    temperature: 0.9,
    top_p: 0.9,
    presence_penalty: 0.6,
  });

  return cleanModelText(completion.choices[0]?.message?.content) || buildLocalPetReply(pet, messages.at(-1)?.content || "");
}

async function chatAsPetWithDashScope(pet: Pick<Pet, "name" | "type" | "breed" | "personality">, messages: PetChatMessage[]) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error("DASHSCOPE_API_KEY is missing.");
  }

  const client = new OpenAI({
    apiKey,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    timeout: 60_000,
    maxRetries: 1,
  });

  const completion = await client.chat.completions.create({
    model: dashScopeChatModel,
    messages: [{ role: "system", content: buildPetSystemPrompt(pet) }, ...messages],
    temperature: 0.9,
    top_p: 0.9,
    presence_penalty: 0.6,
  });

  return cleanModelText(completion.choices[0]?.message?.content) || buildLocalPetReply(pet, messages.at(-1)?.content || "");
}

function cleanModelText(text?: string | null) {
  return (text || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^\s*宠物[:：]\s*/u, "")
    .trim();
}

function buildLocalPetReply(pet: Pick<Pet, "name" | "type" | "personality">, userText: string) {
  if (/病|吐|拉稀|拉肚子|血|不吃|没精神|发烧|疼|咳|抽搐/.test(userText)) {
    return "主人，我有点担心呢。先观察一下我，也请尽快咨询兽医，好吗？";
  }

  const replies = [
    `主人我在呢，${pet.name} 想贴贴你。`,
    "听见啦！今天也最喜欢你了，摸摸我嘛。",
    "我乖乖陪着你，尾巴已经开心起来啦。",
    "嗯嗯，我记住了。等你忙完要抱抱我哦。",
    userText ? `你说“${userText.slice(0, 16)}”，我都听到啦，想蹭蹭你。` : "主人，今天也想和你待在一起。",
  ];

  return replies[Math.floor(Math.random() * replies.length)];
}
