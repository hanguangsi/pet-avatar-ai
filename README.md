# 萌宠分身 AI (Pet Avatar AI)

上传一张宠物照片，生成专属 3D 萌宠形象，并与宠物 AI 分身聊天。

## 当前能力

- 首页、登录页、工作台、宠物档案、生成页、聊天页、健康记录页、我的页面
- Supabase Auth：邮箱 Magic Link 登录、匿名登录
- Supabase PostgreSQL：宠物档案、生成历史、聊天记录、健康记录
- Supabase Storage：保存原图和生成图
- AI 图片生成：OpenAI Images 或阿里云百炼 DashScope 可切换
- AI 聊天：OpenAI、阿里云百炼 DashScope、本地兜底模式可切换
- 付费逻辑预留：免费/匿名用户默认 1 次生成

## 技术栈

- Next.js 15 App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui 风格组件
- Supabase Auth / PostgreSQL / Storage
- OpenAI SDK
- 阿里云百炼 DashScope
- Vercel 或后续腾讯云/阿里云部署

## 本地运行

安装依赖：

```bash
npm install
```

复制环境变量模板：

```bash
copy .env.example .env.local
```

启动开发服务：

```bash
npm run dev
```

打开：

```txt
http://localhost:3000
```

## 环境变量

所有密钥都填写在项目根目录的 `.env.local` 文件里。

不要把真实 Key 写进 `.env.example`，也不要提交到 GitHub。

### Supabase 配置

在 Supabase 控制台进入：

```txt
Project Settings -> Data API / API
```

填写：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 anon public key
SUPABASE_SERVICE_ROLE_KEY=你的 service_role secret key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

注意：`NEXT_PUBLIC_SUPABASE_URL` 必须是项目根地址，不能带 `/rest/v1/`。

正确：

```txt
https://xxxx.supabase.co
```

错误：

```txt
https://xxxx.supabase.co/rest/v1/
```

### 阿里云百炼 DashScope 配置

如果你要使用国内模型，在阿里云百炼控制台创建 API Key：

```txt
阿里云百炼控制台 -> API Key / 模型服务灵积 -> 创建 API Key
```

然后在 `.env.local` 里填写：

```env
AI_IMAGE_PROVIDER=dashscope
AI_CHAT_PROVIDER=dashscope
DASHSCOPE_API_KEY=你的阿里云百炼 API Key
DASHSCOPE_IMAGE_MODEL=wan2.7-image
DASHSCOPE_CHAT_MODEL=qwen3.6-plus
```

配置后必须重启本地服务：

```bash
npm run dev
```

如果之前服务已经在运行，先停掉再重新启动。

### OpenAI 配置

如果你要使用 OpenAI：

```env
AI_IMAGE_PROVIDER=openai
AI_CHAT_PROVIDER=openai
OPENAI_API_KEY=你的 OpenAI API Key
OPENAI_IMAGE_MODEL=gpt-image-1-mini
OPENAI_CHAT_MODEL=gpt-5.1-mini
```

国内网络下 OpenAI 图片生成可能超时，建议图片生成优先使用 DashScope。

### 本地聊天兜底模式

如果只是本地测试聊天 UI，不想依赖外部模型，可以使用：

```env
AI_CHAT_PROVIDER=local
```

这个模式不会调用模型，只返回宠物口吻的本地回复，适合调试产品流程。

## 推荐的本地 `.env.local`

国内测试推荐：

```env
OPENAI_API_KEY=your-openai-api-key
OPENAI_IMAGE_MODEL=gpt-image-1-mini
OPENAI_CHAT_MODEL=gpt-5.1-mini

AI_IMAGE_PROVIDER=dashscope
AI_CHAT_PROVIDER=dashscope
DASHSCOPE_API_KEY=your-dashscope-api-key
DASHSCOPE_IMAGE_MODEL=wan2.7-image
DASHSCOPE_CHAT_MODEL=qwen3.6-plus

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

只测试页面和聊天流程时：

```env
AI_CHAT_PROVIDER=local
```

## Supabase 初始化

在 Supabase SQL Editor 执行：

```txt
supabase/schema.sql
```

脚本会创建：

- `profiles`
- `pets`
- `image_generations`
- `chat_messages`
- `health_records`
- `subscriptions`
- `pet-media` Storage bucket
- RLS 权限策略
- 新用户 profile trigger

Supabase Authentication 需要开启：

- Email 登录
- Anonymous sign-ins

本地回调地址：

```txt
http://localhost:3000/auth/callback
```

线上回调地址示例：

```txt
https://your-domain.com/auth/callback
```

## AI Provider 切换说明

相关代码在：

```txt
src/lib/openai.ts
```

图片生成：

```env
AI_IMAGE_PROVIDER=openai
```

或：

```env
AI_IMAGE_PROVIDER=dashscope
```

聊天：

```env
AI_CHAT_PROVIDER=openai
```

或：

```env
AI_CHAT_PROVIDER=dashscope
```

或：

```env
AI_CHAT_PROVIDER=local
```

## 常用命令

```bash
npm run lint
npm run build
npm run dev
```

## 部署建议

MVP 阶段可以继续使用 Vercel。

如果目标用户主要在国内，后续建议迁移到：

- 腾讯云 CloudBase
- 腾讯云轻量服务器 Lighthouse
- 阿里云 ECS / 函数计算
- 腾讯云 COS 或阿里云 OSS 存储图片

微信 H5 商业化时建议新增：

- 微信网页授权
- 微信支付 JSAPI
- 订单表 `orders`
- 次数表 `credits`
- 支付记录表 `payments`

## 安全注意

- `SUPABASE_SERVICE_ROLE_KEY` 只能服务端使用。
- `DASHSCOPE_API_KEY` 只能服务端使用。
- `OPENAI_API_KEY` 只能服务端使用。
- 不要把真实 Key 写进 `.env.example`。
- 不要把 `.env.local` 提交到 GitHub。
