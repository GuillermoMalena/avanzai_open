(Files content cropped to 300k characters, download full ingest to see more)
================================================
File: README.md
================================================
![hero illustration](./assets/hero.gif)

# AI SDK

The [AI SDK](https://sdk.vercel.ai/docs) is a TypeScript toolkit designed to help you build AI-powered applications using popular frameworks like Next.js, React, Svelte, Vue and runtimes like Node.js.

To learn more about how to use the AI SDK, check out our [API Reference](https://sdk.vercel.ai/docs/reference) and [Documentation](https://sdk.vercel.ai/docs).

## Installation

You will need Node.js 18+ and pnpm installed on your local development machine.

```shell
npm install ai
```

## Usage

### AI SDK Core

The [AI SDK Core](https://sdk.vercel.ai/docs/ai-sdk-core/overview) module provides a unified API to interact with model providers like [OpenAI](https://sdk.vercel.ai/providers/ai-sdk-providers/openai), [Anthropic](https://sdk.vercel.ai/providers/ai-sdk-providers/anthropic), [Google](https://sdk.vercel.ai/providers/ai-sdk-providers/google-generative-ai), and more.

You will then install the model provider of your choice.

```shell
npm install @ai-sdk/openai
```

###### @/index.ts (Node.js Runtime)

```ts
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai'; // Ensure OPENAI_API_KEY environment variable is set

const { text } = await generateText({
  model: openai('gpt-4o'),
  system: 'You are a friendly assistant!',
  prompt: 'Why is the sky blue?',
});

console.log(text);
```

### AI SDK UI

The [AI SDK UI](https://sdk.vercel.ai/docs/ai-sdk-ui/overview) module provides a set of hooks that help you build chatbots and generative user interfaces. These hooks are framework agnostic, so they can be used in Next.js, React, Svelte, Vue, and SolidJS.

###### @/app/page.tsx (Next.js App Router)

```tsx
'use client';

import { useChat } from 'ai/react';

export default function Page() {
  const { messages, input, handleSubmit, handleInputChange, status } =
    useChat();

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          <div>{message.role}</div>
          <div>{message.content}</div>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          placeholder="Send a message..."
          onChange={handleInputChange}
          disabled={status !== 'ready'}
        />
      </form>
    </div>
  );
}
```

###### @/app/api/chat/route.ts (Next.js App Router)

```ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant.',
    messages,
  });

  return result.toDataStreamResponse();
}
```

## Templates

We've built [templates](https://vercel.com/templates?type=ai) that include AI SDK integrations for different use cases, providers, and frameworks. You can use these templates to get started with your AI-powered application.

## Community

The AI SDK community can be found on [GitHub Discussions](https://github.com/vercel/ai/discussions) where you can ask questions, voice ideas, and share your projects with other people.

## Contributing

Contributions to the AI SDK are welcome and highly appreciated. However, before you jump right into it, we would like you to review our [Contribution Guidelines](https://github.com/vercel/ai/blob/main/CONTRIBUTING.md) to make sure you have smooth experience contributing to AI SDK.

## Authors

This library is created by [Vercel](https://vercel.com) and [Next.js](https://nextjs.org) team members, with contributions from the [Open Source Community](https://github.com/vercel/ai/graphs/contributors).


================================================
File: README.md
================================================
![hero illustration](./assets/hero.gif)

# AI SDK

The [AI SDK](https://sdk.vercel.ai/docs) is a TypeScript toolkit designed to help you build AI-powered applications using popular frameworks like Next.js, React, Svelte, Vue and runtimes like Node.js.

To learn more about how to use the AI SDK, check out our [API Reference](https://sdk.vercel.ai/docs/reference) and [Documentation](https://sdk.vercel.ai/docs).

## Installation

You will need Node.js 18+ and pnpm installed on your local development machine.

```shell
npm install ai
```

## Usage

### AI SDK Core

The [AI SDK Core](https://sdk.vercel.ai/docs/ai-sdk-core/overview) module provides a unified API to interact with model providers like [OpenAI](https://sdk.vercel.ai/providers/ai-sdk-providers/openai), [Anthropic](https://sdk.vercel.ai/providers/ai-sdk-providers/anthropic), [Google](https://sdk.vercel.ai/providers/ai-sdk-providers/google-generative-ai), and more.

You will then install the model provider of your choice.

```shell
npm install @ai-sdk/openai
```

###### @/index.ts (Node.js Runtime)

```ts
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai'; // Ensure OPENAI_API_KEY environment variable is set

const { text } = await generateText({
  model: openai('gpt-4o'),
  system: 'You are a friendly assistant!',
  prompt: 'Why is the sky blue?',
});

console.log(text);
```

### AI SDK UI

The [AI SDK UI](https://sdk.vercel.ai/docs/ai-sdk-ui/overview) module provides a set of hooks that help you build chatbots and generative user interfaces. These hooks are framework agnostic, so they can be used in Next.js, React, Svelte, Vue, and SolidJS.

###### @/app/page.tsx (Next.js App Router)

```tsx
'use client';

import { useChat } from 'ai/react';

export default function Page() {
  const { messages, input, handleSubmit, handleInputChange, status } =
    useChat();

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          <div>{message.role}</div>
          <div>{message.content}</div>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          placeholder="Send a message..."
          onChange={handleInputChange}
          disabled={status !== 'ready'}
        />
      </form>
    </div>
  );
}
```

###### @/app/api/chat/route.ts (Next.js App Router)

```ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant.',
    messages,
  });

  return result.toDataStreamResponse();
}
```

## Templates

We've built [templates](https://vercel.com/templates?type=ai) that include AI SDK integrations for different use cases, providers, and frameworks. You can use these templates to get started with your AI-powered application.

## Community

The AI SDK community can be found on [GitHub Discussions](https://github.com/vercel/ai/discussions) where you can ask questions, voice ideas, and share your projects with other people.

## Contributing

Contributions to the AI SDK are welcome and highly appreciated. However, before you jump right into it, we would like you to review our [Contribution Guidelines](https://github.com/vercel/ai/blob/main/CONTRIBUTING.md) to make sure you have smooth experience contributing to AI SDK.

## Authors

This library is created by [Vercel](https://vercel.com) and [Next.js](https://nextjs.org) team members, with contributions from the [Open Source Community](https://github.com/vercel/ai/graphs/contributors).


================================================
File: CHANGELOG.md
================================================
You can find the changelogs for the individual packages in their respective `CHANGELOG.md` files:

### Main AI SDK package

- [ai](./packages/ai/CHANGELOG.md)

### Providers

- [@ai-sdk/amazon-bedrock](./packages/amazon-bedrock/CHANGELOG.md)
- [@ai-sdk/anthropic](./packages/anthropic/CHANGELOG.md)
- [@ai-sdk/azure](./packages/azure/CHANGELOG.md)
- [@ai-sdk/cerebras](./packages/cerebras/CHANGELOG.md)
- [@ai-sdk/cohere](./packages/cohere/CHANGELOG.md)
- [@ai-sdk/deepinfra](./packages/deepinfra/CHANGELOG.md)
- [@ai-sdk/deepseek](./packages/deepseek/CHANGELOG.md)
- [@ai-sdk/fal](./packages/fal/CHANGELOG.md)
- [@ai-sdk/fireworks](./packages/fireworks/CHANGELOG.md)
- [@ai-sdk/google](./packages/google/CHANGELOG.md)
- [@ai-sdk/google-vertex](./packages/google-vertex/CHANGELOG.md)
- [@ai-sdk/groq](./packages/groq/CHANGELOG.md)
- [@ai-sdk/luma](./packages/luma/CHANGELOG.md)
- [@ai-sdk/mistral](./packages/mistral/CHANGELOG.md)
- [@ai-sdk/openai](./packages/openai/CHANGELOG.md)
- [@ai-sdk/openai-compatible](./packages/openai-compatible/CHANGELOG.md)
- [@ai-sdk/perplexity](./packages/perplexity/CHANGELOG.md)
- [@ai-sdk/togetherai](./packages/togetherai/CHANGELOG.md)
- [@ai-sdk/xai](./packages/xai/CHANGELOG.md)

### UI integrations

- [@ai-sdk/react](./packages/react/CHANGELOG.md)
- [@ai-sdk/solid](./packages/solid/CHANGELOG.md)
- [@ai-sdk/svelte](./packages/svelte/CHANGELOG.md)
- [@ai-sdk/vue](./packages/vue/CHANGELOG.md)

### Other

- [@ai-sdk/codemod](./packages/codemod/CHANGELOG.md)
- [@ai-sdk/provider](./packages/provider/CHANGELOG.md)
- [@ai-sdk/provider-utils](./packages/provider-utils/CHANGELOG.md)
- [@ai-sdk/swarm](./packages/swarm/CHANGELOG.md)
- [@ai-sdk/ui-utils](./packages/ui-utils/CHANGELOG.md)
- [@ai-sdk/valibot](./packages/valibot/CHANGELOG.md)


================================================
File: CONTRIBUTING.md
================================================
# Contributing to the AI SDK

We deeply appreciate your interest in contributing to our repository! Whether you're reporting bugs, suggesting enhancements, improving docs, or submitting pull requests, your contributions help improve the project for everyone.

## Reporting Bugs

If you've encountered a bug in the project, we encourage you to report it to us. Please follow these steps:

1. **Check the Issue Tracker**: Before submitting a new bug report, please check our issue tracker to see if the bug has already been reported. If it has, you can add to the existing report.
2. **Create a New Issue**: If the bug hasn't been reported, create a new issue. Provide a clear title and a detailed description of the bug. Include any relevant logs, error messages, and steps to reproduce the issue.
3. **Label Your Issue**: If possible, label your issue as a `bug` so it's easier for maintainers to identify.

## Suggesting Enhancements

We're always looking for suggestions to make our project better. If you have an idea for an enhancement, please:

1. **Check the Issue Tracker**: Similar to bug reports, please check if someone else has already suggested the enhancement. If so, feel free to add your thoughts to the existing issue.
2. **Create a New Issue**: If your enhancement hasn't been suggested yet, create a new issue. Provide a detailed description of your suggested enhancement and how it would benefit the project.

## Improving Documentation

Documentation is crucial for understanding and using our project effectively.
You can find the content of our docs under [`content`](https://github.com/vercel/ai/tree/main/content).

To fix smaller typos, you can edit the code directly in GitHub or use Github.dev (press `.` in Github).

If you want to make larger changes, please check out the Code Contributions section below. It also explains how to fix prettier issues that you might encounter during your docs changes.

## Code Contributions

We welcome your contributions to our code and documentation. Here's how you can contribute:

### Environment Setup

AI SDK development requires PNPM v9 (lockfile version) or higher and Node v20 or higher.

### Setting Up the Repository Locally

To set up the repository on your local machine, follow these steps:

1. **Fork the Repository**: Make a copy of the repository to your GitHub account.
2. **Clone the Repository**: Clone the repository to your local machine, e.g. using `git clone`.
3. **Install Node**: If you haven't already, install Node v20.
4. **Install pnpm**: If you haven't already, install pnpm v9. You can do this by running `npm install -g pnpm@9` if you're using npm. Alternatively, if you're using Homebrew (Mac), you can run `brew install pnpm`. For more see [the pnpm site](https://pnpm.io/installation).
5. **Install Dependencies**: Navigate to the project directory and run `pnpm install` to install all necessary dependencies.
6. **Build the Project**: Run `pnpm build` in the root to build all packages.

### Running the Examples

1. `cd examples/ai-core` (for AI SDK Core, or another example folder)
1. AI SDK Core examples: run e.g. `pnpm tsx src/stream-text/openai.ts`
1. Other framework examples: run `pnpm dev` and go to the browser url

### Local Development Workflow

#### Building Packages

To build the package that you're working on, run `pnpm build` or `pnpm build:watch` in the package folder.
This command updates the `dist` folder with the new version of the package.
Once built, the new code is picked up by the examples.

#### Testing Packages

To test the package that you're working on, run `pnpm test` in the package folder.
You do not need to rebuild your package to test it (only dependencies need to be built).
Some packages like `ai` also have more details tests and watch mode, see their `package.json` for more information.

### Submitting Pull Requests

We greatly appreciate your pull requests. Here are the steps to submit them:

1. **Create a New Branch**: Initiate your changes in a fresh branch. It's recommended to name the branch in a manner that signifies the changes you're implementing.
2. **Commit Your Changes**: Ensure your commits are succinct and clear, detailing what modifications have been made and the reasons behind them.
3. **Push the Changes to Your GitHub Repository**: After committing your changes, push them to your GitHub repository.
4. **Open a Pull Request**: Propose your changes for review. Furnish a lucid title and description of your contributions. Make sure to link any relevant issues your PR resolves.
5. **Respond to Feedback**: Stay receptive to and address any feedback or alteration requests from the project maintainers.

### Fixing Prettier Issues

> [!TIP]
> Run `pnpm prettier-fix` before opening a pull request.

If you encounter any prettier issues, you can fix them by running `pnpm prettier-fix`. This command will automatically fix any formatting issues in your code.

Thank you for contributing to the AI SDK! Your efforts help us improve the project for everyone.


================================================
File: LICENSE
================================================
Copyright 2023 Vercel, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

================================================
File: package.json
================================================
{
  "private": true,
  "name": "ai-repo",
  "scripts": {
    "build": "turbo build",
    "changeset": "changeset",
    "clean": "turbo clean",
    "dev": "turbo dev --no-cache  --concurrency 16 --continue",
    "lint": "turbo lint",
    "prepare": "husky install",
    "prettier-check": "prettier --check \"**/*.{js,ts,tsx,md,mdx}\"",
    "type-check": "turbo type-check",
    "prettier-fix": "prettier --write \"**/*.{js,ts,tsx,md,mdx}\"",
    "publint": "turbo publint",
    "test": "turbo test",
    "ci:release": "turbo clean && turbo build && changeset publish",
    "ci:version": "changeset version && node .github/scripts/cleanup-examples-changesets.mjs && pnpm install --no-frozen-lockfile",
    "clean-examples": "node .github/scripts/cleanup-examples-changesets.mjs && pnpm install --no-frozen-lockfile"
  },
  "lint-staged": {
    "*": [
      "prettier --ignore-unknown --write"
    ]
  },
  "devDependencies": {
    "@changesets/cli": "2.27.10",
    "@playwright/test": "^1.44.1",
    "eslint": "8.57.1",
    "eslint-config-vercel-ai": "workspace:*",
    "husky": "^8.0.0",
    "lint-staged": "15.2.10",
    "next": "15.0.0-canary.23",
    "playwright": "^1.44.1",
    "prettier": "2.8.8",
    "publint": "0.2.12",
    "react": "19.0.0-rc-cc1ec60d0d-20240607",
    "react-dom": "19.0.0-rc-cc1ec60d0d-20240607",
    "turbo": "2.3.3",
    "typescript": "5.6.3",
    "vitest": "2.1.4"
  },
  "engines": {
    "node": "^18.0.0 || ^20.0.0 || ^22.0.0"
  },
  "homepage": "https://sdk.vercel.ai/docs",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/vercel/ai.git"
  },
  "license": "Apache License",
  "bugs": {
    "url": "https://github.com/vercel/ai/issues"
  },
  "keywords": [
    "ai"
  ],
  "packageManager": "pnpm@9.12.3",
  "prettier": {
    "tabWidth": 2,
    "useTabs": false,
    "singleQuote": true,
    "arrowParens": "avoid",
    "trailingComma": "all"
  }
}


================================================
File: pnpm-workspace.yaml
================================================
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'
  - 'examples/*'
  - 'packages/ai/tests/e2e/next-server'


================================================
File: socket.yaml
================================================
# top level version field is required
version: 2

githubApp:
  enabled: true
  pullRequestAlertsEnabled: false
  dependencyOverviewEnabled: false
  projectReportsEnabled: true

projectIgnorePaths:
  - '.github/'
  - 'examples/'


================================================
File: turbo.json
================================================
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": ["CI", "PORT"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "env": [
        "ANTHROPIC_API_KEY",
        "ASSISTANT_ID",
        "AWS_REGION",
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
        "BASETEN_API_KEY",
        "CEREBRAS_API_KEY",
        "COHERE_API_KEY",
        "DEEPINFRA_API_KEY",
        "DEEPSEEK_API_KEY",
        "FAL_API_KEY",
        "FIREWORKS_API_KEY",
        "GOOGLE_API_KEY",
        "GOOGLE_APPLICATION_CREDENTIALS",
        "GOOGLE_CLIENT_EMAIL",
        "GOOGLE_GENERATIVE_AI_API_KEY",
        "GOOGLE_PRIVATE_KEY",
        "GOOGLE_PRIVATE_KEY_ID",
        "GOOGLE_VERTEX_LOCATION",
        "GOOGLE_VERTEX_PROJECT",
        "GROQ_API_KEY",
        "LUMA_API_KEY",
        "MISTRAL_API_KEY",
        "NEXT_RUNTIME",
        "NIM_API_KEY",
        "NODE_ENV",
        "OPENAI_API_KEY",
        "OPENAI_API_BASE",
        "PERPLEXITY_API_KEY",
        "REPLICATE_API_TOKEN",
        "SENTRY_AUTH_TOKEN",
        "SENTRY_ORG",
        "SENTRY_PROJECT",
        "TOGETHER_AI_API_KEY",
        "VERCEL_URL",
        "XAI_API_KEY"
      ],
      "outputs": [
        "dist/**",
        ".next/**",
        "!.next/cache/**",
        ".nuxt/**",
        ".svelte-kit/**",
        ".vinxi/**"
      ]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^build", "build"]
    },
    "test": {
      "dependsOn": ["^build", "build"]
    },
    "publint": {
      "dependsOn": ["^build", "build"]
    },
    "clean": {
      "dependsOn": ["^clean"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "prettier-check": {},
    "integration-test": {
      "dependsOn": ["^build", "build"]
    }
  }
}


================================================
File: .eslintrc.js
================================================
module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-vercel-ai`
  extends: ['vercel-ai'],
  settings: {
    next: {
      rootDir: ['apps/*/'],
    },
  },
};


================================================
File: .kodiak.toml
================================================
# .kodiak.toml
version = 1

[merge]
automerge_label = "automerge"
require_automerge_label = false
method = "squash"
delete_branch_on_merge = true
optimistic_updates = false
prioritize_ready_to_merge = true
notify_on_conflict = false

[merge.message]
title = "pull_request_title"
body = "pull_request_body"
include_pr_number = true
body_type = "markdown"
strip_html_comments = true


================================================
File: .npmrc
================================================
auto-install-peers = true
link-workspace-packages = true

================================================
File: .prettierignore
================================================
.next
.nuxt
node_modules
dist
.svelte-kit
.solid
_nuxt
__testfixtures__


================================================
File: content/cookbook/01-next/10-generate-text.mdx
================================================
---
title: Generate Text
description: Learn how to generate text using the AI SDK and Next.js.
tags: ['next']
---

# Generate Text

A situation may arise when you need to generate text based on a prompt. For example, you may want to generate a response to a question or summarize a body of text. The `generateText` function can be used to generate text based on the input prompt.

<Browser>
  <TextGeneration />
</Browser>

## Client

Let's create a simple React component that will make a POST request to the `/api/completion` endpoint when a button is clicked. The endpoint will generate text based on the input prompt.

```tsx filename="app/page.tsx"
'use client';

import { useState } from 'react';

export default function Page() {
  const [generation, setGeneration] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      <div
        onClick={async () => {
          setIsLoading(true);

          await fetch('/api/completion', {
            method: 'POST',
            body: JSON.stringify({
              prompt: 'Why is the sky blue?',
            }),
          }).then(response => {
            response.json().then(json => {
              setGeneration(json.text);
              setIsLoading(false);
            });
          });
        }}
      >
        Generate
      </div>

      {isLoading ? 'Loading...' : generation}
    </div>
  );
}
```

## Server

Let's create a route handler for `/api/completion` that will generate text based on the input prompt. The route will call the `generateText` function from the `ai` module, which will then generate text based on the input prompt and return it.

```typescript filename='app/api/completion/route.ts'
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  const { text } = await generateText({
    model: openai('gpt-4'),
    system: 'You are a helpful assistant.',
    prompt,
  });

  return Response.json({ text });
}
```

---

<GithubLink link="https://github.com/vercel/ai/blob/main/examples/next-openai-pages/pages/basics/generate-text/index.tsx" />


================================================
File: content/cookbook/01-next/11-generate-text-with-chat-prompt.mdx
================================================
---
title: Generate Text with Chat Prompt
description: Learn how to generate text with chat prompt using the AI SDK and Next.js
tags: ['next', 'streaming', 'chat']
---

# Generate Text with Chat Prompt

Previously, you were able to generate text and objects using either a single message prompt, a system prompt, or a combination of both of them. However, there may be times when you want to generate text based on a series of messages.

A chat completion allows you to generate text based on a series of messages. This series of messages can be any series of interactions between any number of systems, but the most popular and relatable use case has been a series of messages that represent a conversation between a user and a model.

<Browser>
  <ChatGeneration
    history={[
      { role: 'User', content: 'How is it going?' },
      { role: 'Assistant', content: 'All good, how may I help you?' },
    ]}
    inputMessage={{ role: 'User', content: 'Why is the sky blue?' }}
    outputMessage={{
      role: 'Assistant',
      content: 'The sky is blue because of rayleigh scattering.',
    }}
  />
</Browser>

## Client

Let's start by creating a simple chat interface with an input field that sends the user's message and displays the conversation history. You will call the `/api/chat` endpoint to generate the assistant's response.

```tsx filename='app/page.tsx'
'use client';

import { CoreMessage } from 'ai';
import { useState } from 'react';

export default function Page() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<CoreMessage[]>([]);

  return (
    <div>
      <input
        value={input}
        onChange={event => {
          setInput(event.target.value);
        }}
        onKeyDown={async event => {
          if (event.key === 'Enter') {
            setMessages(currentMessages => [
              ...currentMessages,
              { role: 'user', content: input },
            ]);

            const response = await fetch('/api/chat', {
              method: 'POST',
              body: JSON.stringify({
                messages: [...messages, { role: 'user', content: input }],
              }),
            });

            const { messages: newMessages } = await response.json();

            setMessages(currentMessages => [
              ...currentMessages,
              ...newMessages,
            ]);
          }
        }}
      />

      {messages.map((message, index) => (
        <div key={`${message.role}-${index}`}>
          {typeof message.content === 'string'
            ? message.content
            : message.content
                .filter(part => part.type === 'text')
                .map((part, partIndex) => (
                  <div key={partIndex}>{part.text}</div>
                ))}
        </div>
      ))}
    </div>
  );
}
```

## Server

Next, let's create the `/api/chat` endpoint that generates the assistant's response based on the conversation history.

```typescript filename='app/api/chat/route.ts'
import { CoreMessage, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  const { response } = await generateText({
    model: openai('gpt-4'),
    system: 'You are a helpful assistant.',
    messages,
  });

  return Response.json({ messages: response.messages });
}
```

---

<GithubLink link="https://github.com/vercel/ai/blob/main/examples/next-openai-pages/pages/chat/generate-chat/index.tsx" />


================================================
File: content/cookbook/01-next/12-generate-image-with-chat-prompt.mdx
================================================
---
title: Generate Image with Chat Prompt
description: Learn how to generate an image with a chat prompt using the AI SDK and Next.js
tags: ['next', 'streaming', 'chat', 'image generation', 'tools']
---

# Generate Image with Chat Prompt

When building a chatbot, you may want to allow the user to generate an image. This can be done by creating a tool that generates an image using the [`experimental_generateImage`](/docs/reference/ai-sdk-core/generate-image#generateimage) function from the AI SDK.

## Server

Let's create an endpoint at `/api/chat` that generates the assistant's response based on the conversation history. You will also define a tool called `generateImage` that will generate an image based on the assistant's response.

```typescript filename='app/api/chat/route.ts'
import { openai } from '@ai-sdk/openai';
import { experimental_generateImage, Message, streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(request: Request) {
  const { messages }: { messages: Message[] } = await request.json();

  // filter through messages and remove base64 image data to avoid sending to the model
  const formattedMessages = messages.map(m => {
    if (m.role === 'assistant' && m.toolInvocations) {
      m.toolInvocations.forEach(ti => {
        if (ti.toolName === 'generateImage' && ti.state === 'result') {
          ti.result.image = `redacted-for-length`;
        }
      });
    }
    return m;
  });

  const result = streamText({
    model: openai('gpt-4o'),
    messages: formattedMessages,
    tools: {
      generateImage: tool({
        description: 'Generate an image',
        parameters: z.object({
          prompt: z.string().describe('The prompt to generate the image from'),
        }),
        execute: async ({ prompt }) => {
          const { image } = await experimental_generateImage({
            model: openai.image('dall-e-3'),
            prompt,
          });
          // in production, save this image to blob storage and return a URL
          return { image: image.base64, prompt };
        },
      }),
    },
  });
  return result.toDataStreamResponse();
}
```

<Note>
  In production, you should save the generated image to a blob storage and
  return a URL instead of the base64 image data. If you don't, the base64 image
  data will be sent to the model which may cause the generation to fail.
</Note>

## Client

Let's create a simple chat interface with `useChat`. You will call the `/api/chat` endpoint to generate the assistant's response. If the assistant's response contains a `generateImage` tool invocation, you will display the tool result (the image in base64 format and the prompt) using the Next `Image` component.

```tsx filename='app/page.tsx'
'use client';

import { useChat } from '@ai-sdk/react';
import Image from 'next/image';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="space-y-4">
        {messages.map(m => (
          <div key={m.id} className="whitespace-pre-wrap">
            <div key={m.id}>
              <div className="font-bold">{m.role}</div>
              {m.toolInvocations ? (
                m.toolInvocations.map(ti =>
                  ti.toolName === 'generateImage' ? (
                    ti.state === 'result' ? (
                      <Image
                        key={ti.toolCallId}
                        src={`data:image/png;base64,${ti.result.image}`}
                        alt={ti.result.prompt}
                        height={400}
                        width={400}
                      />
                    ) : (
                      <div key={ti.toolCallId} className="animate-pulse">
                        Generating image...
                      </div>
                    )
                  ) : null,
                )
              ) : (
                <p>{m.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
```


================================================
File: content/cookbook/01-next/120-stream-assistant-response.mdx
================================================
---
title: Stream Assistant Response
description: Learn how to stream OpenAI Assistant's response using the AI SDK and Next.js
tags: ['next', 'streaming', 'assistant']
---

# Stream Assistant Response

## Client

Let's create a simple chat interface that allows users to send messages to the assistant and receive responses. You will integrate the `useAssistant` hook from `@ai-sdk/react` to stream the messages and status.

```tsx filename='app/page.tsx'
'use client';

import { Message, useAssistant } from '@ai-sdk/react';

export default function Page() {
  const { status, messages, input, submitMessage, handleInputChange } =
    useAssistant({ api: '/api/assistant' });

  return (
    <div className="flex flex-col gap-2">
      <div className="p-2">status: {status}</div>

      <div className="flex flex-col p-2 gap-2">
        {messages.map((message: Message) => (
          <div key={message.id} className="flex flex-row gap-2">
            <div className="w-24 text-zinc-500">{`${message.role}: `}</div>
            <div className="w-full">{message.content}</div>
          </div>
        ))}
      </div>

      <form onSubmit={submitMessage} className="fixed bottom-0 p-2 w-full">
        <input
          disabled={status !== 'awaiting_message'}
          value={input}
          onChange={handleInputChange}
          className="bg-zinc-100 w-full p-2"
        />
      </form>
    </div>
  );
}
```

## Server

Next, you will create an API route for `api/assistant` to handle the assistant's messages and responses. You will use the `AssistantResponse` function from `ai` to stream the assistant's responses back to the `useAssistant` hook on the client.

```tsx filename='app/api/assistant/route.ts'
import OpenAI from 'openai';
import { AssistantResponse } from 'ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
  const input: {
    threadId: string | null;
    message: string;
  } = await req.json();

  const threadId = input.threadId ?? (await openai.beta.threads.create({})).id;

  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: input.message,
  });

  return AssistantResponse(
    { threadId, messageId: createdMessage.id },
    async ({ forwardStream }) => {
      const runStream = openai.beta.threads.runs.stream(threadId, {
        assistant_id:
          process.env.ASSISTANT_ID ??
          (() => {
            throw new Error('ASSISTANT_ID environment is not set');
          })(),
      });

      await forwardStream(runStream);
    },
  );
}
```

---

<GithubLink link="https://github.com/vercel/ai/blob/main/examples/next-openai-pages/pages/assistants/stream-assistant-response/index.tsx" />


================================================
File: content/cookbook/01-next/121-stream-assistant-response-with-tools.mdx
================================================
---
title: Stream Assistant Response with Tools
description: Learn how to stream OpenAI Assistant's response using the AI SDK and Next.js
tags: ['next', 'streaming', 'assistant']
---

# Stream Assistant Response with Tools

Let's create a simple chat interface that allows users to send messages to the assistant and receive responses and give it the ability to use tools. You will integrate the `useAssistant` hook from `@ai-sdk/react` to stream the messages and status.

You will need to provide the list of tools on the OpenAI [Assistant Dashboard](https://platform.openai.com/assistants). You can use the following schema to create a tool to convert celsius to fahrenheit.

```json
{
  "name": "celsiusToFahrenheit",
  "description": "convert celsius to fahrenheit.",
  "parameters": {
    "type": "object",
    "properties": {
      "value": {
        "type": "number",
        "description": "the value in celsius."
      }
    },
    "required": ["value"]
  }
}
```

## Client

Let's create a simple chat interface that allows users to send messages to the assistant and receive responses. You will integrate the `useAssistant` hook from `@ai-sdk/react` to stream the messages and status.

```tsx filename='app/page.tsx'
'use client';

import { Message, useAssistant } from '@ai-sdk/react';

export default function Page() {
  const { status, messages, input, submitMessage, handleInputChange } =
    useAssistant({ api: '/api/assistant' });

  return (
    <div className="flex flex-col gap-2">
      <div className="p-2">status: {status}</div>

      <div className="flex flex-col p-2 gap-2">
        {messages.map((message: Message) => (
          <div key={message.id} className="flex flex-row gap-2">
            <div className="w-24 text-zinc-500">{`${message.role}: `}</div>
            <div className="w-full">{message.content}</div>
          </div>
        ))}
      </div>

      <form onSubmit={submitMessage} className="fixed bottom-0 p-2 w-full">
        <input
          disabled={status !== 'awaiting_message'}
          value={input}
          onChange={handleInputChange}
          className="bg-zinc-100 w-full p-2"
        />
      </form>
    </div>
  );
}
```

## Server

Next, you will create an API route for `api/assistant` to handle the assistant's messages and responses. You will use the `AssistantResponse` function from `ai` to stream the assistant's responses back to the `useAssistant` hook on the client.

```tsx filename='app/api/assistant/route.ts'
import { AssistantResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
  const input: {
    threadId: string | null;
    message: string;
  } = await req.json();

  const threadId = input.threadId ?? (await openai.beta.threads.create({})).id;

  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: input.message,
  });

  return AssistantResponse(
    { threadId, messageId: createdMessage.id },
    async ({ forwardStream }) => {
      const runStream = openai.beta.threads.runs.stream(threadId, {
        assistant_id:
          process.env.ASSISTANT_ID ??
          (() => {
            throw new Error('ASSISTANT_ID is not set');
          })(),
      });

      let runResult = await forwardStream(runStream);

      while (
        runResult?.status === 'requires_action' &&
        runResult.required_action?.type === 'submit_tool_outputs'
      ) {
        const tool_outputs =
          runResult.required_action.submit_tool_outputs.tool_calls.map(
            (toolCall: any) => {
              const parameters = JSON.parse(toolCall.function.arguments);

              switch (toolCall.function.name) {
                case 'celsiusToFahrenheit':
                  const celsius = parseFloat(parameters.value);
                  const fahrenheit = celsius * (9 / 5) + 32;

                  return {
                    tool_call_id: toolCall.id,
                    output: `${celsius}°C is ${fahrenheit.toFixed(2)}°F`,
                  };

                default:
                  throw new Error(
                    `Unknown tool call function: ${toolCall.function.name}`,
                  );
              }
            },
          );

        runResult = await forwardStream(
          openai.beta.threads.runs.submitToolOutputsStream(
            threadId,
            runResult.id,
            { tool_outputs },
          ),
        );
      }
    },
  );
}
```

---

<GithubLink link="https://github.com/vercel/ai/blob/main/examples/next-openai-pages/pages/assistants/stream-assistant-response-with-tools/index.tsx" />


================================================
File: content/cookbook/01-next/122-caching-middleware.mdx
================================================
---
title: Caching Middleware
description: Learn how to create a caching middleware with Next.js and KV.
tags: ['next', 'streaming', 'caching', 'middleware']
---

# Caching Middleware

Let's create a simple chat interface that uses [`LanguageModelMiddleware`](/docs/ai-sdk-core/middleware) to cache the assistant's responses in fast KV storage.

## Client

Let's create a simple chat interface that allows users to send messages to the assistant and receive responses. You will integrate the `useChat` hook from `@ai-sdk/react` to stream responses.

```tsx filename='app/page.tsx'
'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, error } = useChat();
  if (error) return <div>{error.message}</div>;

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="space-y-4">
        {messages.map(m => (
          <div key={m.id} className="whitespace-pre-wrap">
            <div>
              <div className="font-bold">{m.role}</div>
              {m.toolInvocations ? (
                <pre>{JSON.stringify(m.toolInvocations, null, 2)}</pre>
              ) : (
                <p>{m.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
```

## Middleware

Next, you will create a `LanguageModelMiddleware` that caches the assistant's responses in KV storage.
`LanguageModelMiddleware` has two methods: `wrapGenerate` and `wrapStream`.
`wrapGenerate` is called when using [`generateText`](/docs/reference/ai-sdk-core/generate-text) and [`generateObject`](/docs/reference/ai-sdk-core/generate-object), while `wrapStream` is called when using [`streamText`](/docs/reference/ai-sdk-core/stream-text) and [`streamObject`](/docs/reference/ai-sdk-core/stream-object).

For `wrapGenerate`, you can cache the response directly.
Instead, for `wrapStream`, you cache an array of the stream parts, which can then be used with [`simulateReadableStream`](/docs/reference/ai-sdk-core/simulate-readable-stream) function to create a simulated `ReadableStream` that returns the cached response.
In this way, the cached response is returned chunk-by-chunk as if it were being generated by the model.
You can control the initial delay and delay between chunks by adjusting the `initialDelayInMs` and `chunkDelayInMs` parameters of `simulateReadableStream`.

```tsx filename='ai/middleware.ts'
import { Redis } from '@upstash/redis';
import {
  type LanguageModelV1,
  type LanguageModelV1Middleware,
  type LanguageModelV1StreamPart,
  simulateReadableStream,
} from 'ai';

const redis = new Redis({
  url: process.env.KV_URL,
  token: process.env.KV_TOKEN,
});

export const cacheMiddleware: LanguageModelV1Middleware = {
  wrapGenerate: async ({ doGenerate, params }) => {
    const cacheKey = JSON.stringify(params);

    const cached = (await redis.get(cacheKey)) as Awaited<
      ReturnType<LanguageModelV1['doGenerate']>
    > | null;

    if (cached !== null) {
      return {
        ...cached,
        response: {
          ...cached.response,
          timestamp: cached?.response?.timestamp
            ? new Date(cached?.response?.timestamp)
            : undefined,
        },
      };
    }

    const result = await doGenerate();

    redis.set(cacheKey, result);

    return result;
  },
  wrapStream: async ({ doStream, params }) => {
    const cacheKey = JSON.stringify(params);

    // Check if the result is in the cache
    const cached = await redis.get(cacheKey);

    // If cached, return a simulated ReadableStream that yields the cached result
    if (cached !== null) {
      // Format the timestamps in the cached response
      const formattedChunks = (cached as LanguageModelV1StreamPart[]).map(p => {
        if (p.type === 'response-metadata' && p.timestamp) {
          return { ...p, timestamp: new Date(p.timestamp) };
        } else return p;
      });
      return {
        stream: simulateReadableStream({
          initialDelayInMs: 0,
          chunkDelayInMs: 10,
          chunks: formattedChunks,
        }),
        rawCall: { rawPrompt: null, rawSettings: {} },
      };
    }

    // If not cached, proceed with streaming
    const { stream, ...rest } = await doStream();

    const fullResponse: LanguageModelV1StreamPart[] = [];

    const transformStream = new TransformStream<
      LanguageModelV1StreamPart,
      LanguageModelV1StreamPart
    >({
      transform(chunk, controller) {
        fullResponse.push(chunk);
        controller.enqueue(chunk);
      },
      flush() {
        // Store the full response in the cache after streaming is complete
        redis.set(cacheKey, fullResponse);
      },
    });

    return {
      stream: stream.pipeThrough(transformStream),
      ...rest,
    };
  },
};
```

<Note>
  This example uses `@upstash/redis` to store and retrieve the assistant's
  responses but you can use any KV storage provider you would like.
</Note>

## Server

Finally, you will create an API route for `api/chat` to handle the assistant's messages and responses. You can use your cache middleware by wrapping the model with `wrapLanguageModel` and passing the middleware as an argument.

```tsx filename='app/api/chat/route.ts'
import { cacheMiddleware } from '@/ai/middleware';
import { openai } from '@ai-sdk/openai';
import { wrapLanguageModel, streamText, tool } from 'ai';
import { z } from 'zod';

const wrappedModel = wrapLanguageModel({
  model: openai('gpt-4o-mini'),
  middleware: cacheMiddleware,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: wrappedModel,
    messages,
    tools: {
      weather: tool({
        description: 'Get the weather in a location',
        parameters: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: async ({ location }) => ({
          location,
          temperature: 72 + Math.floor(Math.random() * 21) - 10,
        }),
      }),
    },
  });
  return result.toDataStreamResponse();
}
```


================================================
File: content/cookbook/01-next/20-stream-text.mdx
================================================
---
title: Stream Text
description: Learn how to stream text using the AI SDK and Next.js
tags: ['next', 'streaming']
---

# Stream Text

Text generation can sometimes take a long time to complete, especially when you're generating a couple of paragraphs. In such cases, it is useful to stream the text generation process to the client in real-time. This allows the client to display the generated text as it is being generated, rather than have users wait for it to complete before displaying the result.

<Browser>
  <TextGeneration stream />
</Browser>

## Client

Let's create a simple React component that imports the `useCompletion` hook from the `@ai-sdk/react` module. The `useCompletion` hook will call the `/api/completion` endpoint when a button is clicked. The endpoint will generate text based on the input prompt and stream it to the client.

```tsx filename="app/page.tsx"
'use client';

import { useCompletion } from '@ai-sdk/react';

export default function Page() {
  const { completion, complete } = useCompletion({
    api: '/api/completion',
  });

  return (
    <div>
      <div
        onClick={async () => {
          await complete('Why is the sky blue?');
        }}
      >
        Generate
      </div>

      {completion}
    </div>
  );
}
```

## Server

Let's create a route handler for `/api/completion` that will generate text based on the input prompt. The route will call the `streamText` function from the `ai` module, which will then generate text based on the input prompt and stream it to the client.

```typescript filename='app/api/completion/route.ts'
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  const result = streamText({
    model: openai('gpt-4'),
    system: 'You are a helpful assistant.',
    prompt,
  });

  return result.toDataStreamResponse();
}
```

---

<GithubLink link="https://github.com/vercel/ai/blob/main/examples/next-openai-pages/pages/basics/stream-text/index.tsx" />


================================================
File: content/cookbook/01-next/21-stream-text-with-chat-prompt.mdx
================================================
---
title: Stream Text with Chat Prompt
description: Learn how to generate text using the AI SDK and Next.js
tags: ['next', 'streaming', 'chat']
---

# Stream Text with Chat Prompt

Chat completion can sometimes take a long time to finish, especially when the response is big. In such cases, it is useful to stream the chat completion to the client in real-time. This allows the client to display the new message as it is being generated by the model, rather than have users wait for it to finish.

<Browser>
  <ChatGeneration
    stream
    history={[
      { role: 'User', content: 'How is it going?' },
      { role: 'Assistant', content: 'All good, how may I help you?' },
    ]}
    inputMessage={{ role: 'User', content: 'Why is the sky blue?' }}
    outputMessage={{
      role: 'Assistant',
      content: 'The sky is blue because of rayleigh scattering.',
    }}
  />
</Browser>

## Client

Let's create a React component that imports the `useChat` hook from the `@ai-sdk/react` module. The `useChat` hook will call the `/api/chat` endpoint when the user sends a message. The endpoint will generate the assistant's response based on the conversation history and stream it to the client.

```tsx filename='app/page.tsx'
'use client';

import { useChat } from '@ai-sdk/react';

export default function Page() {
  const { messages, input, setInput, append } = useChat();

  return (
    <div>
      <input
        value={input}
        onChange={event => {
          setInput(event.target.value);
        }}
        onKeyDown={async event => {
          if (event.key === 'Enter') {
            append({ content: input, role: 'user' });
          }
        }}
      />

      {messages.map((message, index) => (
        <div key={index}>{message.content}</div>
      ))}
    </div>
  );
}
```

## Server

Next, let's create the `/api/chat` endpoint that generates the assistant's response based on the conversation history.

```typescript filename='app/api/chat/route.ts'
import { streamText, UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant.',
    messages,
  });

  return result.toDataStreamResponse();
}
```

---

<GithubLink link="https://github.com/vercel/ai/blob/main/examples/next-openai-pages/pages/chat/stream-chat/index.tsx" />


================================================
File: content/cookbook/01-next/22-stream-text-with-image-prompt.mdx
================================================
---
title: Stream Text with Image Prompt
description: Learn how to stream text with an image prompt using the AI SDK and Next.js
tags: ['next', 'streaming', 'multimodal']
---

# Stream Text with Image Prompt

Vision models such as GPT-4 can process both text and images. In this example, we will show you how to send an image URL along with the user's message to the model.

## Using Image URLs

### Server

We split the user's message into two parts: the text and the image URL. We then send both parts to the model.
The last message is the user's message, and we add the image URL to it.

```tsx filename='app/api/chat/route.ts' highlight="8,9,23"
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  // 'data' contains the additional data that you have sent:
  const { messages, data } = await req.json();

  const initialMessages = messages.slice(0, -1);
  const currentMessage = messages[messages.length - 1];

  // Call the language model
  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages: [
      ...initialMessages,
      {
        role: 'user',
        content: [
          { type: 'text', text: currentMessage.content },
          { type: 'image', image: new URL(data.imageUrl) },
        ],
      },
    ],
  });

  // Respond with the stream
  return result.toDataStreamResponse();
}
```

### Client

On the client we can send the image URL along with the user's message by adding the `data` object to the `handleSubmit` function.
You can replace the `imageUrl` with the actual URL of the image you want to send.

```typescript filename='app/page.tsx' highlight="18-20"
'use client';

import { useChat } from '@ai-sdk/react';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.content}
        </div>
      ))}

      <form
        onSubmit={e => {
          handleSubmit(e, {
            data: { imageUrl: 'https://somewhere.com/image.png' },
          });
        }}
      >
        <input
          value={input}
          placeholder="What does the image show..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
```


================================================
File: content/cookbook/01-next/23-chat-with-pdf.mdx
================================================
---
title: Chat with PDFs
description: Learn how to build a chatbot that can understand PDFs using the AI SDK and Next.js
tags: ['next', 'pdf', 'multimodal']
---

# Chat with PDFs

Some language models like Anthropic's Claude Sonnet 3.5 and Google's Gemini 2.0 can understand PDFs and respond to questions about their contents. In this example, we'll show you how to build a chat interface that accepts PDF uploads.

<Note>
  This example requires a provider that supports PDFs, such as Anthropic's
  Claude Sonnet 3.5 or Google's Gemini 2.0. Note OpenAI's GPT-4o does not
  currently support PDFs. Check the [provider
  documentation](/providers/ai-sdk-providers) for up-to-date support
  information.
</Note>

## Implementation

### Server

Create a route handler that will use Anthropic's Claude model to process messages and PDFs:

```tsx filename="app/api/chat/route.ts"
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-latest'),
    messages,
  });

  return result.toDataStreamResponse();
}
```

### Client

Create a chat interface that allows uploading PDFs alongside messages:

```tsx filename="app/page.tsx"
'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useState } from 'react';
import Image from 'next/image';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(m => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.content}
          <div>
            {m?.experimental_attachments
              ?.filter(
                attachment =>
                  attachment?.contentType?.startsWith('image/') ||
                  attachment?.contentType?.startsWith('application/pdf'),
              )
              .map((attachment, index) =>
                attachment.contentType?.startsWith('image/') ? (
                  <Image
                    key={`${m.id}-${index}`}
                    src={attachment.url}
                    width={500}
                    height={500}
                    alt={attachment.name ?? `attachment-${index}`}
                  />
                ) : attachment.contentType?.startsWith('application/pdf') ? (
                  <iframe
                    key={`${m.id}-${index}`}
                    src={attachment.url}
                    width="500"
                    height="600"
                    title={attachment.name ?? `attachment-${index}`}
                  />
                ) : null,
              )}
          </div>
        </div>
      ))}

      <form
        className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl space-y-2"
        onSubmit={event => {
          handleSubmit(event, {
            experimental_attachments: files,
          });

          setFiles(undefined);

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
      >
        <input
          type="file"
          className=""
          onChange={event => {
            if (event.target.files) {
              setFiles(event.target.files);
            }
          }}
          multiple
          ref={fileInputRef}
        />
        <input
          className="w-full p-2"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
```

The code uses the `useChat` hook which handles the file upload and message streaming. The `experimental_attachments` option allows you to send files alongside messages.

Make sure to set up your environment variables with your Anthropic API key:

```env filename=".env.local"
ANTHROPIC_API_KEY=xxxxxxxxx
```

Now you can upload PDFs and ask questions about their contents. The LLM will analyze the PDF and provide relevant responses based on the document's content.


================================================
File: content/cookbook/01-next/24-stream-text-multistep.mdx
================================================
---
title: streamText Multi-Step Cookbook
description: Learn how to create several streamText steps with different settings
tags: ['next', 'streaming']
---

# Stream Text Multi-Step

You may want to have different steps in your stream where each step has different settings,
e.g. models, tools, or system prompts.

With `createDataStreamResponse` and `sendFinish` / `sendStart` options when merging
into the data stream, you can control when the finish and start events are sent to the client,
allowing you to have different steps in a single assistant UI message.

## Server

```typescript filename='app/api/chat/route.ts'
import { openai } from '@ai-sdk/openai';
import { createDataStreamResponse, streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createDataStreamResponse({
    execute: async dataStream => {
      // step 1 example: forced tool call
      const result1 = streamText({
        model: openai('gpt-4o-mini', { structuredOutputs: true }),
        system: 'Extract the user goal from the conversation.',
        messages,
        toolChoice: 'required', // force the model to call a tool
        tools: {
          extractGoal: tool({
            parameters: z.object({ goal: z.string() }),
            execute: async ({ goal }) => goal, // no-op extract tool
          }),
        },
      });

      // forward the initial result to the client without the finish event:
      result1.mergeIntoDataStream(dataStream, {
        experimental_sendFinish: false, // omit the finish event
      });

      // note: you can use any programming construct here, e.g. if-else, loops, etc.
      // workflow programming is normal programming with this approach.

      // example: continue stream with forced tool call from previous step
      const result2 = streamText({
        // different system prompt, different model, no tools:
        model: openai('gpt-4o'),
        system:
          'You are a helpful assistant with a different system prompt. Repeat the extract user goal in your answer.',
        // continue the workflow stream with the messages from the previous step:
        messages: [...messages, ...(await result1.response).messages],
      });

      // forward the 2nd result to the client (incl. the finish event):
      result2.mergeIntoDataStream(dataStream, {
        experimental_sendStart: false, // omit the start event
      });
    },
  });
}
```

## Client

```tsx filename="app/page.tsx"
'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div>
      {messages?.map(message => (
        <div key={message.id}>
          <strong>{`${message.role}: `}</strong>
          {message.parts.map((part, index) => {
            switch (part.type) {
              case 'text':
                return <span key={index}>{part.text}</span>;
              case 'tool-invocation': {
                return (
                  <pre key={index}>
                    {JSON.stringify(part.toolInvocation, null, 2)}
                  </pre>
                );
              }
            }
          })}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
```


================================================
File: content/cookbook/01-next/25-markdown-chatbot-with-memoization.mdx
================================================
---
title: Markdown Chatbot with Memoization
description: Build a chatbot that renders and memoizes Markdown responses with Next.js and the AI SDK.
tags: ['next', 'streaming', 'chatbot', 'markdown']
---

# Markdown Chatbot with Memoization

When building a chatbot with Next.js and the AI SDK, you'll likely want to render the model's responses in Markdown format using a library like `react-markdown`. However, this can have negative performance implications as the Markdown is re-rendered on each new token received from the streaming response.

As conversations get longer and more complex, this performance impact becomes exponentially worse since the entire conversation history is re-rendered with each new token.

This recipe uses memoization - a performance optimization technique where the results of expensive function calls are cached and reused to avoid unnecessary re-computation. In this case, parsed Markdown blocks are memoized to prevent them from being re-parsed and re-rendered on each token update, which means that once a block is fully parsed, it's cached and reused rather than being regenerated. This approach significantly improves rendering performance for long conversations by eliminating redundant parsing and rendering operations.

## Server

On the server, you use a simple route handler that streams the response from the language model.

```tsx filename='app/api/chat/route.ts'
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    system:
      'You are a helpful assistant. Respond to the user in Markdown format.',
    model: openai('gpt-4o'),
    messages,
  });

  return result.toDataStreamResponse();
}
```

## Memoized Markdown Component

Next, create a memoized markdown component that will take in raw Markdown text into blocks and only updates when the content actually changes. This component splits Markdown content into blocks using the `marked` library to identify discrete Markdown elements, then uses React's memoization features to optimize re-rendering by only updating blocks that have actually changed.

```tsx filename='components/memoized-markdown.tsx'
import { marked } from 'marked';
import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map(token => token.raw);
}

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  },
  (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) return false;
    return true;
  },
);

MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock';

export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    return blocks.map((block, index) => (
      <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
    ));
  },
);

MemoizedMarkdown.displayName = 'MemoizedMarkdown';
```

## Client

Finally, on the client, use the `useChat` hook to manage the chat state and render the chat interface. You can use the `MemoizedMarkdown` component to render the message contents in Markdown format without compromising on performance. Additionally, you can render the form in it's own component so as to not trigger unnecessary re-renders of the chat messages. You can also use the `experimental_throttle` option that will throttle data updates to a specified interval, helping to manage rendering performance.

```typescript filename='app/page.tsx'
'use client';

import { useChat } from '@ai-sdk/react';
import { MemoizedMarkdown } from '@/components/memoized-markdown';

export default function Page() {
  const { messages } = useChat({
    id: 'chat',
    // Throttle the messages and data updates to 50ms:
    experimental_throttle: 50,
  });

  return (
    <div className="flex flex-col w-full max-w-xl py-24 mx-auto stretch">
      <div className="space-y-8 mb-4">
        {messages.map(message => (
          <div key={message.id}>
            <div className="font-bold mb-2">
              {message.role === 'user' ? 'You' : 'Assistant'}
            </div>
            <div className="prose space-y-2">
              <MemoizedMarkdown id={message.id} content={message.content} />
            </div>
          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  );
}

const MessageInput = () => {
  const { input, handleSubmit, handleInputChange } = useChat({ id: 'chat' });
  return (
    <form onSubmit={handleSubmit}>
      <input
        className="fixed bottom-0 w-full max-w-xl p-2 mb-8 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
        placeholder="Say something..."
        value={input}
        onChange={handleInputChange}
      />
    </form>
  );
};
```

<Note>
  The chat state is shared between both components by using the same `id` value.
  This allows you to split the form and chat messages into separate components
  while maintaining synchronized state.
</Note>


================================================
File: content/cookbook/01-next/30-generate-object.mdx
================================================
---
title: Generate Object
description: Learn how to generate object using the AI SDK and Next.js
tags: ['next', 'structured data']
---

# Generate Object

Earlier functions like `generateText` and `streamText` gave us the ability to generate unstructured text. However, if you want to generate structured data like JSON, you can provide a schema that describes the structure of your desired object to the `generateObject` function.

The function requires you to provide a schema using [zod](https://zod.dev), a library for defining schemas for JavaScript objects. By using zod, you can also use it to validate the generated object and ensure that it conforms to the specified structure.

<Browser>
  <ObjectGeneration
    object={{
      notifications: [
        {
          name: 'Jamie Roberts',
          message: "Hey! How's the study grind going? Need a coffee boost?",
          minutesAgo: 15,
        },
        {
          name: 'Prof. Morgan',
          message:
            'Reminder: Your term paper is due promptly at 8 AM tomorrow. Please ensure it meets the submission guidelines outlined.',
          minutesAgo: 46,
        },
        {
          name: 'Alex Chen',
          message:
            "Dude, urgent! Borrow your notes for tomorrow's exam? I swear mine got eaten by my dog!",
          minutesAgo: 30,
        },
      ],
    }}
  />
</Browser>

## Client

Let's create a simple React component that will make a POST request to the `/api/completion` endpoint when a button is clicked. The endpoint will return the generated object based on the input prompt and we'll display it.

```tsx filename='app/page.tsx'
'use client';

import { useState } from 'react';

export default function Page() {
  const [generation, setGeneration] = useState();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      <div
        onClick={async () => {
          setIsLoading(true);

          await fetch('/api/completion', {
            method: 'POST',
            body: JSON.stringify({
              prompt: 'Messages during finals week.',
            }),
          }).then(response => {
            response.json().then(json => {
              setGeneration(json.notifications);
              setIsLoading(false);
            });
          });
        }}
      >
        Generate
      </div>

      {isLoading ? 'Loading...' : <pre>{JSON.stringify(generation)}</pre>}
    </div>
  );
}
```

## Server

Let's create a route handler for `/api/completion` that will generate an object based on the input prompt. The route will call the `generateObject` function from the `ai` module, which will then generate an object based on the input prompt and return it.

```typescript filename='app/api/completion/route.ts'
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  const result = await generateObject({
    model: openai('gpt-4'),
    system: 'You generate three notifications for a messages app.',
    prompt,
    schema: z.object({
      notifications: z.array(
        z.object({
          name: z.string().describe('Name of a fictional person.'),
          message: z.string().describe('Do not use emojis or links.'),
          minutesAgo: z.number(),
        }),
      ),
    }),
  });

  return result.toJsonResponse();
}
```

---

<GithubLink link="https://github.com/vercel/ai/blob/main/examples/next-openai-pages/pages/basics/generate-object/index.tsx" />


================================================
File: content/cookbook/01-next/31-generate-object-with-file-prompt.mdx
================================================
---
title: Generate Object with File Prompt through Form Submission
description: Learn how to generate object with file prompt through form submission using the AI SDK and Next.js
tags: ['next', 'multi-modal']
---

# Generate Object with File Prompt through Form Submission

<Note>
  This feature is limited to models/providers that support PDF inputs
  ([Anthropic](/providers/ai-sdk-providers/anthropic#pdf-support), [Google
  Gemini](/providers/ai-sdk-providers/google-generative-ai#file-inputs), and
  [Google Vertex](/providers/ai-sdk-providers/google-vertex#file-inputs)).
</Note>

With select models, you can send PDFs (files) as part of your prompt. Let's create a simple Next.js application that allows a user to upload a PDF send it to an LLM for summarization.

## Client

On the frontend, create a form that allows the user to upload a PDF. When the form is submitted, send the PDF to the `/api/analyze` route.

```tsx file="app/page.tsx"
'use client';

import { useState } from 'react';

export default function Page() {
  const [description, setDescription] = useState<string>();
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <form
        action={async formData => {
          try {
            setLoading(true);
            const response = await fetch('/api/analyze', {
              method: 'POST',
              body: formData,
            });
            setLoading(false);

            if (response.ok) {
              setDescription(await response.text());
            }
          } catch (error) {
            console.error('Analysis failed:', error);
          }
        }}
      >
        <div>
          <label>Upload Image</label>
          <input name="pdf" type="file" accept="application/pdf" />
        </div>
        <button type="submit" disabled={loading}>
          Submit{loading && 'ing...'}
        </button>
      </form>
      {description && <pre>{description}</pre>}
    </div>
  );
}
```

## Server

On the server, create an API route that receives the PDF, sends it to the LLM, and returns the result. This example uses the [ `generateObject` ](/docs/reference/ai-sdk-core/generate-object) function to generate the summary as part of a structured output.

```typescript file="app/api/analyze/route.ts"
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('pdf') as File;

  const result = await generateObject({
    model: anthropic('claude-3-5-sonnet-latest'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze the following PDF and generate a summary.',
          },
          {
            type: 'file',
            data: await file.arrayBuffer(),
            mimeType: 'application/pdf',
          },
        ],
      },
    ],
    schema: z.object({
      summary: z.string().describe('A 50 word sumamry of the PDF.'),
    }),
  });

  return new Response(result.object.summary);
}
```


================================================
File: content/cookbook/01-next/40-stream-object.mdx
================================================
---
title: Stream Object
description: Learn how to stream object using the AI SDK and Next.js
tags: ['next', 'streaming', 'structured data']
---

# Stream Object

Object generation can sometimes take a long time to complete, especially when you're generating a large schema.
In such cases, it is useful to stream the object generation process to the client in real-time.
This allows the client to display the generated object as it is being generated,
rather than have users wait for it to complete before displaying the result.

<Browser>
  <ObjectGeneration
    stream
    object={{
      notifications: [
        {
          name: 'Jamie Roberts',
          message: "Hey! How's the study grind going? Need a coffee boost?",
          minutesAgo: 15,
        },
        {
          name: 'Prof. Morgan',
          message:
            'Reminder: Your term paper is due promptly at 8 AM tomorrow. Please ensure it meets the submission guidelines outlined.',
          minutesAgo: 46,
        },
        {
          name: 'Alex Chen',
          message:
            "Dude, urgent! Borrow your notes for tomorrow's exam? I swear mine got eaten by my dog!",
          minutesAgo: 30,
        },
      ],
    }}
  />
</Browser>

## Object Mode

The `streamObject` function allows you to specify different output strategies using the `output` parameter. By default, the output mode is set to `object`, which will generate exactly the structured object that you specify in the schema option.

### Schema

It is helpful to set up the schema in a separate file that is imported on both the client and server.

```ts filename='app/api/use-object/schema.ts'
import { z } from 'zod';

// define a schema for the notifications
export const notificationSchema = z.object({
  notifications: z.array(
    z.object({
      name: z.string().describe('Name of a fictional person.'),
      message: z.string().describe('Message. Do not use emojis or links.'),
    }),
  ),
});
```

### Client

The client uses [`useObject`](/docs/reference/ai-sdk-ui/use-object) to stream the object generation process.

The results are partial and are displayed as they are received.
Please note the code for handling `undefined` values in the JSX.

```tsx filename='app/page.tsx'
'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { notificationSchema } from './api/use-object/schema';

export default function Page() {
  const { object, submit } = useObject({
    api: '/api/use-object',
    schema: notificationSchema,
  });

  return (
    <div>
      <button onClick={() => submit('Messages during finals week.')}>
        Generate notifications
      </button>

      {object?.notifications?.map((notification, index) => (
        <div key={index}>
          <p>{notification?.name}</p>
          <p>{notification?.message}</p>
        </div>
      ))}
    </div>
  );
}
```

### Server

On the server, we use [`streamObject`](/docs/reference/ai-sdk-core/stream-object) to stream the object generation process.

```typescript filename='app/api/use-object/route.ts'
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { notificationSchema } from './schema';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const context = await req.json();

  const result = streamObject({
    model: openai('gpt-4-turbo'),
    schema: notificationSchema,
    prompt:
      `Generate 3 notifications for a messages app in this context:` + context,
  });

  return result.toTextStreamResponse();
}
```

## Loading State and Stopping the Stream

You can use the `loading` state to display a loading indicator while the object is being generated.
You can also use the `stop` function to stop the object generation process.

```tsx filename='app/page.tsx' highlight="7,16,21,24"
'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { notificationSchema } from './api/use-object/schema';

export default function Page() {
  const { object, submit, isLoading, stop } = useObject({
    api: '/api/use-object',
    schema: notificationSchema,
  });

  return (
    <div>
      <button
        onClick={() => submit('Messages during finals week.')}
        disabled={isLoading}
      >
        Generate notifications
      </button>

      {isLoading && (
        <div>
          <div>Loading...</div>
          <button type="button" onClick={() => stop()}>
            Stop
          </button>
        </div>
      )}

      {object?.notifications?.map((notification, index) => (
        <div key={index}>
          <p>{notification?.name}</p>
          <p>{notification?.message}</p>
        </div>
      ))}
    </div>
  );
}
```

## Array Mode

The "array" output mode allows you to stream an array of objects one element at a time. This is particularly useful when generating lists of items.

### Schema

First, update the schema to generate a single object (remove the `z.array()`).

```ts filename='app/api/use-object/schema.ts'
import { z } from 'zod';

// define a schema for a single notification
export const notificationSchema = z.object({
  name: z.string().describe('Name of a fictional person.'),
  message: z.string().describe('Message. Do not use emojis or links.'),
});
```

### Client

On the client, you wrap the schema in `z.array()` to generate an array of objects.

```tsx filename='app/page.tsx'
'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { notificationSchema } from './api/use-object/schema';

export default function Page() {
  const { object, submit, isLoading, stop } = useObject({
    api: '/api/use-object',
    schema: z.array(notificationSchema),
  });

  return (
    <div>
      <button
        onClick={() => submit('Messages during finals week.')}
        disabled={isLoading}
      >
        Generate notifications
      </button>

      {isLoading && (
        <div>
          <div>Loading...</div>
          <button type="button" onClick={() => stop()}>
            Stop
          </button>
        </div>
      )}

      {object?.map((notification, index) => (
        <div key={index}>
          <p>{notification.name}</p>
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  );
}
```

### Server

On the server, specify `output: 'array'` to generate an array of objects.

```typescript filename='app/api/use-object/route.ts'
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { notificationSchema } from './schema';

export const maxDuration = 30;

export async function POST(req: Request) {
  const context = await req.json();

  const result = streamObject({
    model: openai('gpt-4-turbo'),
    output: 'array',
    schema: notificationSchema,
    prompt:
      `Generate 3 notifications for a messages app in this context:` + context,
  });

  return result.toTextStreamResponse();
}
```

## No Schema Mode

The "no-schema" output mode can be used when you don't want to specify a schema, for example when the data structure is defined by a dynamic user request. When using this mode, omit the schema parameter and set `output: 'no-schema'`. The model will still attempt to generate JSON data based on the prompt.

### Client

On the client, you wrap the schema in `z.array()` to generate an array of objects.

```tsx filename='app/page.tsx'
'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';

export default function Page() {
  const { object, submit, isLoading, stop } = useObject({
    api: '/api/use-object',
    schema: z.unknown(),
  });

  return (
    <div>
      <button
        onClick={() => submit('Messages during finals week.')}
        disabled={isLoading}
      >
        Generate notifications
      </button>

      {isLoading && (
        <div>
          <div>Loading...</div>
          <button type="button" onClick={() => stop()}>
            Stop
          </button>
        </div>
      )}

      {object?.map((notification, index) => (
        <div key={index}>
          <p>{notification.name}</p>
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  );
}
```

### Server

On the server, specify `output: 'no-schema'`.

```typescript filename='app/api/use-object/route.ts'
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { notificationSchema } from './schema';

export const maxDuration = 30;

export async function POST(req: Request) {
  const context = await req.json();

  const result = streamObject({
    model: openai('gpt-4-turbo'),
    output: 'no-schema',
    prompt:
      `Generate 3 notifications for a messages app in this context:` + context,
  });

  return result.toTextStreamResponse();
}
```


================================================
File: content/cookbook/01-next/70-call-tools.mdx
================================================
---
title: Call Tools
description: Learn how to call tools using the AI SDK and Next.js
tags: ['next', 'tool use']
---

# Call Tools

Some models allow developers to provide a list of tools that can be called at any time during a generation. This is useful for extending the capabilites of a language model to either use logic or data to interact with systems external to the model.

<Browser>
  <ChatGeneration
    history={[
      { role: 'User', content: 'How is it going?' },
      { role: 'Assistant', content: 'All good, how may I help you?' },
    ]}
    inputMessage={{
      role: 'User',
      content: 'What is the weather in Paris and New York?',
    }}
    outputMessage={{
      role: 'Assistant',
      content:
        'The weather is 24°C in New York and 25°C in Paris. It is sunny in both cities.',
    }}
  />
</Browser>

## Client

Let's create a React component that imports the `useChat` hook from the `@ai-sdk/react` module. The `useChat` hook will call the `/api/chat` endpoint when the user sends a message. The endpoint will generate the assistant's response based on the conversation history and stream it to the client. If the assistant responds with a tool call, the hook will automatically display them as well.

We will use the `maxSteps` to specify the maximum number of steps (i.e., LLM calls) that can be made to prevent infinite loops. In this example, you will set it to `2` to allow for two backend calls to happen.

```tsx filename='app/page.tsx'
'use client';

import { useChat } from '@ai-sdk/react';

export default function Page() {
  const { messages, input, setInput, append } = useChat({
    api: '/api/chat',
    maxSteps: 2,
  });

  return (
    <div>
      <input
        value={input}
        onChange={event => {
          setInput(event.target.value);
        }}
        onKeyDown={async event => {
          if (event.key === 'Enter') {
            append({ content: input, role: 'user' });
          }
        }}
      />

      {messages.map((message, index) => (
        <div key={index}>{message.content}</div>
      ))}
    </div>
  );
}
```

## Server

You will create a new route at `/api/chat` that will use the `streamText` function from the `ai` module to generate the assistant's response based on the conversation history.

You will use the [`tools`](/docs/reference/ai-sdk-core/generate-text#tools) parameter to specify a tool called `celsiusToFahrenheit` that will convert a user given value in celsius to fahrenheit.

You will also use zod to specify the schema for the `celsiusToFahrenheit` function's parameters.

```tsx filename='app/api/chat/route.ts'
import { ToolInvocation, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant.',
    messages,
    tools: {
      getWeather: {
        description: 'Get the weather for a location',
        parameters: z.object({
          city: z.string().describe('The city to get the weather for'),
          unit: z
            .enum(['C', 'F'])
            .describe('The unit to display the temperature in'),
        }),
        execute: async ({ city, unit }) => {
          const weather = {
            value: 24,
            description: 'Sunny',
          };

          return `It is currently ${weather.value}°${unit} and ${weather.description} in ${city}!`;
        },
      },
    },
  });

  return result.toDataStreamResponse();
}
```

---

<GithubLink link="https://github.com/vercel/ai/blob/main/examples/next-openai-pages/pages/tools/call-tool/index.tsx" />


================================================
File: content/cookbook/01-next/71-call-tools-in-parallel.mdx
================================================
---
title: Call Tools in Parallel
description: Learn how to call tools in parallel using the AI SDK and Next.js
tags: ['next', 'streaming', 'tool use']
---

# Call Tools in Parallel

Some language models support calling tools in parallel. This is particularly useful when multiple tools are independent of each other and can be executed in parallel during the same generation step.

<Browser>
  <ChatGeneration
    history={[
      { role: 'User', content: 'How is it going?' },
      { role: 'Assistant', content: 'All good, how may I help you?' },
    ]}
    inputMessage={{
      role: 'User',
      content: 'What is the weather in Paris and New York?',
    }}
    outputMessage={{
      role: 'Assistant',
      content:
        'The weather is 24°C in New York and 25°C in Paris. It is sunny in both cities.',
    }}
  />
</Browser>

## Client

Let's create a React component that imports the `useChat` hook from the `@ai-sdk/react` module. The `useChat` hook will call the `/api/chat` endpoint when the user sends a message. The endpoint will generate the assistant's response based on the conversation history and stream it to the client. If the assistant responds with a tool call, the hook will automatically display them as well.

You will use the `maxSteps` to specify the maximum number of steps that can made before the model or the user responds with a text message. In this example, you will set it to `2` to allow for another call with the tool result to happen.

```tsx filename='app/page.tsx'
'use client';

import { useChat } from '@ai-sdk/react';

export default function Page() {
  const { messages, input, setInput, append } = useChat({
    api: '/api/chat',
    maxSteps: 2,
  });

  return (
    <div>
      <input
        value={input}
        onChange={event => {
          setInput(event.target.value);
        }}
        onKeyDown={async event => {
          if (event.key === 'Enter') {
            append({ content: input, role: 'user' });
          }
        }}
      />

      {messages.map((message, index) => (
        <div key={index}>{message.content}</div>
      ))}
    </div>
  );
}
```

## Server

You will create a new route at `/api/chat` that will use the `streamText` function from the `ai` module to generate the assistant's response based on the conversation history.

You will use the [`tools`](/docs/reference/ai-sdk-core/generate-text#tools) parameter to specify a tool called `getWeather` that will get the weather for a location.

You will add the `getWeather` function and use zod to specify the schema for its parameters.

```ts filename='app/api/chat/route.ts'
import { ToolInvocation, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

function getWeather({ city, unit }) {
  return { value: 25, description: 'Sunny' };
}

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant.',
    messages,
    tools: {
      getWeather: {
        description: 'Get the weather for a location',
        parameters: z.object({
          city: z.string().describe('The city to get the weather for'),
          unit: z
            .enum(['C', 'F'])
            .describe('The unit to display the temperature in'),
        }),
        execute: async ({ city, unit }) => {
          const { value, description } = getWeather({ city, unit });
          return `It is currently ${value}°${unit} and ${description} in ${city}!`;
        },
      },
    },
  });

  return result.toDataStreamResponse();
}
```

---

<GithubLink link="https://github.com/vercel/ai/blob/main/examples/next-openai-pages/pages/tools/call-tools-in-parallel/index.tsx" />


================================================
File: content/cookbook/01-next/72-call-tools-multiple-steps.mdx
================================================
---
title: Call Tools in Multiple Steps
description: Learn how to call tools in multiple steps using the AI SDK and Next.js
tags: ['next', 'streaming', 'tool use']
---

# Call Tools in Multiple Steps

Some language models are great at calling tools in multiple steps to achieve a more complex task. This is particularly useful when the tools are dependent on each other and need to be executed in sequence during the same generation step.

## Client

Let's create a React component that imports the `useChat` hook from the `@ai-sdk/react` module. The `useChat` hook will call the `/api/chat` endpoint when the user sends a message. The endpoint will generate the assistant's response based on the conversation history and stream it to the client. If the assistant responds with a tool call, the hook will automatically display them as well.

To call tools in multiple steps, you can use the `maxSteps` option to specify the maximum number of steps that can be made before the model or the user responds with a text message. In this example, you will set it to `5` to allow for multiple tool calls.

```tsx filename='app/page.tsx'
'use client';

import { useChat } from '@ai-sdk/react';

export default function Page() {
  const { messages, input, setInput, append } = useChat({
    api: '/api/chat',
    maxSteps: 5,
  });

  return (
    <div>
      <input
        value={input}
        onChange={event => {
          setInput(event.target.value);
        }}
        onKeyDown={async event => {
          if (event.key === 'Enter') {
            append({ content: input, role: 'user' });
          }
        }}
      />

      {messages.map((message, index) => (
        <div key={index}>{message.content}</div>
      ))}
    </div>
  );
}
```

## Server

You will create a new route at `/api/chat` that will use the `streamText` function from the `ai` module to generate the assistant's response based on the conversation history.

You will use the [`tools`](/docs/reference/ai-sdk-core/generate-text#tools) parameter to specify two tools called `getLocation` and `getWeather` that will first get the user's location and then use it to get the weather.

You will add the two functions mentioned earlier and use zod to specify the schema for its parameters.

```ts filename='app/api/chat/route.ts'
import { ToolInvocation, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

function getLocation({ lat, lon }) {
  return { lat: 37.7749, lon: -122.4194 };
}

function getWeather({ lat, lon, unit }) {
  return { value: 25, description: 'Sunny' };
}

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant.',
    messages,
    tools: {
      getLocation: {
        description: 'Get the location of the user',
        parameters: z.object({}),
        execute: async () => {
          const { lat, lon } = getLocation();
          return `Your location is at latitude ${lat} and longitude ${lon}`;
        },
      },
      getWeather: {
        description: 'Get the weather for a location',
        parameters: z.object({
          lat: z.number().describe('The latitude of the location'),
          lon: z.number().describe('The longitude of the location'),
          unit: z
            .enum(['C', 'F'])
            .describe('The unit to display the temperature in'),
        }),
        execute: async ({ lat, lon, unit }) => {
          const { value, description } = getWeather({ lat, lon, unit });
          return `It is currently ${value}°${unit} and ${description}!`;
        },
      },
    },
  });

  return result.toDataStreamResponse();
}
```


================================================
File: content/cookbook/01-next/75-human-in-the-loop.mdx
================================================
---
title: Human-in-the-Loop with Next.js
description: Add a human approval step to your agentic system with Next.js and the AI SDK
tags: ['next', 'agents', 'tool use']
---

# Human-in-the-Loop with Next.js

When building agentic systems, it's important to add human-in-the-loop (HITL) functionality to ensure that users can approve actions before the system executes them. This recipe will describe how to [build a low-level solution](#adding-a-confirmation-step) and then provide an [example abstraction](#building-your-own-abstraction) you could implement and customise based on your needs.

## Background

To understand how to implement this functionality, let's look at how tool calling works in a simple Next.js chatbot application with the AI SDK.

On the frontend, use the `useChat` hook to manage the message state and user interaction (including input and form submission handlers).

```tsx filename="app/page.tsx"
'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div>
      <div>
        {messages?.map(m => (
          <div key={m.id}>
            <strong>{`${m.role}: `}</strong>
            {m.parts?.map((part, i) => {
              switch (part.type) {
                case 'text':
                  return <div key={i}>{part.text}</div>;
              }
            })}
            <br />
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
```

On the backend, create a route handler (API Route) that returns a `DataStreamResponse`. Within the execute function, call `streamText` and pass in the `messages` (sent from the client). Finally, merge the resulting generation into the data stream.

```ts filename="api/chat/route.ts"
import { openai } from '@ai-sdk/openai';
import { createDataStreamResponse, streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createDataStreamResponse({
    execute: async dataStream => {
      const result = streamText({
        model: openai('gpt-4o'),
        messages,
        tools: {
          getWeatherInformation: tool({
            description: 'show the weather in a given city to the user',
            parameters: z.object({ city: z.string() }),
            execute: async ({}: { city: string }) => {
              const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy'];
              return weatherOptions[
                Math.floor(Math.random() * weatherOptions.length)
              ];
            },
          }),
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}
```

What happens if you ask the LLM for the weather in New York?

The LLM has one tool available, `weather`, which requires a `location` to run. This tool will, as stated in the tool's `description`, "show the weather in a given city to the user". If the LLM decides that the `weather` tool could answer the user's query, it would generate a `ToolCall`, extracting the `location` from the context. The AI SDK would then run the associated `execute` function, passing in the `location` parameter, and finally returning a `ToolResult`.

To introduce a HITL step you will add a confirmation step to this process in between the `ToolCall` and the `ToolResult`.

## Adding a Confirmation Step

At a high level, you will:

1. Intercept tool calls before they are executed
2. Render a confirmation UI with Yes/No buttons
3. Send a temporary tool result indicating whether the user confirmed or declined
4. On the server, check for the confirmation state in the tool result:
   - If confirmed, execute the tool and update the result
   - If declined, update the result with an error message
5. Send the updated tool result back to the client to maintain state consistency

### Forward Tool Call To The Client

To implement HITL functionality, you start by omitting the `execute` function from the tool definition. This allows the frontend to intercept the tool call and handle the responsibility of adding the final tool result to the tool call.

```ts filename="api/chat/route.ts" highlight="17"
import { openai } from '@ai-sdk/openai';
import { createDataStreamResponse, streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createDataStreamResponse({
    execute: async dataStream => {
      const result = streamText({
        model: openai('gpt-4o'),
        messages,
        tools: {
          getWeatherInformation: tool({
            description: 'show the weather in a given city to the user',
            parameters: z.object({ city: z.string() }),
            // execute function removed to stop automatic execution
          }),
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}
```

<Note type="warning">
  Each tool call must have a corresponding tool result. If you do not add a tool
  result, all subsequent generations will fail.
</Note>

### Intercept Tool Call

On the frontend, you map through the messages, either rendering the message content or checking for tool invocations and rendering custom UI.

You can check if the tool requiring confirmation has been called and, if so, present options to either confirm or deny the proposed tool call. This confirmation is done using the `addToolResult` function to create a tool result and append it to the associated tool call.

```tsx filename="app/page.tsx"
'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, addToolResult } =
    useChat();

  return (
    <div>
      <div>
        {messages?.map(m => (
          <div key={m.id}>
            <strong>{`${m.role}: `}</strong>
            {m.parts?.map((part, i) => {
              switch (part.type) {
                case 'text':
                  return <div key={i}>{part.text}</div>;
                case 'tool-invocation':
                  const toolInvocation = part.toolInvocation;
                  const toolCallId = toolInvocation.toolCallId;

                  // render confirmation tool (client-side tool with user interaction)
                  if (
                    toolInvocation.toolName === 'getWeatherInformation' &&
                    toolInvocation.state === 'call'
                  ) {
                    return (
                      <div key={toolCallId}>
                        Get weather information for {toolInvocation.args.city}?
                        <div>
                          <button
                            onClick={() =>
                              addToolResult({
                                toolCallId,
                                result: 'Yes, confirmed.',
                              })
                            }
                          >
                            Yes
                          </button>
                          <button
                            onClick={() =>
                              addToolResult({
                                toolCallId,
                                result: 'No, denied.',
                              })
                            }
                          >
                            No
                          </button>
                        </div>
                      </div>
                    );
                  }
              }
            })}
            <br />
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
```

<Note>
  The `addToolResult` function will trigger a call to your route handler.
</Note>

### Handle Confirmation Response

Adding a tool result will trigger another call to your route handler. Before sending the new messages to the language model, you pull out the last message and map through the message parts to see if the tool requiring confirmation was called and whether it's in a "result" state. If those conditions are met, you check the confirmation state (the tool result state that you set on the frontend with the `addToolResult` function).

```ts filename="api/chat/route.ts"
import { openai } from '@ai-sdk/openai';
import {
  createDataStreamResponse,
  formatDataStreamPart,
  Message,
  streamText,
  tool,
} from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  return createDataStreamResponse({
    execute: async dataStream => {
      // pull out last message
      const lastMessage = messages[messages.length - 1];

      lastMessage.parts = await Promise.all(
        // map through all message parts
        lastMessage.parts?.map(async part => {
          if (part.type !== 'tool-invocation') {
            return part;
          }
          const toolInvocation = part.toolInvocation;
          // return if tool isn't weather tool or in a result state
          if (
            toolInvocation.toolName !== 'getWeatherInformation' ||
            toolInvocation.state !== 'result'
          ) {
            return part;
          }

          // switch through tool result states (set on the frontend)
          switch (toolInvocation.result) {
            case 'Yes, confirmed.': {
              const result = await executeWeatherTool(toolInvocation.args);

              // forward updated tool result to the client:
              dataStream.write(
                formatDataStreamPart('tool_result', {
                  toolCallId: toolInvocation.toolCallId,
                  result,
                }),
              );

              // update the message part:
              return { ...part, toolInvocation: { ...toolInvocation, result } };
            }
            case 'No, denied.': {
              const result = 'Error: User denied access to weather information';

              // forward updated tool result to the client:
              dataStream.write(
                formatDataStreamPart('tool_result', {
                  toolCallId: toolInvocation.toolCallId,
                  result,
                }),
              );

              // update the message part:
              return { ...part, toolInvocation: { ...toolInvocation, result } };
            }
            default:
              return part;
          }
        }) ?? [],
      );

      const result = streamText({
        model: openai('gpt-4o'),
        messages,
        tools: {
          getWeatherInformation: tool({
            description: 'show the weather in a given city to the user',
            parameters: z.object({ city: z.string() }),
          }),
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}

async function executeWeatherTool({}: { city: string }) {
  const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy'];
  return weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
}
```

In this implementation, you use simple strings like "Yes, the user confirmed" or "No, the user declined" as states. If confirmed, you execute the tool. If declined, you do not execute the tool. In both cases, you update the tool result from the arbitrary data you sent with the `addToolResult` function to either the result of the execute function or an "Execution declined" statement. You send the updated tool result back to the frontend to maintain state synchronization.

After handling the tool result, your API route continues. This triggers another generation with the updated tool result, allowing the LLM to continue attempting to solve the query.

## Building your own abstraction

The solution above is low-level and not very friendly to use in a production environment. You can build your own abstraction using these concepts

### Create Utility Functions

```ts filename="utils.ts"
import { formatDataStreamPart, Message } from '@ai-sdk/ui-utils';
import {
  convertToCoreMessages,
  DataStreamWriter,
  ToolExecutionOptions,
  ToolSet,
} from 'ai';
import { z } from 'zod';

// Approval string to be shared across frontend and backend
export const APPROVAL = {
  YES: 'Yes, confirmed.',
  NO: 'No, denied.',
} as const;

function isValidToolName<K extends PropertyKey, T extends object>(
  key: K,
  obj: T,
): key is K & keyof T {
  return key in obj;
}

/**
 * Processes tool invocations where human input is required, executing tools when authorized.
 *
 * @param options - The function options
 * @param options.tools - Map of tool names to Tool instances that may expose execute functions
 * @param options.dataStream - Data stream for sending results back to the client
 * @param options.messages - Array of messages to process
 * @param executionFunctions - Map of tool names to execute functions
 * @returns Promise resolving to the processed messages
 */
export async function processToolCalls<
  Tools extends ToolSet,
  ExecutableTools extends {
    [Tool in keyof Tools as Tools[Tool] extends { execute: Function }
      ? never
      : Tool]: Tools[Tool];
  },
>(
  {
    dataStream,
    messages,
  }: {
    tools: Tools; // used for type inference
    dataStream: DataStreamWriter;
    messages: Message[];
  },
  executeFunctions: {
    [K in keyof Tools & keyof ExecutableTools]?: (
      args: z.infer<ExecutableTools[K]['parameters']>,
      context: ToolExecutionOptions,
    ) => Promise<any>;
  },
): Promise<Message[]> {
  const lastMessage = messages[messages.length - 1];
  const parts = lastMessage.parts;
  if (!parts) return messages;

  const processedParts = await Promise.all(
    parts.map(async part => {
      // Only process tool invocations parts
      if (part.type !== 'tool-invocation') return part;

      const { toolInvocation } = part;
      const toolName = toolInvocation.toolName;

      // Only continue if we have an execute function for the tool (meaning it requires confirmation) and it's in a 'result' state
      if (!(toolName in executeFunctions) || toolInvocation.state !== 'result')
        return part;

      let result;

      if (toolInvocation.result === APPROVAL.YES) {
        // Get the tool and check if the tool has an execute function.
        if (
          !isValidToolName(toolName, executeFunctions) ||
          toolInvocation.state !== 'result'
        ) {
          return part;
        }

        const toolInstance = executeFunctions[toolName];
        if (toolInstance) {
          result = await toolInstance(toolInvocation.args, {
            messages: convertToCoreMessages(messages),
            toolCallId: toolInvocation.toolCallId,
          });
        } else {
          result = 'Error: No execute function found on tool';
        }
      } else if (toolInvocation.result === APPROVAL.NO) {
        result = 'Error: User denied access to tool execution';
      } else {
        // For any unhandled responses, return the original part.
        return part;
      }

      // Forward updated tool result to the client.
      dataStream.write(
        formatDataStreamPart('tool_result', {
          toolCallId: toolInvocation.toolCallId,
          result,
        }),
      );

      // Return updated toolInvocation with the actual result.
      return {
        ...part,
        toolInvocation: {
          ...toolInvocation,
          result,
        },
      };
    }),
  );

  // Finally return the processed messages
  return [...messages.slice(0, -1), { ...lastMessage, parts: processedParts }];
}

export function getToolsRequiringConfirmation<T extends ToolSet>(
  tools: T,
): string[] {
  return (Object.keys(tools) as (keyof T)[]).filter(key => {
    const maybeTool = tools[key];
    return typeof maybeTool.execute !== 'function';
  }) as string[];
}
```

In this file, you first declare the confirmation strings as constants so we can share them across the frontend and backend (reducing possible errors). Next, we create function called `processToolCalls` which takes in the `messages`, `tools`, and the `datastream`. It also takes in a second parameter, `executeFunction`, which is an object that maps `toolName` to the functions that will be run upon human confirmation. This function is strongly typed so:

- it autocompletes `executableTools` - these are tools without an execute function
- provides full type-safety for arguments and options available within the `execute` function

Unlike the low-level example, this will return a modified array of `messages` that can be passed directly to the LLM.

Finally, you declare a function called `getToolsRequiringConfirmation` that takes your tools as an argument and then will return the names of your tools without execute functions (in an array of strings). This avoids the need to manually write out and check for `toolName`'s on the frontend.

In order to use these utility functions, you will need to move tool declarations to their own file:

```ts filename="tools.ts"
import { tool } from 'ai';
import { z } from 'zod';

const getWeatherInformation = tool({
  description: 'show the weather in a given city to the user',
  parameters: z.object({ city: z.string() }),
  // no execute function, we want human in the loop
});

const getLocalTime = tool({
  description: 'get the local time for a specified location',
  parameters: z.object({ location: z.string() }),
  // including execute function -> no confirmation required
  execute: async ({ location }) => {
    console.log(`Getting local time for ${location}`);
    return '10am';
  },
});

export const tools = {
  getWeatherInformation,
  getLocalTime,
};
```

In this file, you have two tools, `getWeatherInformation` (requires confirmation to run) and `getLocalTime`.

### Update Route Handler

Update your route handler to use the `processToolCalls` utility function.

```ts filename="app/api/chat/route.ts"
import { openai } from '@ai-sdk/openai';
import { createDataStreamResponse, Message, streamText } from 'ai';
import { processToolCalls } from './utils';
import { tools } from './tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  return createDataStreamResponse({
    execute: async dataStream => {
      // Utility function to handle tools that require human confirmation
      // Checks for confirmation in last message and then runs associated tool
      const processedMessages = await processToolCalls(
        {
          messages,
          dataStream,
          tools,
        },
        {
          // type-safe object for tools without an execute function
          getWeatherInformation: async ({ city }) => {
            const conditions = ['sunny', 'cloudy', 'rainy', 'snowy'];
            return `The weather in ${city} is ${
              conditions[Math.floor(Math.random() * conditions.length)]
            }.`;
          },
        },
      );

      const result = streamText({
        model: openai('gpt-4o'),
        messages: processedMessages,
        tools,
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}
```

### Update Frontend

Finally, update the frontend to use the new `getToolsRequiringConfirmation` function and the `APPROVAL` values:

```tsx filename="app/page.tsx"
'use client';

import { Message, useChat } from '@ai-sdk/react';
import {
  APPROVAL,
  getToolsRequiringConfirmation,
} from '../api/use-chat-human-in-the-loop/utils';
import { tools } from '../api/use-chat-human-in-the-loop/tools';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, addToolResult } =
    useChat({
      maxSteps: 5,
    });

  const toolsRequiringConfirmation = getToolsRequiringConfirmation(tools);

  // used to disable input while confirmation is pending
  const pendingToolCallConfirmation = messages.some((m: Message) =>
    m.parts?.some(
      part =>
        part.type === 'tool-invocation' &&
        part.toolInvocation.state === 'call' &&
        toolsRequiringConfirmation.includes(part.toolInvocation.toolName),
    ),
  );

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages?.map((m: Message) => (
        <div key={m.id} className="whitespace-pre-wrap">
          <strong>{`${m.role}: `}</strong>
          {m.parts?.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <div key={i}>{part.text}</div>;
              case 'tool-invocation':
                const toolInvocation = part.toolInvocation;
                const toolCallId = toolInvocation.toolCallId;
                const dynamicInfoStyles = 'font-mono bg-gray-100 p-1 text-sm';

                // render confirmation tool (client-side tool with user interaction)
                if (
                  toolsRequiringConfirmation.includes(
                    toolInvocation.toolName,
                  ) &&
                  toolInvocation.state === 'call'
                ) {
                  return (
                    <div key={toolCallId} className="text-gray-500">
                      Run{' '}
                      <span className={dynamicInfoStyles}>
                        {toolInvocation.toolName}
                      </span>{' '}
                      with args:{' '}
                      <span className={dynamicInfoStyles}>
                        {JSON.stringify(toolInvocation.args)}
                      </span>
                      <div className="flex gap-2 pt-2">
                        <button
                          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                          onClick={() =>
                            addToolResult({
                              toolCallId,
                              result: APPROVAL.YES,
                            })
                          }
                        >
                          Yes
                        </button>
                        <button
                          className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                          onClick={() =>
                            addToolResult({
                              toolCallId,
                              result: APPROVAL.NO,
                            })
                          }
                        >
                          No
                        </button>
                      </div>
                    </div>
                  );
                }
            }
          })}
          <br />
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          disabled={pendingToolCallConfirmation}
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
```

## Full Example

To see this code in action, check out the [`next-openai` example](https://github.com/vercel/ai/tree/main/examples/next-openai) in the AI SDK repository. Navigate to the `/use-chat-human-in-the-loop` page and associated route handler.


================================================
File: content/cookbook/01-next/80-send-custom-body-from-use-chat.mdx
================================================
---
title: Send Custom Body from useChat
description: Learn how to send a custom body from the useChat hook using the AI SDK and Next.js
tags: ['next', 'chat']
---

# Send Custom Body from useChat

<Note type="warning">
  `experimental_prepareRequestBody` is an experimental feature and only
  available in React, Solid and Vue.
</Note>

By default, `useChat` sends all messages as well as information from the request to the server.
However, it is often desirable to control the body content that is sent to the server, e.g. to:

- only send the last message
- send additional data along with the message
- change the structure of the request body

The `experimental_prepareRequestBody` option allows you to customize the body content that is sent to the server.
The function receives the message list, the request data, and the request body from the append call.
It should return the body content that will be sent to the server.

## Example

This example shows how to only send the text of the last message to the server.
This can be useful if you want to reduce the amount of data sent to the server.

### Client

```typescript filename='app/page.tsx' highlight="7-10"
'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    experimental_prepareRequestBody: ({ messages }) => {
      // e.g. only the text of the last message:
      return messages[messages.length - 1].content;
    },
  });

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
```

### Server

We need to adjust the server to only receive the text of the last message.
The rest of the message history can be loaded from storage.

```tsx filename='app/api/chat/route.ts' highlight="8,9,23"
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  // we receive only the text from the last message
  const text = await req.json()

  // e.g. load message history from storage
  const history = await loadHistory()

  // Call the language model
  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages: [...history, { role: 'user', content: text }]
    onFinish({ text }) {
      // e.g. save the message and the response to storage
    }
  })

  // Respond with the stream
  return result.toDataStreamResponse()
}
```


================================================
File: content/cookbook/01-next/90-render-visual-interface-in-chat.mdx
================================================
---
title: Render Visual Interface in Chat
description: Learn how to render visual interfaces in chat using the AI SDK and Next.js
tags: ['next', 'generative user interface']
---

# Render Visual Interface in Chat

An interesting consequence of language models that can call [tools](/docs/ai-sdk-core/tools-and-tool-calling) is that this ability can be used to render visual interfaces by streaming React components to the client.

<Browser>
  <ChatGeneration
    history={[
      { role: 'User', content: 'How is it going?' },
      { role: 'Assistant', content: 'All good, how may I help you?' },
    ]}
    inputMessage={{
      role: 'User',
      content: 'What is the weather in San Francisco?',
    }}
    outputMessage={{
      role: 'Assistant',
      content: 'The weather is 24°C and sunny in San Francisco.',
      display: (
        <div className="py-4">
          <WeatherCard
            content={{
              weather: {
                temperature: 24,
                condition: 'Sunny',
              },
            }}
          />
        </div>
      ),
    }}
  />
</Browser>

## Client

Let's build an assistant that gets the weather for any city by calling the `getWeatherInformation` tool. Instead of returning text during the tool call, you will render a React component that displays the weather information on the client.

```tsx filename='app/page.tsx'
'use client';

import { ToolInvocation } from 'ai';
import { Message, useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, addToolResult } =
    useChat({
      api: '/api/use-chat',
      maxSteps: 5,

      // run client-side tools that are automatically executed:
      async onToolCall({ toolCall }) {
        if (toolCall.toolName === 'getLocation') {
          const cities = [
            'New York',
            'Los Angeles',
            'Chicago',
            'San Francisco',
          ];
          return cities[Math.floor(Math.random() * cities.length)];
        }
      },
    });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch gap-4">
      {messages?.map((m: Message) => (
        <div key={m.id} className="whitespace-pre-wrap flex flex-col gap-1">
          <strong>{`${m.role}: `}</strong>
          {m.content}
          {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
            const toolCallId = toolInvocation.toolCallId;

            // render confirmation tool (client-side tool with user interaction)
            if (toolInvocation.toolName === 'askForConfirmation') {
              return (
                <div
                  key={toolCallId}
                  className="text-gray-500 flex flex-col gap-2"
                >
                  {toolInvocation.args.message}
                  <div className="flex gap-2">
                    {'result' in toolInvocation ? (
                      <b>{toolInvocation.result}</b>
                    ) : (
                      <>
                        <button
                          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                          onClick={() =>
                            addToolResult({
                              toolCallId,
                              result: 'Yes, confirmed.',
                            })
                          }
                        >
                          Yes
                        </button>
                        <button
                          className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                          onClick={() =>
                            addToolResult({
                              toolCallId,
                              result: 'No, denied',
                            })
                          }
                        >
                          No
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            }

            // other tools:
            return 'result' in toolInvocation ? (
              toolInvocation.toolName === 'getWeatherInformation' ? (
                <div
                  key={toolCallId}
                  className="flex flex-col gap-2 p-4 bg-blue-400 rounded-lg"
                >
                  <div className="flex flex-row justify-between items-center">
                    <div className="text-4xl text-blue-50 font-medium">
                      {toolInvocation.result.value}°
                      {toolInvocation.result.unit === 'celsius' ? 'C' : 'F'}
                    </div>

                    <div className="h-9 w-9 bg-amber-400 rounded-full flex-shrink-0" />
                  </div>
                  <div className="flex flex-row gap-2 text-blue-50 justify-between">
                    {toolInvocation.result.weeklyForecast.map(
                      (forecast: any) => (
                        <div
                          key={forecast.day}
                          className="flex flex-col items-center"
                        >
                          <div className="text-xs">{forecast.day}</div>
                          <div>{forecast.value}°</div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ) : toolInvocation.toolName === 'getLocation' ? (
                <div
                  key={toolCallId}
                  className="text-gray-500 bg-gray-100 rounded-lg p-4"
                >
                  User is in {toolInvocation.result}.
                </div>
              ) : (
                <div key={toolCallId} className="text-gray-500">
                  Tool call {`${toolInvocation.toolName}: `}
                  {toolInvocation.result}
                </div>
              )
            ) : (
              <div key={toolCallId} className="text-gray-500">
                Calling {toolInvocation.toolName}...
              </div>
            );
          })}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
```

## Server

```tsx filename='api/chat.ts'
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';

export default async function POST(request: Request) {
  const { messages } = await request.json();

  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: {
      // server-side tool with execute function:
      getWeatherInformation: {
        description: 'show the weather in a given city to the user',
        parameters: z.object({ city: z.string() }),
        execute: async ({}: { city: string }) => {
          return {
            value: 24,
            unit: 'celsius',
            weeklyForecast: [
              { day: 'Monday', value: 24 },
              { day: 'Tuesday', value: 25 },
              { day: 'Wednesday', value: 26 },
              { day: 'Thursday', value: 27 },
              { day: 'Friday', value: 28 },
              { day: 'Saturday', value: 29 },
              { day: 'Sunday', value: 30 },
            ],
          };
        },
      },
      // client-side tool that starts user interaction:
      askForConfirmation: {
        description: 'Ask the user for confirmation.',
        parameters: z.object({
          message: z.string().describe('The message to ask for confirmation.'),
        }),
      },
      // client-side tool that is automatically executed on the client:
      getLocation: {
        description:
          'Get the user location. Always ask for confirmation before using this tool.',
        parameters: z.object({}),
      },
    },
  });

  return result.toDataStreamResponse();
}
```


================================================
File: content/cookbook/01-next/index.mdx
================================================
---
title: Next.js
---


================================================
File: content/cookbook/05-node/10-generate-text.mdx
================================================
---
title: Generate Text
description: Learn how to generate text using the AI SDK and Node
tags: ['node']
---

# Generate Text

The most basic LLM use case is generating text based on a prompt.
For example, you may want to generate a response to a question or summarize a body of text.
The `generateText` function can be used to generate text based on the input prompt.

```ts file='index.ts'
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-3.5-turbo'),
  prompt: 'Why is the sky blue?',
});

console.log(result);
```


================================================
File: content/cookbook/05-node/100-retrieval-augmented-generation.mdx
================================================
---
title: Retrieval Augmented Generation
description: Learn how to use retrieval augmented generation using the AI SDK and Node
tags: ['node']
---

# Retrieval Augmented Generation

Retrieval Augmented Generation (RAG) is a technique that enhances the capabilities of language models by providing them with relevant information from external sources during the generation process.
This approach allows the model to access and incorporate up-to-date or specific knowledge that may not be present in its original training data.

This example uses [the following essay](https://raw.githubusercontent.com/run-llama/llama_index/main/docs/docs/examples/data/paul_graham/paul_graham_essay.txt) as an input (`essay.txt`). This example uses a simple in-memory vector database to store and retrieve relevant information. For a more in-depth guide, check out the [RAG Chatbot Guide](/docs/guides/rag-chatbot) which will show you how to build a RAG chatbot with [Next.js](https://nextjs.org), [Drizzle ORM](https://orm.drizzle.team/) and [Postgres](https://postgresql.org).

```ts
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { openai } from '@ai-sdk/openai';
import { cosineSimilarity, embed, embedMany, generateText } from 'ai';

dotenv.config();

async function main() {
  const db: { embedding: number[]; value: string }[] = [];

  const essay = fs.readFileSync(path.join(__dirname, 'essay.txt'), 'utf8');
  const chunks = essay
    .split('.')
    .map(chunk => chunk.trim())
    .filter(chunk => chunk.length > 0 && chunk !== '\n');

  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: chunks,
  });
  embeddings.forEach((e, i) => {
    db.push({
      embedding: e,
      value: chunks[i],
    });
  });

  const input =
    'What were the two main things the author worked on before college?';

  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: input,
  });
  const context = db
    .map(item => ({
      document: item,
      similarity: cosineSimilarity(embedding, item.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)
    .map(r => r.document.value)
    .join('\n');

  const { text } = await generateText({
    model: openai('gpt-4o'),
    prompt: `Answer the following question based only on the provided context:
             ${context}

             Question: ${input}`,
  });
  console.log(text);
}

main().catch(console.error);
```


================================================
File: content/cookbook/05-node/11-generate-text-with-chat-prompt.mdx
================================================
---
title: Generate Text with Chat Prompt
description: Learn how to generate text with chat prompt using the AI SDK and Node
tags: ['node', 'chat']
---

# Generate Text with Chat Prompt

Previously, we were able to generate text and objects using either a single message prompt, a system prompt, or a combination of both of them. However, there may be times when you want to generate text based on a series of messages.

A chat completion allows you to generate text based on a series of messages. This series of messages can be any series of interactions between any number of systems, but the most popular and relatable use case has been a series of messages that represent a conversation between a user and a model.

```ts file='index.ts'
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-3.5-turbo'),
  maxTokens: 1024,
  system: 'You are a helpful chatbot.',
  messages: [
    {
      role: 'user',
      content: 'Hello!',
    },
    {
      role: 'assistant',
      content: 'Hello! How can I help you today?',
    },
    {
      role: 'user',
      content: 'I need help with my computer.',
    },
  ],
});

console.log(result.text);
```


================================================
File: content/cookbook/05-node/12-generate-text-with-image-prompt.mdx
================================================
---
title: Generate Text with Image Prompt
description: Learn how to generate text with image prompt using the AI SDK and Node
tags: ['node', 'multimodal']
---

# Generate Text with Image Prompt

Some language models that support vision capabilities accept images as part of the prompt. Here are some of the different [formats](/docs/reference/ai-sdk-core/generate-text#content-image) you can use to include images as input.

## URL

```ts file='index.ts'
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4-turbo'),
  maxTokens: 512,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'what are the red things in this image?',
        },
        {
          type: 'image',
          image: new URL(
            'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2024_Solar_Eclipse_Prominences.jpg/720px-2024_Solar_Eclipse_Prominences.jpg',
          ),
        },
      ],
    },
  ],
});

console.log(result);
```

## File Buffer

```ts file='index.ts'
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import fs from 'fs';

const result = await generateText({
  model: openai('gpt-4-turbo'),
  maxTokens: 512,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'what are the red things in this image?',
        },
        {
          type: 'image',
          image: fs.readFileSync('./node/attachments/eclipse.jpg'),
        },
      ],
    },
  ],
});

console.log(result);
```


================================================
File: content/cookbook/05-node/20-stream-text.mdx
================================================
---
title: Stream Text
description: Learn how to stream text using the AI SDK and Node
tags: ['node', 'streaming']
---

# Stream Text

Text generation can sometimes take a long time to complete, especially when you're generating a couple of paragraphs.
In such cases, it is useful to stream the text to the client in real-time.
This allows the client to display the generated text as it is being generated,
rather than have users wait for it to complete before displaying the result.

```txt
Introducing "Joyful Hearts Day" - a holiday dedicated to spreading love, joy, and kindness to others.

On Joyful Hearts Day, people exchange handmade cards, gifts, and acts of kindness to show appreciation and love for their friends, family, and community members. It is a day to focus on positivity and gratitude, spreading happiness and warmth to those around us.

Traditions include decorating homes and public spaces with hearts and bright colors, hosting community events such as charity drives, volunteer projects, and festive gatherings. People also participate in random acts of kindness, such as paying for someone's coffee, leaving encouraging notes for strangers, or simply offering a helping hand to those in need.

One of the main traditions of Joyful Hearts Day is the "Heart Exchange" where people write heartfelt messages to loved ones and exchange them in person or through mail. These messages can be words of encouragement, expressions of gratitude, or simply a reminder of how much they are loved.

Overall, Joyful Hearts Day is a day to celebrate love, kindness, and positivity, and to spread joy and happiness to all those around us. It is a reminder to appreciate the people in our lives and to make the world a brighter and more loving place.
```

## Without reader

```ts file='index.ts'
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = streamText({
  model: openai('gpt-3.5-turbo'),
  maxTokens: 512,
  temperature: 0.3,
  maxRetries: 5,
  prompt: 'Invent a new holiday and describe its traditions.',
});

for await (const textPart of result.textStream) {
  console.log(textPart);
}
```

## With reader

```ts file='index.ts'
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = streamText({
  model: openai('gpt-3.5-turbo'),
  maxTokens: 512,
  temperature: 0.3,
  maxRetries: 5,
  prompt: 'Invent a new holiday and describe its traditions.',
});

const reader = result.textStream.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) {
    break;
  }
  console.log(value);
}
```


================================================
File: content/cookbook/05-node/21-stream-text-with-chat-prompt.mdx
================================================
---
title: Stream Text with Chat Prompt
description: Learn how to stream text with chat prompt using the AI SDK and Node
tags: ['node', 'streaming', 'chat']
---

# Stream Text with Chat Prompt

Text generation can sometimes take a long time to finish, especially when the response is big.
In such cases, it is useful to stream the chat completion to the client in real-time.
This allows the client to display the new message as it is being generated by the model,
rather than have users wait for it to finish.

```ts file='index.ts'
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = streamText({
  model: openai('gpt-3.5-turbo'),
  maxTokens: 1024,
  system: 'You are a helpful chatbot.',
  messages: [
    {
      role: 'user',
      content: 'Hello!',
    },
    {
      role: 'assistant',
      content: 'Hello! How can I help you today?',
    },
    {
      role: 'user',
      content: 'I need help with my computer.',
    },
  ],
});

for await (const textPart of result.textStream) {
  console.log(textPart);
}
```


================================================
File: content/cookbook/05-node/22-stream-text-with-image-prompt.mdx
================================================
---
title: Stream Text with Image Prompt
description: Learn how to stream text with image prompt using the AI SDK and Node
tags: ['node', 'streaming', 'multimodal']
---

# Stream Text with Image Prompt

Vision-language models can analyze images alongside text prompts to generate responses about visual content. This multimodal approach allows for rich interactions where you can ask questions about images, request descriptions, or analyze visual details. The combination of image and text inputs enables more sophisticated AI applications like visual question answering and image analysis.

```ts
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import 'dotenv/config';
import fs from 'node:fs';

async function main() {
  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20240620'),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Describe the image in detail.' },
          { type: 'image', image: fs.readFileSync('./data/comic-cat.png') },
        ],
      },
    ],
  });

  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
```


================================================
File: content/cookbook/05-node/23-stream-text-with-file-prompt.mdx
================================================
---
title: Stream Text with File Prompt
description: Learn how to stream text with file prompt using the AI SDK and Node
tags: ['node', 'streaming', 'multimodal']
---

# Stream Text with File Prompt

Working with files in AI applications often requires analyzing documents, processing structured data, or extracting information from various file formats. File prompts allow you to send file content directly to the model, enabling tasks like document analysis, data extraction, or generating responses based on file contents.

```ts
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import 'dotenv/config';
import fs from 'node:fs';

async function main() {
  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'What is an embedding model according to this document?',
          },
          {
            type: 'file',
            data: fs.readFileSync('./data/ai.pdf'),
            mimeType: 'application/pdf',
          },
        ],
      },
    ],
  });

  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
```


================================================
File: content/cookbook/05-node/30-generate-object-reasoning.mdx
================================================
---
title: Generate Object with a Reasoning Model
description: Learn how to generate structured data with a reasoning model using the AI SDK and Node
tags: ['node', 'structured data', 'reasoning']
---

# Generate Object with a Reasoning Model

Reasoning models, like [DeepSeek's](/providers/ai-sdk-providers/deepseek) R1, are gaining popularity due to their ability to understand and generate better responses to complex queries than non-reasoning models.
You may want to use these models to generate structured data. However, most (like R1 and [OpenAI's](/providers/ai-sdk-providers/openai) o1) do not support tool-calling or structured outputs.

One solution is to pass the output from a reasoning model through a smaller model that can output structured data (like gpt-4o-mini). These lightweight models can efficiently extract the structured data while adding very little overhead in terms of speed and cost.

```ts
import { deepseek } from '@ai-sdk/deepseek';
import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import 'dotenv/config';
import { z } from 'zod';

async function main() {
  const { text: rawOutput } = await generateText({
    model: deepseek('deepseek-reasoner'),
    prompt:
      'Predict the top 3 largest city by 2050. For each, return the name, the country, the reason why it will on the list, and the estimated population in millions.',
  });

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    prompt: 'Extract the desired information from this text: \n' + rawOutput,
    schema: z.object({
      name: z.string().describe('the name of the city'),
      country: z.string().describe('the name of the country'),
      reason: z
        .string()
        .describe(
          'the reason why the city will be one of the largest cities by 2050',
        ),
      estimatedPopulation: z.number(),
    }),
    output: 'array',
  });

  console.log(object);
}

main().catch(console.error);
```


================================================
File: content/cookbook/05-node/30-generate-object.mdx
================================================
---
title: Generate Object
description: Learn how to generate structured data using the AI SDK and Node
tags: ['node', 'structured data']
---

# Generate Object

Earlier functions like `generateText` and `streamText` gave us the ability to generate unstructured text. However, if you want to generate structured data like JSON, you can provide a schema that describes the structure of your desired object to the `generateObject` function.

The function requires you to provide a schema using [zod](https://zod.dev), a library for defining schemas for JavaScript objects. By using zod, you can also use it to validate the generated object and ensure that it conforms to the specified structure.

```ts file='index.ts'
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = await generateObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.string(),
        }),
      ),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});

console.log(JSON.stringify(result.object.recipe, null, 2));
```


================================================
File: content/cookbook/05-node/40-stream-object.mdx
================================================
---
title: Stream Object
description: Learn how to stream structured data using the AI SDK and Node
tags: ['node', 'streaming', 'structured data']
---

# Stream Object

Object generation can sometimes take a long time to complete,
especially when you're generating a large schema.

In Generative UI use cases, it is useful to stream the object to the client in real-time
to render UIs as the object is being generated.
You can use the [`streamObject`](/docs/reference/ai-sdk-core/stream-object) function to generate partial object streams.

```ts file='index.ts'
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const { partialObjectStream } = streamObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});

for await (const partialObject of partialObjectStream) {
  console.clear();
  console.log(partialObject);
}
```


================================================
File: content/cookbook/05-node/41-stream-object-with-image-prompt.mdx
================================================
---
title: Stream Object with Image Prompt
description: Learn how to stream structured data with an image prompt using the AI SDK and Node
tags: ['node', 'streaming', 'structured data', 'multimodal']
---

# Stream Object with Image Prompt

Some language models that support vision capabilities accept images as part of the prompt. Here are some of the different [formats](/docs/reference/ai-sdk-core/generate-text#content-image) you can use to include images as input.

## URL

```ts file='index.ts'
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

async function main() {
  const { partialObjectStream } = streamObject({
    model: openai('gpt-4-turbo'),
    maxTokens: 512,
    schema: z.object({
      stamps: z.array(
        z.object({
          country: z.string(),
          date: z.string(),
        }),
      ),
    }),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'list all the stamps in these passport pages?',
          },
          {
            type: 'image',
            image: new URL(
              'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/WW2_Spanish_official_passport.jpg/1498px-WW2_Spanish_official_passport.jpg',
            ),
          },
        ],
      },
    ],
  });

  for await (const partialObject of partialObjectStream) {
    console.clear();
    console.log(partialObject);
  }
}

main();
```

## File Buffer

```ts file='index.ts'
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

async function main() {
  const { partialObjectStream } = streamObject({
    model: openai('gpt-4-turbo'),
    maxTokens: 512,
    schema: z.object({
      stamps: z.array(
        z.object({
          country: z.string(),
          date: z.string(),
        }),
      ),
    }),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'list all the stamps in these passport pages?',
          },
          {
            type: 'image',
            image: fs.readFileSync('./node/attachments/eclipse.jpg'),
          },
        ],
      },
    ],
  });

  for await (const partialObject of partialObjectStream) {
    console.clear();
    console.log(partialObject);
  }
}

main();
```


================================================
File: content/cookbook/05-node/45-stream-object-record-token-usage.mdx
================================================
---
title: Record Token Usage After Streaming Object
description: Learn how to record token usage when streaming structured data using the AI SDK and Node
tags: ['node', 'streaming', 'structured data', 'observability']
---

# Record Token Usage After Streaming Object

When you're streaming structured data with [`streamObject`](/docs/reference/ai-sdk-core/stream-object),
you may want to record the token usage for billing purposes.

## `onFinish` Callback

You can use the `onFinish` callback to record token usage.
It is called when the stream is finished.

```ts file='index.ts' highlight={"15-17"}
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const result = streamObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
  onFinish({ usage }) {
    console.log('Token usage:', usage);
  },
});
```

## `usage` Promise

The [`streamObject`](/docs/reference/ai-sdk-core/stream-object) result contains a `usage` promise that resolves to the total token usage.

```ts file='index.ts' highlight={"29,32"}
import { openai } from '@ai-sdk/openai';
import { streamObject, TokenUsage } from 'ai';
import { z } from 'zod';

const result = streamObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});

// your custom function to record token usage:
function recordTokenUsage({
  promptTokens,
  completionTokens,
  totalTokens,
}: TokenUsage) {
  console.log('Prompt tokens:', promptTokens);
  console.log('Completion tokens:', completionTokens);
  console.log('Total tokens:', totalTokens);
}

// use as promise:
result.usage.then(recordTokenUsage);

// use with async/await:
recordTokenUsage(await result.usage);

// note: the stream needs to be consumed because of backpressure
for await (const partialObject of result.partialObjectStream) {
}
```


================================================
File: content/cookbook/05-node/46-stream-object-record-final-object.mdx
================================================
---
title: Record Final Object after Streaming Object
description: Learn how to record the final object after streaming an object using the AI SDK and Node
tags: ['node', 'streaming', 'structured data']
---

# Record Final Object after Streaming Object

When you're streaming structured data, you may want to record the final object for logging or other purposes.

## `onFinish` Callback

You can use the `onFinish` callback to record the final object.
It is called when the stream is finished.

The `object` parameter contains the final object, or `undefined` if the type validation fails.
There is also an `error` parameter that contains error when e.g. the object does not match the schema.

```ts file='index.ts' highlight={"15-23"}
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const result = streamObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
  onFinish({ object, error }) {
    // handle type validation failure (when the object does not match the schema):
    if (object === undefined) {
      console.error('Error:', error);
      return;
    }

    console.log('Final object:', JSON.stringify(object, null, 2));
  },
});
```

## `object` Promise

The [`streamObject`](/docs/reference/ai-sdk-core/stream-object) result contains an `object` promise that resolves to the final object.
The object is fully typed. When the type validation according to the schema fails, the promise will be rejected with a `TypeValidationError`.

```ts file='index.ts' highlight={"17-26"}
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const result = streamObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});

result.object
  .then(({ recipe }) => {
    // do something with the fully typed, final object:
    console.log('Recipe:', JSON.stringify(recipe, null, 2));
  })
  .catch(error => {
    // handle type validation failure
    // (when the object does not match the schema):
    console.error(error);
  });

// note: the stream needs to be consumed because of backpressure
for await (const partialObject of result.partialObjectStream) {
}
```


================================================
File: content/cookbook/05-node/50-call-tools.mdx
================================================
---
title: Call Tools
description: Learn how to call tools using the AI SDK and Node
tags: ['node', 'tool use']
---

# Call Tools

Some models allow developers to provide a list of tools that can be called at any time during a generation.
This is useful for extending the capabilites of a language model to either use logic or data to interact with systems external to the model.

```ts
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = await generateText({
  model: openai('gpt-4-turbo'),
  tools: {
    weather: tool({
      description: 'Get the weather in a location',
      parameters: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      }),
    }),
    cityAttractions: tool({
      parameters: z.object({ city: z.string() }),
    }),
  },
  prompt:
    'What is the weather in San Francisco and what attractions should I visit?',
});
```

## Accessing Tool Calls and Tool Results

If the model decides to call a tool, it will generate a tool call. You can access the tool call by checking the `toolCalls` property on the result.

```ts highlight="31-44"
import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

async function main() {
  const result = await generateText({
    model: openai('gpt-3.5-turbo'),
    maxTokens: 512,
    tools: {
      weather: tool({
        description: 'Get the weather in a location',
        parameters: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: async ({ location }) => ({
          location,
          temperature: 72 + Math.floor(Math.random() * 21) - 10,
        }),
      }),
      cityAttractions: tool({
        parameters: z.object({ city: z.string() }),
      }),
    },
    prompt:
      'What is the weather in San Francisco and what attractions should I visit?',
  });

  // typed tool calls:
  for (const toolCall of result.toolCalls) {
    switch (toolCall.toolName) {
      case 'cityAttractions': {
        toolCall.args.city; // string
        break;
      }

      case 'weather': {
        toolCall.args.location; // string
        break;
      }
    }
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
```

## Accessing Tool Results

You can access the result of a tool call by checking the `toolResults` property on the result.

```ts highlight="31-41"
import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

async function main() {
  const result = await generateText({
    model: openai('gpt-3.5-turbo'),
    maxTokens: 512,
    tools: {
      weather: tool({
        description: 'Get the weather in a location',
        parameters: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: async ({ location }) => ({
          location,
          temperature: 72 + Math.floor(Math.random() * 21) - 10,
        }),
      }),
      cityAttractions: tool({
        parameters: z.object({ city: z.string() }),
      }),
    },
    prompt:
      'What is the weather in San Francisco and what attractions should I visit?',
  });

  // typed tool results for tools with execute method:
  for (const toolResult of result.toolResults) {
    switch (toolResult.toolName) {
      case 'weather': {
        toolResult.args.location; // string
        toolResult.result.location; // string
        toolResult.result.temperature; // number
        break;
      }
    }
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
```

<Note>
  `toolResults` will only be available if the tool has an `execute` function.
</Note>

## Model Response

When using tools, it's important to note that the model won't respond with the tool call results by default.
This is because the model has technically already generated its response to the prompt: the tool call.
Many use cases will require the model to summarise the results of the tool call within the context of the original prompt automatically.
You can achieve this by [using `maxSteps`](/examples/node/tools/call-tools-with-automatic-roundtrips)
which will automatically send toolResults to the model to trigger another generation.


================================================
File: content/cookbook/05-node/51-call-tools-in-parallel.mdx
================================================
---
title: Call Tools in Parallels
description: Learn how to call tools in parallel using the AI SDK and Node
tags: ['node', 'tool use']
---

# Call Tools in Parallel

Some language models support calling tools in parallel.
This is particularly useful when multiple tools are independent of each other and can be executed in parallel during the same generation step.

```ts
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = await generateText({
  model: openai('gpt-4-turbo'),
  tools: {
    weather: tool({
      description: 'Get the weather in a location',
      parameters: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }: { location: string }) => ({
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      }),
    }),
    cityAttractions: tool({
      parameters: z.object({ city: z.string() }),
      execute: async ({ city }: { city: string }) => {
        if (city === 'San Francisco') {
          return {
            attractions: [
              'Golden Gate Bridge',
              'Alcatraz Island',
              "Fisherman's Wharf",
            ],
          };
        } else {
          return { attractions: [] };
        }
      },
    }),
  },
  prompt:
    'What is the weather in San Francisco and what attractions should I visit?',
});

console.log(result);
```


================================================
File: content/cookbook/05-node/52-call-tools-with-image-prompt.mdx
================================================
---
title: Call Tools with Image Prompt
description: Learn how to call tools with image prompt using the AI SDK and Node
tags: ['node', 'tool use', 'multimodal']
---

# Call Tools with Image Prompt

Some language models that support vision capabilities accept images as part of the prompt. Here are some of the different [formats](/docs/reference/ai-sdk-core/generate-text#content-image) you can use to include images as input.

```ts
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = await generateText({
  model: openai('gpt-4-turbo'),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'can you log this meal for me?' },
        {
          type: 'image',
          image: new URL(
            'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Cheeseburger_%2817237580619%29.jpg/640px-Cheeseburger_%2817237580619%29.jpg',
          ),
        },
      ],
    },
  ],
  tools: {
    logFood: tool({
      description: 'Log a food item',
      parameters: z.object({
        name: z.string(),
        calories: z.number(),
      }),
      execute({ name, calories }) {
        storeInDatabase({ name, calories });
      },
    }),
  },
});
```


================================================
File: content/cookbook/05-node/53-call-tools-multiple-steps.mdx
================================================
---
title: Call Tools in Multiple Steps
description: Learn how to call tools with multiple steps using the AI SDK and Node
tags: ['node', 'tool use', 'agent']
---

# Call Tools in Multiple Steps

Models call tools to gather information or perform actions that are not directly available to the model.
When tool results are available, the model can use them to generate another response.

You can enable multi-step tool calls in `generateText` by setting the `maxSteps` option to
a number greater than 1.
This option specifies the maximum number of steps (i.e., LLM calls) that can be made to prevent infinite loops.

```ts highlight={"7"}
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const { text } = await generateText({
  model: openai('gpt-4-turbo'),
  maxSteps: 5,
  tools: {
    weather: tool({
      description: 'Get the weather in a location',
      parameters: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }: { location: string }) => ({
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      }),
    }),
  },
  prompt: 'What is the weather in San Francisco?',
});
```


================================================
File: content/cookbook/05-node/60-embed-text.mdx
================================================
---
title: Embed Text
description: Learn how to embed text using the AI SDK and Node
tags: ['node', 'embedding']
---

# Embed Text

Text embeddings are numerical representations of text that capture semantic meaning, allowing machines to understand and process language in a mathematical way. These vector representations are crucial for many AI applications, as they enable tasks like semantic search, document similarity comparison, and content recommendation.

This example demonstrates how to convert text into embeddings using a text embedding model. The resulting embedding is a high-dimensional vector that represents the semantic meaning of the input text. For a more practical application of embeddings, check out our [RAG example](/cookbook/node/retrieval-augmented-generation) which shows how embeddings can be used for document retrieval.

```ts
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import 'dotenv/config';

async function main() {
  const { embedding, usage } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: 'sunny day at the beach',
  });

  console.log(embedding);
  console.log(usage);
}

main().catch(console.error);
```


================================================
File: content/cookbook/05-node/61-embed-text-batch.mdx
================================================
---
title: Embed Text in Batch
description: Learn how to embed multiple text using the AI SDK and Node
tags: ['node', 'embedding']
---

# Embed Text in Batch

When working with large datasets or multiple pieces of text, processing embeddings one at a time can be inefficient. Batch embedding allows you to convert multiple text inputs into embeddings simultaneously, significantly improving performance and reducing API calls. This is particularly useful when processing documents, chat messages, or any collection of text that needs to be vectorized.

This example shows how to embed multiple text inputs in a single operation using the AI SDK. For single text embedding, see our [Embed Text](/cookbook/node/embed-text) example, or for a practical application, check out our [RAG example](/cookbook/node/retrieval-augmented-generation) which demonstrates how batch embeddings can be used in a document retrieval system.

```ts
import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import 'dotenv/config';

async function main() {
  const { embeddings, usage } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: [
      'sunny day at the beach',
      'rainy afternoon in the city',
      'snowy night in the mountains',
    ],
  });

  console.log(embeddings);
  console.log(usage);
}

main().catch(console.error);
```


================================================
File: content/cookbook/05-node/70-intercept-fetch-requests.mdx
================================================
---
title: Intercepting Fetch Requests
description: Learn how to intercept fetch requests using the AI SDK and Node
tags: ['node']
---

# Intercepting Fetch Requests

Many providers support setting a custom `fetch` function using the `fetch` argument in their factory function.

A custom `fetch` function can be used to intercept and modify requests before they are sent to the provider's API,
and to intercept and modify responses before they are returned to the caller.

Use cases for intercepting requests include:

- Logging requests and responses
- Adding authentication headers
- Modifying request bodies
- Caching responses
- Using a custom HTTP client

## Example

```ts file='index.ts' highlight="5-13"
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({
  // example fetch wrapper that logs the input to the API call:
  fetch: async (url, options) => {
    console.log('URL', url);
    console.log('Headers', JSON.stringify(options!.headers, null, 2));
    console.log(
      `Body ${JSON.stringify(JSON.parse(options!.body! as string), null, 2)}`,
    );
    return await fetch(url, options);
  },
});

const { text } = await generateText({
  model: openai('gpt-3.5-turbo'),
  prompt: 'Why is the sky blue?',
});
```


================================================
File: content/cookbook/05-node/index.mdx
================================================
---
title: Node
---


================================================
File: content/cookbook/15-api-servers/10-node-http-server.mdx
================================================
---
title: Node.js HTTP Server
description: Learn how to use the AI SDK in a Node.js HTTP server
tags: ['api servers', 'streaming']
---

# Node.js HTTP Server

You can use the AI SDK in a Node.js HTTP server to generate text and stream it to the client.

## Examples

The examples start a simple HTTP server that listens on port 8080. You can e.g. test it using `curl`:

```bash
curl -X POST http://localhost:8080
```

<Note>
  The examples use the OpenAI `gpt-4o` model. Ensure that the OpenAI API key is
  set in the `OPENAI_API_KEY` environment variable.
</Note>

**Full example**: [github.com/vercel/ai/examples/node-http-server](https://github.com/vercel/ai/tree/main/examples/node-http-server)

### Data Stream

You can use the `pipeDataStreamToResponse` method to pipe the stream data to the server response.

```ts filename='index.ts'
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createServer } from 'http';

createServer(async (req, res) => {
  const result = streamText({
    model: openai('gpt-4o'),
    prompt: 'Invent a new holiday and describe its traditions.',
  });

  result.pipeDataStreamToResponse(res);
}).listen(8080);
```

### Sending Custom Data

`pipeDataStreamToResponse` can be used to send custom data to the client.

```ts filename='index.ts' highlight="6-9,16"
import { openai } from '@ai-sdk/openai';
import { pipeDataStreamToResponse, streamText } from 'ai';
import { createServer } from 'http';

createServer(async (req, res) => {
  // immediately start streaming the response
  pipeDataStreamToResponse(res, {
    execute: async dataStreamWriter => {
      dataStreamWriter.writeData('initialized call');

      const result = streamText({
        model: openai('gpt-4o'),
        prompt: 'Invent a new holiday and describe its traditions.',
      });

      result.mergeIntoDataStream(dataStreamWriter);
    },
    onError: error => {
      // Error messages are masked by default for security reasons.
      // If you want to expose the error message to the client, you can do so here:
      return error instanceof Error ? error.message : String(error);
    },
  });
}).listen(8080);
```

### Text Stream

You can send a text stream to the client using `pipeTextStreamToResponse`.

```ts filename='index.ts'
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createServer } from 'http';

createServer(async (req, res) => {
  const result = streamText({
    model: openai('gpt-4o'),
    prompt: 'Invent a new holiday and describe its traditions.',
  });

  result.pipeTextStreamToResponse(res);
}).listen(8080);
```


================================================
File: content/cookbook/15-api-servers/20-express.mdx
================================================
---
title: Express
description: Learn how to use the AI SDK in an Express server
tags: ['api servers', 'streaming']
---

# Express

You can use the AI SDK in an [Express](https://expressjs.com/) server to generate and stream text and objects to the client.

## Examples

The examples start a simple HTTP server that listens on port 8080. You can e.g. test it using `curl`:

```bash
curl -X POST http://localhost:8080
```

<Note>
  The examples use the OpenAI `gpt-4o` model. Ensure that the OpenAI API key is
  set in the `OPENAI_API_KEY` environment variable.
</Note>

**Full example**: [github.com/vercel/ai/examples/express](https://github.com/vercel/ai/tree/main/examples/express)

### Data Stream

You can use the `pipeDataStreamToResponse` method to pipe the stream data to the server response.

```ts filename='index.ts'
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import express, { Request, Response } from 'express';

const app = express();

app.post('/', async (req: Request, res: Response) => {
  const result = streamText({
    model: openai('gpt-4o'),
    prompt: 'Invent a new holiday and describe its traditions.',
  });

  result.pipeDataStreamToResponse(res);
});

app.listen(8080, () => {
  console.log(`Example app listening on port ${8080}`);
});
```

### Sending Custom Data

`pipeDataStreamToResponse` can be used to send custom data to the client.

```ts filename='index.ts' highlight="8-11,18"
import { openai } from '@ai-sdk/openai';
import { pipeDataStreamToResponse, streamText } from 'ai';
import express, { Request, Response } from 'express';

const app = express();

app.post('/stream-data', async (req: Request, res: Response) => {
  // immediately start streaming the response
  pipeDataStreamToResponse(res, {
    execute: async dataStreamWriter => {
      dataStreamWriter.writeData('initialized call');

      const result = streamText({
        model: openai('gpt-4o'),
        prompt: 'Invent a new holiday and describe its traditions.',
      });

      result.mergeIntoDataStream(dataStreamWriter);
    },
    onError: error => {
      // Error messages are masked by default for security reasons.
      // If you want to expose the error message to the client, you can do so here:
      return error instanceof Error ? error.message : String(error);
    },
  });
});

app.listen(8080, () => {
  console.log(`Example app listening on port ${8080}`);
});
```

### Text Stream

You can send a text stream to the client using `pipeTextStreamToResponse`.

```ts filename='index.ts' highlight="13"
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import express, { Request, Response } from 'express';

const app = express();

app.post('/', async (req: Request, res: Response) => {
  const result = streamText({
    model: openai('gpt-4o'),
    prompt: 'Invent a new holiday and describe its traditions.',
  });

  result.pipeTextStreamToResponse(res);
});

app.listen(8080, () => {
  console.log(`Example app listening on port ${8080}`);
});
```


================================================
File: content/cookbook/15-api-servers/30-hono.mdx
================================================
---
title: Hono
description: Example of using the AI SDK in a Hono server.
tags: ['api servers', 'streaming']
---

# Hono

You can use the AI SDK in a [Hono](https://hono.dev/) server to generate and stream text and objects to the client.

## Examples

The examples start a simple HTTP server that listens on port 8080. You can e.g. test it using `curl`:

```bash
curl -X POST http://localhost:8080
```

<Note>
  The examples use the OpenAI `gpt-4o` model. Ensure that the OpenAI API key is
  set in the `OPENAI_API_KEY` environment variable.
</Note>

**Full example**: [github.com/vercel/ai/examples/hono](https://github.com/vercel/ai/tree/main/examples/hono)

### Data Stream

You can use the `toDataStream` method to get a data stream from the result and then pipe it to the response.

```ts filename='index.ts'
import { openai } from '@ai-sdk/openai';
import { serve } from '@hono/node-server';
import { streamText } from 'ai';
import { Hono } from 'hono';
import { stream } from 'hono/streaming';

const app = new Hono();

app.post('/', async c => {
  const result = streamText({
    model: openai('gpt-4o'),
    prompt: 'Invent a new holiday and describe its traditions.',
  });

  // Mark the response as a v1 data stream:
  c.header('X-Vercel-AI-Data-Stream', 'v1');
  c.header('Content-Type', 'text/plain; charset=utf-8');

  return stream(c, stream => stream.pipe(result.toDataStream()));
});

serve({ fetch: app.fetch, port: 8080 });
```

### Sending Custom Data

`createDataStream` can be used to send custom data to the client.

```ts filename='index.ts' highlight="10-13,20"
import { openai } from '@ai-sdk/openai';
import { serve } from '@hono/node-server';
import { createDataStream, streamText } from 'ai';
import { Hono } from 'hono';
import { stream } from 'hono/streaming';

const app = new Hono();

app.post('/stream-data', async c => {
  // immediately start streaming the response
  const dataStream = createDataStream({
    execute: async dataStreamWriter => {
      dataStreamWriter.writeData('initialized call');

      const result = streamText({
        model: openai('gpt-4o'),
        prompt: 'Invent a new holiday and describe its traditions.',
      });

      result.mergeIntoDataStream(dataStreamWriter);
    },
    onError: error => {
      // Error messages are masked by default for security reasons.
      // If you want to expose the error message to the client, you can do so here:
      return error instanceof Error ? error.message : String(error);
    },
  });

  // Mark the response as a v1 data stream:
  c.header('X-Vercel-AI-Data-Stream', 'v1');
  c.header('Content-Type', 'text/plain; charset=utf-8');

  return stream(c, stream =>
    stream.pipe(dataStream.pipeThrough(new TextEncoderStream())),
  );
});

serve({ fetch: app.fetch, port: 8080 });
```

### Text Stream

You can use the `textStream` property to get a text stream from the result and then pipe it to the response.

```ts filename='index.ts' highlight="17"
import { openai } from '@ai-sdk/openai';
import { serve } from '@hono/node-server';
import { streamText } from 'ai';
import { Hono } from 'hono';
import { stream } from 'hono/streaming';

const app = new Hono();

app.post('/', async c => {
  const result = streamText({
    model: openai('gpt-4o'),
    prompt: 'Invent a new holiday and describe its traditions.',
  });

  c.header('Content-Type', 'text/plain; charset=utf-8');

  return stream(c, stream => stream.pipe(result.textStream));
});

serve({ fetch: app.fetch, port: 8080 });
```


================================================
File: content/cookbook/15-api-servers/40-fastify.mdx
================================================
---
title: Fastify
description: Learn how to use the AI SDK in a Fastify server
tags: ['api servers', 'streaming']
---

# Fastify

You can use the AI SDK in a [Fastify](https://fastify.dev/) server to generate and stream text and objects to the client.

## Examples

The examples start a simple HTTP server that listens on port 8080. You can e.g. test it using `curl`:

```bash
curl -X POST http://localhost:8080
```

<Note>
  The examples use the OpenAI `gpt-4o` model. Ensure that the OpenAI API key is
  set in the `OPENAI_API_KEY` environment variable.
</Note>

**Full example**: [github.com/vercel/ai/examples/fastify](https://github.com/vercel/ai/tree/main/examples/fastify)

### Data Stream

You can use the `toDataStream` method to get a data stream from the result and then pipe it to the response.

```ts filename='index.ts'
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.post('/', async function (request, reply) {
  const result = streamText({
    model: openai('gpt-4o'),
    prompt: 'Invent a new holiday and describe its traditions.',
  });

  // Mark the response as a v1 data stream:
  reply.header('X-Vercel-AI-Data-Stream', 'v1');
  reply.header('Content-Type', 'text/plain; charset=utf-8');

  return reply.send(result.toDataStream({ data }));
});

fastify.listen({ port: 8080 });
```

### Sending Custom Data

`createDataStream` can be used to send custom data to the client.

```ts filename='index.ts' highlight="8-11,18"
import { openai } from '@ai-sdk/openai';
import { createDataStream, streamText } from 'ai';
import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.post('/stream-data', async function (request, reply) {
  // immediately start streaming the response
  const dataStream = createDataStream({
    execute: async dataStreamWriter => {
      dataStreamWriter.writeData('initialized call');

      const result = streamText({
        model: openai('gpt-4o'),
        prompt: 'Invent a new holiday and describe its traditions.',
      });

      result.mergeIntoDataStream(dataStreamWriter);
    },
    onError: error => {
      // Error messages are masked by default for security reasons.
      // If you want to expose the error message to the client, you can do so here:
      return error instanceof Error ? error.message : String(error);
    },
  });

  // Mark the response as a v1 data stream:
  reply.header('X-Vercel-AI-Data-Stream', 'v1');
  reply.header('Content-Type', 'text/plain; charset=utf-8');

  return reply.send(dataStream);
});

fastify.listen({ port: 8080 });
```

### Text Stream

You can use the `textStream` property to get a text stream from the result and then pipe it to the response.

```ts filename='index.ts' highlight="15"
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.post('/', async function (request, reply) {
  const result = streamText({
    model: openai('gpt-4o'),
    prompt: 'Invent a new holiday and describe its traditions.',
  });

  reply.header('Content-Type', 'text/plain; charset=utf-8');

  return reply.send(result.textStream);
});

fastify.listen({ port: 8080 });
```


================================================
File: content/cookbook/15-api-servers/50-nest.mdx
================================================
---
title: Nest.js
description: Learn how to use the AI SDK in a Nest.js server
tags: ['api servers', 'streaming']
---

# Nest.js

You can use the AI SDK in a [Nest.js](https://nestjs.com/) server to generate and stream text and objects to the client.

## Examples

The examples show how to implement a Nest.js controller that uses the AI SDK to stream text and objects to the client.

**Full example**: [github.com/vercel/ai/examples/nest](https://github.com/vercel/ai/tree/main/examples/nest)

### Data Stream

You can use the `pipeDataStreamToResponse` method to get a data stream from the result and then pipe it to the response.

```ts filename='app.controller.ts'
import { Controller, Post, Res } from '@nestjs/common';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { Response } from 'express';

@Controller()
export class AppController {
  @Post()
  async example(@Res() res: Response) {
    const result = streamText({
      model: openai('gpt-4o'),
      prompt: 'Invent a new holiday and describe its traditions.',
    });

    result.pipeDataStreamToResponse(res);
  }
}
```

### Sending Custom Data

`pipeDataStreamToResponse` can be used to send custom data to the client.

```ts filename='app.controller.ts' highlight="10-12,19"
import { Controller, Post, Res } from '@nestjs/common';
import { openai } from '@ai-sdk/openai';
import { pipeDataStreamToResponse, streamText } from 'ai';
import { Response } from 'express';

@Controller()
export class AppController {
  @Post('/stream-data')
  async streamData(@Res() res: Response) {
    pipeDataStreamToResponse(res, {
      execute: async dataStreamWriter => {
        dataStreamWriter.writeData('initialized call');

        const result = streamText({
          model: openai('gpt-4o'),
          prompt: 'Invent a new holiday and describe its traditions.',
        });

        result.mergeIntoDataStream(dataStreamWriter);
      },
      onError: error => {
        // Error messages are masked by default for security reasons.
        // If you want to expose the error message to the client, you can do so here:
        return error instanceof Error ? error.message : String(error);
      },
    });
  }
}
```

### Text Stream

You can use the `pipeTextStreamToResponse` method to get a text stream from the result and then pipe it to the response.

```ts filename='app.controller.ts' highlight="15"
import { Controller, Post, Res } from '@nestjs/common';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { Response } from 'express';

@Controller()
export class AppController {
  @Post()
  async example(@Res() res: Response) {
    const result = streamText({
      model: openai('gpt-4o'),
      prompt: 'Invent a new holiday and describe its traditions.',
    });

    result.pipeTextStreamToResponse(res);
  }
}
```


================================================
File: content/cookbook/15-api-servers/index.mdx
================================================
---
title: API Servers
---


================================================
File: content/cookbook/20-rsc/10-generate-text.mdx
================================================
---
title: Generate Text
description: Learn how to generate text using the AI SDK and React Server Components.
tags: ['rsc']
---

# Generate Text

<Note>
  This example uses React Server Components (RSC). If you want to client side
  rendering and hooks instead, check out the ["generate text" example with
  useState](/examples/next-pages/basics/generating-text).
</Note>

A situation may arise when you need to generate text based on a prompt. For example, you may want to generate a response to a question or summarize a body of text. The `generateText` function can be used to generate text based on the input prompt.

<Browser>
  <TextGeneration />
</Browser>

## Client

Let's create a simple React component that will call the `getAnswer` function when a button is clicked. The `getAnswer` function will call the `generateText` function from the `ai` module, which will then generate text based on the input prompt.

```tsx filename="app/page.tsx"
'use client';

import { useState } from 'react';
import { getAnswer } from './actions';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [generation, setGeneration] = useState<string>('');

  return (
    <div>
      <button
        onClick={async () => {
          const { text } = await getAnswer('Why is the sky blue?');
          setGeneration(text);
        }}
      >
        Answer
      </button>
      <div>{generation}</div>
    </div>
  );
}
```

## Server

On the server side, we need to implement the `getAnswer` function, which will call the `generateText` function from the `ai` module. The `generateText` function will generate text based on the input prompt.

```typescript filename='app/actions.ts'
'use server';

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function getAnswer(question: string) {
  const { text, finishReason, usage } = await generateText({
    model: openai('gpt-3.5-turbo'),
    prompt: question,
  });

  return { text, finishReason, usage };
}
```


================================================
File: content/cookbook/20-rsc/11-generate-text-with-chat-prompt.mdx
================================================
---
title: Generate Text with Chat Prompt
description: Learn how to generate text with chat prompt using the AI SDK and React Server Components.
tags: ['rsc', 'chat']
---

# Generate Text with Chat Prompt

Previously, we were able to generate text and objects using either a single message prompt, a system prompt, or a combination of both of them. However, there may be times when you want to generate text based on a series of messages.

A chat completion allows you to generate text based on a series of messages. This series of messages can be any series of interactions between any number of systems, but the most popular and relatable use case has been a series of messages that represent a conversation between a user and a model.

<Browser>
  <ChatGeneration
    history={[
      { role: 'User', content: 'How is it going?' },
      { role: 'Assistant', content: 'All good, how may I help you?' },
    ]}
    inputMessage={{ role: 'User', content: 'Why is the sky blue?' }}
    outputMessage={{
      role: 'Assistant',
      content: 'The sky is blue because of rayleigh scattering.',
    }}
  />
</Browser>

## Client

Let's create a simple conversation between a user and a model, and place a button that will call `continueConversation`.

```tsx filename='app/page.tsx'
'use client';

import { useState } from 'react';
import { Message, continueConversation } from './actions';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');

  return (
    <div>
      <div>
        {conversation.map((message, index) => (
          <div key={index}>
            {message.role}: {message.content}
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={input}
          onChange={event => {
            setInput(event.target.value);
          }}
        />
        <button
          onClick={async () => {
            const { messages } = await continueConversation([
              ...conversation,
              { role: 'user', content: input },
            ]);

            setConversation(messages);
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
```

## Server

Now, let's implement the `continueConversation` function that will insert the user's message into the conversation and generate a response.

```typescript filename='app/actions.ts'
'use server';

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function continueConversation(history: Message[]) {
  'use server';

  const { text } = await generateText({
    model: openai('gpt-3.5-turbo'),
    system: 'You are a friendly assistant!',
    messages: history,
  });

  return {
    messages: [
      ...history,
      {
        role: 'assistant' as const,
        content: text,
      },
    ],
  };
}
```


================================================
File: content/cookbook/20-rsc/120-stream-assistant-response.mdx
================================================
---
title: Stream Assistant Response
description: Learn how to generate text using the AI SDK and React Server Components.
tags: ['rsc', 'streaming', 'assistant']
---

# Stream Assistant Responses

In this example, you'll learn how to stream responses from OpenAI's [Assistant API](https://platform.openai.com/docs/assistants/overview) using `ai/rsc`.

## Client

In your client component, you will create a simple chat interface that allows users to send messages to the assistant and receive responses. The assistant's responses will be streamed in two parts: the status of the current run and the text content of the messages.

```tsx filename='app/page.tsx'
'use client';

import { useState } from 'react';
import { ClientMessage } from './actions';
import { useActions } from 'ai/rsc';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const { submitMessage } = useActions();

  const handleSubmission = async () => {
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: '123',
        status: 'user.message.created',
        text: input,
        gui: null,
      },
    ]);

    const response = await submitMessage(input);
    setMessages(currentMessages => [...currentMessages, response]);
    setInput('');
  };

  return (
    <div className="flex flex-col-reverse">
      <div className="flex flex-row gap-2 p-2 bg-zinc-100 w-full">
        <input
          className="bg-zinc-100 w-full p-2 outline-none"
          value={input}
          onChange={event => setInput(event.target.value)}
          placeholder="Ask a question"
          onKeyDown={event => {
            if (event.key === 'Enter') {
              handleSubmission();
            }
          }}
        />
        <button
          className="p-2 bg-zinc-900 text-zinc-100 rounded-md"
          onClick={handleSubmission}
        >
          Send
        </button>
      </div>

      <div className="flex flex-col h-[calc(100dvh-56px)] overflow-y-scroll">
        <div>
          {messages.map(message => (
            <div key={message.id} className="flex flex-col gap-1 border-b p-2">
              <div className="flex flex-row justify-between">
                <div className="text-sm text-zinc-500">{message.status}</div>
              </div>
              <div>{message.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

```tsx filename='app/message.tsx'
'use client';

import { StreamableValue, useStreamableValue } from 'ai/rsc';

export function Message({ textStream }: { textStream: StreamableValue }) {
  const [text] = useStreamableValue(textStream);

  return <div>{text}</div>;
}
```

## Server

In your server action, you will create a function called `submitMessage` that adds the user's message to the thread. The function will create a new thread if one does not exist and add the user's message to the thread. If a thread already exists, the function will add the user's message to the existing thread. The function will then create a run and stream the assistant's response to the client. Furthermore, the run queue is used to manage multiple runs in the same thread during the lifetime of the server action.

```tsx filename='app/actions.tsx'
'use server';

import { generateId } from 'ai';
import { createStreamableUI, createStreamableValue } from 'ai/rsc';
import { OpenAI } from 'openai';
import { ReactNode } from 'react';
import { Message } from './message';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ClientMessage {
  id: string;
  status: ReactNode;
  text: ReactNode;
}

const ASSISTANT_ID = 'asst_xxxx';
let THREAD_ID = '';
let RUN_ID = '';

export async function submitMessage(question: string): Promise<ClientMessage> {
  const statusUIStream = createStreamableUI('thread.init');

  const textStream = createStreamableValue('');
  const textUIStream = createStreamableUI(
    <Message textStream={textStream.value} />,
  );

  const runQueue = [];

  (async () => {
    if (THREAD_ID) {
      await openai.beta.threads.messages.create(THREAD_ID, {
        role: 'user',
        content: question,
      });

      const run = await openai.beta.threads.runs.create(THREAD_ID, {
        assistant_id: ASSISTANT_ID,
        stream: true,
      });

      runQueue.push({ id: generateId(), run });
    } else {
      const run = await openai.beta.threads.createAndRun({
        assistant_id: ASSISTANT_ID,
        stream: true,
        thread: {
          messages: [{ role: 'user', content: question }],
        },
      });

      runQueue.push({ id: generateId(), run });
    }

    while (runQueue.length > 0) {
      const latestRun = runQueue.shift();

      if (latestRun) {
        for await (const delta of latestRun.run) {
          const { data, event } = delta;

          statusUIStream.update(event);

          if (event === 'thread.created') {
            THREAD_ID = data.id;
          } else if (event === 'thread.run.created') {
            RUN_ID = data.id;
          } else if (event === 'thread.message.delta') {
            data.delta.content?.map(part => {
              if (part.type === 'text') {
                if (part.text) {
                  textStream.append(part.text.value as string);
                }
              }
            });
          } else if (event === 'thread.run.failed') {
            console.error(data);
          }
        }
      }
    }

    statusUIStream.done();
    textStream.done();
  })();

  return {
    id: generateId(),
    status: statusUIStream.value,
    text: textUIStream.value,
  };
}
```

```tsx filename="app/ai.ts"
import { createAI } from 'ai/rsc';
import { submitMessage } from './actions';

export const AI = createAI({
  actions: {
    submitMessage,
  },
  initialAIState: [],
  initialUIState: [],
});
```

And finally, make sure to update your layout component to wrap the children with the `AI` component.

```tsx filename="app/layout.tsx"
import { ReactNode } from 'react';
import { AI } from './ai';

export default function Layout({ children }: { children: ReactNode }) {
  return <AI>{children}</AI>;
}
```


================================================
File: content/cookbook/20-rsc/121-stream-assistant-response-with-tools.mdx
================================================
---
title: Stream Assistant Response with Tools
description: Learn how to generate text using the AI SDK and React Server Components.
tags: ['rsc', 'streaming', 'assistant']
---

# Stream Assistant Responses

In this example, you'll learn how to stream responses along with tool calls from OpenAI's [Assistant API](https://platform.openai.com/docs/assistants/overview) using `ai/rsc`.

## Client

In your client component, you will create a simple chat interface that allows users to send messages to the assistant and receive responses. The assistant's responses will be streamed in two parts: the status of the current run and the text content of the messages.

```tsx filename='app/page.tsx'
'use client';

import { useState } from 'react';
import { ClientMessage, submitMessage } from './actions';
import { useActions } from 'ai/rsc';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const { submitMessage } = useActions();

  const handleSubmission = async () => {
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: '123',
        status: 'user.message.created',
        text: input,
        gui: null,
      },
    ]);

    const response = await submitMessage(input);
    setMessages(currentMessages => [...currentMessages, response]);
    setInput('');
  };

  return (
    <div className="flex flex-col-reverse">
      <div className="flex flex-row gap-2 p-2 bg-zinc-100 w-full">
        <input
          className="bg-zinc-100 w-full p-2 outline-none"
          value={input}
          onChange={event => setInput(event.target.value)}
          placeholder="Ask a question"
          onKeyDown={event => {
            if (event.key === 'Enter') {
              handleSubmission();
            }
          }}
        />
        <button
          className="p-2 bg-zinc-900 text-zinc-100 rounded-md"
          onClick={handleSubmission}
        >
          Send
        </button>
      </div>

      <div className="flex flex-col h-[calc(100dvh-56px)] overflow-y-scroll">
        <div>
          {messages.map(message => (
            <div key={message.id} className="flex flex-col gap-1 border-b p-2">
              <div className="flex flex-row justify-between">
                <div className="text-sm text-zinc-500">{message.status}</div>
              </div>
              <div className="flex flex-col gap-2">{message.gui}</div>
              <div>{message.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

```tsx filename='app/message.tsx'
'use client';

import { StreamableValue, useStreamableValue } from 'ai/rsc';

export function Message({ textStream }: { textStream: StreamableValue }) {
  const [text] = useStreamableValue(textStream);

  return <div>{text}</div>;
}
```

## Server

In your server action, you will create a function called `submitMessage` that adds the user's message to the thread. The function will create a new thread if one does not exist and add the user's message to the thread. If a thread already exists, the function will add the user's message to the existing thread. The function will then create a run and stream the assistant's response to the client. Furthermore, the run queue is used to manage multiple runs in the same thread during the lifetime of the server action.

In case the assistant requires a tool call, the server action will handle the tool call and return the output to the assistant. In this example, the assistant requires a tool call to search for emails. The server action will search for emails based on the `query` and `has_attachments` parameters and return the output to the both the assistant and the client.

```tsx filename='app/actions.tsx'
'use server';

import { generateId } from 'ai';
import { createStreamableUI, createStreamableValue } from 'ai/rsc';
import { OpenAI } from 'openai';
import { ReactNode } from 'react';
import { searchEmails } from './function';
import { Message } from './message';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ClientMessage {
  id: string;
  status: ReactNode;
  text: ReactNode;
  gui: ReactNode;
}

const ASSISTANT_ID = 'asst_xxxx';
let THREAD_ID = '';
let RUN_ID = '';

export async function submitMessage(question: string): Promise<ClientMessage> {
  const status = createStreamableUI('thread.init');
  const textStream = createStreamableValue('');
  const textUIStream = createStreamableUI(
    <Message textStream={textStream.value} />,
  );
  const gui = createStreamableUI();

  const runQueue = [];

  (async () => {
    if (THREAD_ID) {
      await openai.beta.threads.messages.create(THREAD_ID, {
        role: 'user',
        content: question,
      });

      const run = await openai.beta.threads.runs.create(THREAD_ID, {
        assistant_id: ASSISTANT_ID,
        stream: true,
      });

      runQueue.push({ id: generateId(), run });
    } else {
      const run = await openai.beta.threads.createAndRun({
        assistant_id: ASSISTANT_ID,
        stream: true,
        thread: {
          messages: [{ role: 'user', content: question }],
        },
      });

      runQueue.push({ id: generateId(), run });
    }

    while (runQueue.length > 0) {
      const latestRun = runQueue.shift();

      if (latestRun) {
        for await (const delta of latestRun.run) {
          const { data, event } = delta;

          status.update(event);

          if (event === 'thread.created') {
            THREAD_ID = data.id;
          } else if (event === 'thread.run.created') {
            RUN_ID = data.id;
          } else if (event === 'thread.message.delta') {
            data.delta.content?.map((part: any) => {
              if (part.type === 'text') {
                if (part.text) {
                  textStream.append(part.text.value);
                }
              }
            });
          } else if (event === 'thread.run.requires_action') {
            if (data.required_action) {
              if (data.required_action.type === 'submit_tool_outputs') {
                const { tool_calls } = data.required_action.submit_tool_outputs;
                const tool_outputs = [];

                for (const tool_call of tool_calls) {
                  const { id: toolCallId, function: fn } = tool_call;
                  const { name, arguments: args } = fn;

                  if (name === 'search_emails') {
                    const { query, has_attachments } = JSON.parse(args);

                    gui.append(
                      <div className="flex flex-row gap-2 items-center">
                        <div>
                          Searching for emails: {query}, has_attachments:
                          {has_attachments ? 'true' : 'false'}
                        </div>
                      </div>,
                    );

                    await new Promise(resolve => setTimeout(resolve, 2000));

                    const fakeEmails = searchEmails({ query, has_attachments });

                    gui.append(
                      <div className="flex flex-col gap-2">
                        {fakeEmails.map(email => (
                          <div
                            key={email.id}
                            className="p-2 bg-zinc-100 rounded-md flex flex-row gap-2 items-center justify-between"
                          >
                            <div className="flex flex-row gap-2 items-center">
                              <div>{email.subject}</div>
                            </div>
                            <div className="text-zinc-500">{email.date}</div>
                          </div>
                        ))}
                      </div>,
                    );

                    tool_outputs.push({
                      tool_call_id: toolCallId,
                      output: JSON.stringify(fakeEmails),
                    });
                  }
                }

                const nextRun: any =
                  await openai.beta.threads.runs.submitToolOutputs(
                    THREAD_ID,
                    RUN_ID,
                    {
                      tool_outputs,
                      stream: true,
                    },
                  );

                runQueue.push({ id: generateId(), run: nextRun });
              }
            }
          } else if (event === 'thread.run.failed') {
            console.log(data);
          }
        }
      }
    }

    status.done();
    textUIStream.done();
    gui.done();
  })();

  return {
    id: generateId(),
    status: status.value,
    text: textUIStream.value,
    gui: gui.value,
  };
}
```

```typescript filename='app/ai.ts'
import { createAI } from 'ai/rsc';
import { submitMessage } from './actions';

export const AI = createAI({
  actions: {
    submitMessage,
  },
  initialAIState: [],
  initialUIState: [],
});
```

And finally, make sure to update your layout component to wrap the children with the `AI` component.

```tsx filename="app/layout.tsx"
import { ReactNode } from 'react';
import { AI } from './ai';

export default function Layout({ children }: { children: ReactNode }) {
  return <AI>{children}</AI>;
}
```


================================================
File: content/cookbook/20-rsc/20-stream-text.mdx
================================================
---
title: Stream Text
description: Learn how to stream text using the AI SDK and React Server Components.
tags: ['rsc', 'streaming']
---

# Stream Text

<Note>
  This example uses React Server Components (RSC). If you want to client side
  rendering and hooks instead, check out the ["stream text" example with
  useCompletion](/examples/next-pages/basics/streaming-text-generation).
</Note>

Text generation can sometimes take a long time to complete, especially when you're generating a couple of paragraphs. In such cases, it is useful to stream the text generation process to the client in real-time. This allows the client to display the generated text as it is being generated, rather than have users wait for it to complete before displaying the result.

<Browser>
  <TextGeneration stream />
</Browser>

## Client

Let's create a simple React component that will call the `generate` function when a button is clicked. The `generate` function will call the `streamText` function, which will then generate text based on the input prompt. To consume the stream of text in the client, we will use the `readStreamableValue` function from the `ai/rsc` module.

```tsx filename="app/page.tsx"
'use client';

import { useState } from 'react';
import { generate } from './actions';
import { readStreamableValue } from 'ai/rsc';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [generation, setGeneration] = useState<string>('');

  return (
    <div>
      <button
        onClick={async () => {
          const { output } = await generate('Why is the sky blue?');

          for await (const delta of readStreamableValue(output)) {
            setGeneration(currentGeneration => `${currentGeneration}${delta}`);
          }
        }}
      >
        Ask
      </button>

      <div>{generation}</div>
    </div>
  );
}
```

## Server

On the server side, we need to implement the `generate` function, which will call the `streamText` function. The `streamText` function will generate text based on the input prompt. In order to stream the text generation to the client, we will use `createStreamableValue` that can wrap any changeable value and stream it to the client.

Using DevTools, we can see the text generation being streamed to the client in real-time.

```typescript filename='app/actions.ts'
'use server';

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';

export async function generate(input: string) {
  const stream = createStreamableValue('');

  (async () => {
    const { textStream } = streamText({
      model: openai('gpt-3.5-turbo'),
      prompt: input,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return { output: stream.value };
}
```


================================================
File: content/cookbook/20-rsc/21-stream-text-with-chat-prompt.mdx
================================================
---
title: Stream Text with Chat Prompt
description: Learn how to stream text with chat prompt using the AI SDK and React Server Components.
tags: ['rsc', 'chat']
---

# Stream Text with Chat Prompt

Chat completion can sometimes take a long time to finish, especially when the response is big. In such cases, it is useful to stream the chat completion to the client in real-time. This allows the client to display the new message as it is being generated by the model, rather than have users wait for it to finish.

<Browser>
  <ChatGeneration
    stream
    history={[
      { role: 'User', content: 'How is it going?' },
      { role: 'Assistant', content: 'All good, how may I help you?' },
    ]}
    inputMessage={{ role: 'User', content: 'Why is the sky blue?' }}
    outputMessage={{
      role: 'Assistant',
      content: 'The sky is blue because of rayleigh scattering.',
    }}
  />
</Browser>

## Client

Let's create a simple conversation between a user and a model, and place a button that will call `continueConversation`.

```tsx filename='app/page.tsx'
'use client';

import { useState } from 'react';
import { Message, continueConversation } from './actions';
import { readStreamableValue } from 'ai/rsc';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');

  return (
    <div>
      <div>
        {conversation.map((message, index) => (
          <div key={index}>
            {message.role}: {message.content}
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={input}
          onChange={event => {
            setInput(event.target.value);
          }}
        />
        <button
          onClick={async () => {
            const { messages, newMessage } = await continueConversation([
              ...conversation,
              { role: 'user', content: input },
            ]);

            let textContent = '';

            for await (const delta of readStreamableValue(newMessage)) {
              textContent = `${textContent}${delta}`;

              setConversation([
                ...messages,
                { role: 'assistant', content: textContent },
              ]);
            }
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
```

## Server

Now, let's implement the `continueConversation` function that will insert the user's message into the conversation and stream back the new message.

```typescript filename='app/actions.ts'
'use server';

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function continueConversation(history: Message[]) {
  'use server';

  const stream = createStreamableValue();

  (async () => {
    const { textStream } = streamText({
      model: openai('gpt-3.5-turbo'),
      system:
        "You are a dude that doesn't drop character until the DVD commentary.",
      messages: history,
    });

    for await (const text of textStream) {
      stream.update(text);
    }

    stream.done();
  })();

  return {
    messages: history,
    newMessage: stream.value,
  };
}
```


================================================
File: content/cookbook/20-rsc/30-generate-object.mdx
================================================
---
title: Generate Object
description: Learn how to generate object using the AI SDK and React Server Components.
tags: ['rsc', 'structured data']
---

# Generate Object

<Note>
  This example uses React Server Components (RSC). If you want to client side
  rendering and hooks instead, check out the ["generate object" example with
  useState](/examples/next-pages/basics/generating-object).
</Note>

Earlier functions like `generateText` and `streamText` gave us the ability to generate unstructured text. However, if you want to generate structured data like JSON, you can provide a schema that describes the structure of your desired object to the `generateObject` function.

The function requires you to provide a schema using [zod](https://zod.dev), a library for defining schemas for JavaScript objects. By using zod, you can also use it to validate the generated object and ensure that it conforms to the specified structure.

<Browser>
  <ObjectGeneration
    object={{
      notifications: [
        {
          name: 'Jamie Roberts',
          message: "Hey! How's the study grind going? Need a coffee boost?",
          minutesAgo: 15,
        },
        {
          name: 'Prof. Morgan',
          message:
            'Reminder: Your term paper is due promptly at 8 AM tomorrow. Please ensure it meets the submission guidelines outlined.',
          minutesAgo: 46,
        },
        {
          name: 'Alex Chen',
          message:
            "Dude, urgent! Borrow your notes for tomorrow's exam? I swear mine got eaten by my dog!",
          minutesAgo: 30,
        },
      ],
    }}
  />
</Browser>

## Client

Let's create a simple React component that will call the `getNotifications` function when a button is clicked. The function will generate a list of notifications as described in the schema.

```tsx filename='app/page.tsx'
'use client';

import { useState } from 'react';
import { getNotifications } from './actions';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [generation, setGeneration] = useState<string>('');

  return (
    <div>
      <button
        onClick={async () => {
          const { notifications } = await getNotifications(
            'Messages during finals week.',
          );

          setGeneration(JSON.stringify(notifications, null, 2));
        }}
      >
        View Notifications
      </button>

      <pre>{generation}</pre>
    </div>
  );
}
```

## Server

Now let's implement the `getNotifications` function. We'll use the `generateObject` function to generate the list of notifications based on the schema we defined earlier.

```typescript filename='app/actions.ts'
'use server';

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function getNotifications(input: string) {
  'use server';

  const { object: notifications } = await generateObject({
    model: openai('gpt-4-turbo'),
    system: 'You generate three notifications for a messages app.',
    prompt: input,
    schema: z.object({
      notifications: z.array(
        z.object({
          name: z.string().describe('Name of a fictional person.'),
          message: z.string().describe('Do not use emojis or links.'),
          minutesAgo: z.number(),
        }),
      ),
    }),
  });

  return { notifications };
}
```


================================================
File: content/cookbook/20-rsc/40-stream-object.mdx
================================================
---
title: Stream Object
description: Learn how to stream object using the AI SDK and React Server Components.
tags: ['rsc', 'streaming', 'structured data']
---

# Stream Object

<Note>
  This example uses React Server Components (RSC). If you want to client side
  rendering and hooks instead, check out the ["streaming object generation"
  example with
  useObject](/examples/next-pages/basics/streaming-object-generation).
</Note>

Object generation can sometimes take a long time to complete, especially when you're generating a large schema. In such cases, it is useful to stream the object generation process to the client in real-time. This allows the client to display the generated object as it is being generated, rather than have users wait for it to complete before displaying the result.

<Browser>
  <ObjectGeneration
    stream
    object={{
      notifications: [
        {
          name: 'Jamie Roberts',
          message: "Hey! How's the study grind going? Need a coffee boost?",
          minutesAgo: 15,
        },
        {
          name: 'Prof. Morgan',
          message:
            'Reminder: Your term paper is due promptly at 8 AM tomorrow. Please ensure it meets the submission guidelines outlined.',
          minutesAgo: 46,
        },
        {
          name: 'Alex Chen',
          message:
            "Dude, urgent! Borrow your notes for tomorrow's exam? I swear mine got eaten by my dog!",
          minutesAgo: 30,
        },
      ],
    }}
  />
</Browser>

## Client

Let's create a simple React component that will call the `getNotifications` function when a button is clicked. The function will generate a list of notifications as described in the schema.

```tsx filename='app/page.tsx'
'use client';

import { useState } from 'react';
import { generate } from './actions';
import { readStreamableValue } from 'ai/rsc';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [generation, setGeneration] = useState<string>('');

  return (
    <div>
      <button
        onClick={async () => {
          const { object } = await generate('Messages during finals week.');

          for await (const partialObject of readStreamableValue(object)) {
            if (partialObject) {
              setGeneration(
                JSON.stringify(partialObject.notifications, null, 2),
              );
            }
          }
        }}
      >
        Ask
      </button>

      <pre>{generation}</pre>
    </div>
  );
}
```

## Server

Now let's implement the `getNotifications` function. We'll use the `generateObject` function to generate the list of fictional notifications based on the schema we defined earlier.

```typescript filename='app/actions.ts'
'use server';

import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import { z } from 'zod';

export async function generate(input: string) {
  'use server';

  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = streamObject({
      model: openai('gpt-4-turbo'),
      system: 'You generate three notifications for a messages app.',
      prompt: input,
      schema: z.object({
        notifications: z.array(
          z.object({
            name: z.string().describe('Name of a fictional person.'),
            message: z.string().describe('Do not use emojis or links.'),
            minutesAgo: z.number(),
          }),
        ),
      }),
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { object: stream.value };
}
```


================================================
File: content/cookbook/20-rsc/50-call-tools.mdx
================================================
---
title: Call Tools
description: Learn how to call tools using the AI SDK and React Server Components.
tags: ['rsc', 'tool use']
---

# Call Tools

Some models allow developers to provide a list of tools that can be called at any time during a generation. This is useful for extending the capabilites of a language model to either use logic or data to interact with systems external to the model.

<Browser>
  <ChatGeneration
    history={[
      { role: 'User', content: 'How is it going?' },
      { role: 'Assistant', content: 'All good, how may I help you?' },
    ]}
    inputMessage={{
      role: 'User',
      content: 'What is 24 celsius in fahrenheit?',
    }}
    outputMessage={{
      role: 'Assistant',
      content: '24°C is 75.20°F',
    }}
  />
</Browser>

## Client

Let's create a simple conversation between a user and model and place a button that will call `continueConversation`.

```tsx filename='app/page.tsx'
'use client';

import { useState } from 'react';
import { Message, continueConversation } from './actions';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');

  return (
    <div>
      <div>
        {conversation.map((message, index) => (
          <div key={index}>
            {message.role}: {message.content}
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={input}
          onChange={event => {
            setInput(event.target.value);
          }}
        />
        <button
          onClick={async () => {
            const { messages } = await continueConversation([
              ...conversation,
              { role: 'user', content: input },
            ]);

            setConversation(messages);
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
```

## Server

Now, let's implement the `continueConversation` action that uses `generateText` to generate a response to the user's question. We will use the [`tools`](/docs/reference/ai-sdk-core/generate-text#tools) parameter to specify our own function called `celsiusToFahrenheit` that will convert a user given value in celsius to fahrenheit.

We will use zod to specify the schema for the `celsiusToFahrenheit` function's parameters.

```tsx filename='app/actions.ts'
'use server';

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function continueConversation(history: Message[]) {
  'use server';

  const { text, toolResults } = await generateText({
    model: openai('gpt-3.5-turbo'),
    system: 'You are a friendly assistant!',
    messages: history,
    tools: {
      celsiusToFahrenheit: {
        description: 'Converts celsius to fahrenheit',
        parameters: z.object({
          value: z.string().describe('The value in celsius'),
        }),
        execute: async ({ value }) => {
          const celsius = parseFloat(value);
          const fahrenheit = celsius * (9 / 5) + 32;
          return `${celsius}°C is ${fahrenheit.toFixed(2)}°F`;
        },
      },
    },
  });

  return {
    messages: [
      ...history,
      {
        role: 'assistant' as const,
        content:
          text || toolResults.map(toolResult => toolResult.result).join('\n'),
      },
    ],
  };
}
```


================================================
File: content/cookbook/20-rsc/51-call-tools-in-parallel.mdx
================================================
---
title: Call Tools in Parallel
description: Learn how to tools in parallel text using the AI SDK and React Server Components.
tags: ['rsc', 'tool use']
---

# Call Tools in Parallel

Some language models support calling tools in parallel. This is particularly useful when multiple tools are independent of each other and can be executed in parallel during the same generation step.

<Browser>
  <ChatGeneration
    history={[
      { role: 'User', content: 'How is it going?' },
      { role: 'Assistant', content: 'All good, how may I help you?' },
    ]}
    inputMessage={{
      role: 'User',
      content: 'What is the weather in Paris and New York?',
    }}
    outputMessage={{
      role: 'Assistant',
      content:
        'The weather is 24°C in New York and 25°C in Paris. It is sunny in both cities.',
    }}
  />
</Browser>

## Client

Let's modify our previous example to call `getWeather` tool for multiple cities in parallel.

```tsx filename='app/page.tsx'
'use client';

import { useState } from 'react';
import { Message, continueConversation } from './actions';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');

  return (
    <div>
      <div>
        {conversation.map((message, index) => (
          <div key={index}>
            {message.role}: {message.content}
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={input}
          onChange={event => {
            setInput(event.target.value);
          }}
        />
        <button
          onClick={async () => {
            const { messages } = await continueConversation([
              ...conversation,
              { role: 'user', content: input },
            ]);

            setConversation(messages);
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
```

## Server

Let's update the tools object to now use the `getWeather` function instead.

```ts filename='app/actions.ts'
'use server';

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function getWeather({ city, unit }) {
  // This function would normally make an
  // API request to get the weather.

  return { value: 25, description: 'Sunny' };
}

export async function continueConversation(history: Message[]) {
  'use server';

  const { text, toolResults } = await generateText({
    model: openai('gpt-3.5-turbo'),
    system: 'You are a friendly weather assistant!',
    messages: history,
    tools: {
      getWeather: {
        description: 'Get the weather for a location',
        parameters: z.object({
          city: z.string().describe('The city to get the weather for'),
          unit: z
            .enum(['C', 'F'])
            .describe('The unit to display the temperature in'),
        }),
        execute: async ({ city, unit }) => {
          const weather = getWeather({ city, unit });
          return `It is currently ${weather.value}°${unit} and ${weather.description} in ${city}!`;
        },
      },
    },
  });

  return {
    messages: [
      ...history,
      {
        role: 'assistant' as const,
        content:
          text || toolResults.map(toolResult => toolResult.result).join('\n'),
      },
    ],
  };
}
```


================================================
File: content/cookbook/20-rsc/60-save-messages-to-database.mdx
================================================
---
title: Save Messages To Database
description: Learn how to save messages to an external database using the AI SDK and React Server Components
tags: ['rsc', 'tool use']
---

# Save Messages To Database

Sometimes conversations with language models can get interesting and you might want to save the state of so you can revisit it or continue the conversation later.

`createAI` has an experimental callback function called `onSetAIState` that gets called whenever the AI state changes. You can use this to save the AI state to a file or a database.

## Client

```tsx filename='app/layout.tsx'
import { ServerMessage } from './actions';
import { AI } from './ai';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // get chat history from database
  const history: ServerMessage[] = getChat();

  return (
    <html lang="en">
      <body>
        <AI initialAIState={history} initialUIState={[]}>
          {children}
        </AI>
      </body>
    </html>
  );
}
```

```tsx filename='app/page.tsx'
'use client';

import { useState } from 'react';
import { ClientMessage } from './actions';
import { useActions, useUIState } from 'ai/rsc';
import { generateId } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [input, setInput] = useState<string>('');
  const [conversation, setConversation] = useUIState();
  const { continueConversation } = useActions();

  return (
    <div>
      <div>
        {conversation.map((message: ClientMessage) => (
          <div key={message.id}>
            {message.role}: {message.display}
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={input}
          onChange={event => {
            setInput(event.target.value);
          }}
        />
        <button
          onClick={async () => {
            setConversation((currentConversation: ClientMessage[]) => [
              ...currentConversation,
              { id: generateId(), role: 'user', display: input },
            ]);

            const message = await continueConversation(input);

            setConversation((currentConversation: ClientMessage[]) => [
              ...currentConversation,
              message,
            ]);
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
```

## Server

We will use the callback function to listen to state changes and save the conversation once we receive a `done` event.

```tsx filename='app/actions.tsx'
'use server';

import { getAIState, getMutableAIState, streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';
import { ReactNode } from 'react';
import { z } from 'zod';
import { generateId } from 'ai';
import { Stock } from '@ai-studio/components/stock';

export interface ServerMessage {
  role: 'user' | 'assistant' | 'function';
  content: string;
}

export interface ClientMessage {
  id: string;
  role: 'user' | 'assistant' | 'function';
  display: ReactNode;
}

export async function continueConversation(
  input: string,
): Promise<ClientMessage> {
  'use server';

  const history = getMutableAIState();

  const result = await streamUI({
    model: openai('gpt-3.5-turbo'),
    messages: [...history.get(), { role: 'user', content: input }],
    text: ({ content, done }) => {
      if (done) {
        history.done([
          ...history.get(),
          { role: 'user', content: input },
          { role: 'assistant', content },
        ]);
      }

      return <div>{content}</div>;
    },
    tools: {
      showStockInformation: {
        description:
          'Get stock information for symbol for the last numOfMonths months',
        parameters: z.object({
          symbol: z
            .string()
            .describe('The stock symbol to get information for'),
          numOfMonths: z
            .number()
            .describe('The number of months to get historical information for'),
        }),
        generate: async ({ symbol, numOfMonths }) => {
          history.done([
            ...history.get(),
            {
              role: 'function',
              name: 'showStockInformation',
              content: JSON.stringify({ symbol, numOfMonths }),
            },
          ]);

          return <Stock symbol={symbol} numOfMonths={numOfMonths} />;
        },
      },
    },
  });

  return {
    id: generateId(),
    role: 'assistant',
    display: result.value,
  };
}
```

```ts filename='app/ai.ts'
import { createAI } from 'ai/rsc';
import { ServerMessage, ClientMessage, continueConversation } from './actions';

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  onSetAIState: async ({ state, done }) => {
    'use server';

    if (done) {
      saveChat(state);
    }
  },
  onGetUIState: async () => {
    'use server';

    const history: ServerMessage[] = getAIState();

    return history.map(({ role, content }) => ({
      id: generateId(),
      role,
      display:
        role === 'function' ? <Stock {...JSON.parse(content)} /> : content,
    }));
  },
});
```


================================================
File: content/cookbook/20-rsc/61-restore-messages-from-database.mdx
================================================
---
title: Restore Messages From Database
description: Learn how to restore messages from an external database using the AI SDK and React Server Components
tags: ['rsc', 'tool use']
---

# Restore Messages from Database

When building AI applications, you might want to restore previous conversations from a database to allow users to continue their conversations or review past interactions. The AI SDK provides mechanisms to restore conversation state through `initialAIState` and `onGetUIState`.

## Client

```tsx filename='app/layout.tsx'
import { ServerMessage } from './actions';
import { AI } from './ai';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch stored messages from your database
  const savedMessages: ServerMessage[] = getSavedMessages();

  return (
    <html lang="en">
      <body>
        <AI initialAIState={savedMessages} initialUIState={[]}>
          {children}
        </AI>
      </body>
    </html>
  );
}
```

```tsx filename='app/page.tsx'
'use client';

import { useState, useEffect } from 'react';
import { ClientMessage } from './actions';
import { useActions, useUIState } from 'ai/rsc';
import { generateId } from 'ai';

export default function Home() {
  const [conversation, setConversation] = useUIState();
  const [input, setInput] = useState<string>('');
  const { continueConversation } = useActions();

  return (
    <div>
      <div className="conversation-history">
        {conversation.map((message: ClientMessage) => (
          <div key={message.id} className={`message ${message.role}`}>
            {message.role}: {message.display}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          onClick={async () => {
            // Add user message to UI
            setConversation((currentConversation: ClientMessage[]) => [
              ...currentConversation,
              { id: generateId(), role: 'user', display: input },
            ]);

            // Get AI response
            const message = await continueConversation(input);

            // Add AI response to UI
            setConversation((currentConversation: ClientMessage[]) => [
              ...currentConversation,
              message,
            ]);

            setInput('');
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

## Server

The server-side implementation handles the restoration of messages and their transformation into the appropriate format for display.

```tsx filename='app/ai.ts'
import { createAI } from 'ai/rsc';
import { ServerMessage, ClientMessage, continueConversation } from './actions';
import { Stock } from '@ai-studio/components/stock';
import { generateId } from 'ai';

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  onGetUIState: async () => {
    'use server';

    // Get the current AI state (stored messages)
    const history: ServerMessage[] = getAIState();

    // Transform server messages into client messages
    return history.map(({ role, content }) => ({
      id: generateId(),
      role,
      display:
        role === 'function' ? <Stock {...JSON.parse(content)} /> : content,
    }));
  },
});
```

```tsx filename='app/actions.tsx'
'use server';

import { getAIState } from 'ai/rsc';

export interface ServerMessage {
  role: 'user' | 'assistant' | 'function';
  content: string;
}

export interface ClientMessage {
  id: string;
  role: 'user' | 'assistant' | 'function';
  display: ReactNode;
}

// Function to get saved messages from database
export async function getSavedMessages(): Promise<ServerMessage[]> {
  'use server';

  // Implement your database fetching logic here
  return await fetchMessagesFromDatabase();
}
```


================================================
File: content/cookbook/20-rsc/90-render-visual-interface-in-chat.mdx
================================================
---
title: Render Visual Interface in Chat
description: Learn how to generate text using the AI SDK and React Server Components.
tags: ['rsc', 'generative user interface']
---

# Render Visual Interface in Chat

We've now seen how a language model can call a function and render a component based on a conversation with the user.

When we define multiple functions in [`tools`](/docs/reference/ai-sdk-core/generate-text#tools), it is possible for the model to reason out the right functions to call based on whatever the user's intent is. This means that you can write a bunch of functions without the burden of implementing complex routing logic to run them.

## Client

```tsx filename='app/page.tsx'
'use client';

import { useState } from 'react';
import { ClientMessage } from './actions';
import { useActions, useUIState } from 'ai/rsc';
import { generateId } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [input, setInput] = useState<string>('');
  const [conversation, setConversation] = useUIState();
  const { continueConversation } = useActions();

  return (
    <div>
      <div>
        {conversation.map((message: ClientMessage) => (
          <div key={message.id}>
            {message.role}: {message.display}
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={input}
          onChange={event => {
            setInput(event.target.value);
          }}
        />
        <button
          onClick={async () => {
            setConversation((currentConversation: ClientMessage[]) => [
              ...currentConversation,
              { id: generateId(), role: 'user', display: input },
            ]);

            const message = await continueConversation(input);

            setConversation((currentConversation: ClientMessage[]) => [
              ...currentConversation,
              message,
            ]);
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
```

```tsx filename='components/stock.tsx'
export async function Stock({ symbol, numOfMonths }) {
  const data = await fetch(
    `https://api.example.com/stock/${symbol}/${numOfMonths}`,
  );

  return (
    <div>
      <div>{symbol}</div>

      <div>
        {data.timeline.map(data => (
          <div>
            <div>{data.date}</div>
            <div>{data.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

```tsx filename='components/flight.tsx'
export async function Flight({ flightNumber }) {
  const data = await fetch(`https://api.example.com/flight/${flightNumber}`);

  return (
    <div>
      <div>{flightNumber}</div>
      <div>{data.status}</div>
      <div>{data.source}</div>
      <div>{data.destination}</div>
    </div>
  );
}
```

## Server

```tsx filename='app/actions.tsx'
'use server';

import { getMutableAIState, streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';
import { ReactNode } from 'react';
import { z } from 'zod';
import { generateId } from 'ai';
import { Stock } from '@/components/stock';
import { Flight } from '@/components/flight';

export interface ServerMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClientMessage {
  id: string;
  role: 'user' | 'assistant';
  display: ReactNode;
}

export async function continueConversation(
  input: string,
): Promise<ClientMessage> {
  'use server';

  const history = getMutableAIState();

  const result = await streamUI({
    model: openai('gpt-3.5-turbo'),
    messages: [...history.get(), { role: 'user', content: input }],
    text: ({ content, done }) => {
      if (done) {
        history.done((messages: ServerMessage[]) => [
          ...messages,
          { role: 'assistant', content },
        ]);
      }

      return <div>{content}</div>;
    },
    tools: {
      showStockInformation: {
        description:
          'Get stock information for symbol for the last numOfMonths months',
        parameters: z.object({
          symbol: z
            .string()
            .describe('The stock symbol to get information for'),
          numOfMonths: z
            .number()
            .describe('The number of months to get historical information for'),
        }),
        generate: async ({ symbol, numOfMonths }) => {
          history.done((messages: ServerMessage[]) => [
            ...messages,
            {
              role: 'assistant',
              content: `Showing stock information for ${symbol}`,
            },
          ]);

          return <Stock symbol={symbol} numOfMonths={numOfMonths} />;
        },
      },
      showFlightStatus: {
        description: 'Get the status of a flight',
        parameters: z.object({
          flightNumber: z
            .string()
            .describe('The flight number to get status for'),
        }),
        generate: async ({ flightNumber }) => {
          history.done((messages: ServerMessage[]) => [
            ...messages,
            {
              role: 'assistant',
              content: `Showing flight status for ${flightNumber}`,
            },
          ]);

          return <Flight flightNumber={flightNumber} />;
        },
      },
    },
  });

  return {
    id: generateId(),
    role: 'assistant',
    display: result.value,
  };
}
```

```typescript filename='app/ai.ts'
import { createAI } from 'ai/rsc';
import { ServerMessage, ClientMessage, continueConversation } from './actions';

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});
```


================================================
File: content/cookbook/20-rsc/91-stream-updates-to-visual-interfaces.mdx
================================================
---
title: Stream Updates to Visual Interfaces
description: Learn how to generate text using the AI SDK and React Server Components.
tags: ['rsc', 'streaming', 'generative user interface']
---

# Stream Updates to Visual Interfaces

In our previous example we've been streaming react components from the server to the client. By streaming the components, we open up the possibility to update these components based on state changes that occur in the server.

## Client

```tsx filename='app/page.tsx'
'use client';

import { useState } from 'react';
import { ClientMessage } from './actions';
import { useActions, useUIState } from 'ai/rsc';
import { generateId } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [input, setInput] = useState<string>('');
  const [conversation, setConversation] = useUIState();
  const { continueConversation } = useActions();

  return (
    <div>
      <div>
        {conversation.map((message: ClientMessage) => (
          <div key={message.id}>
            {message.role}: {message.display}
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={input}
          onChange={event => {
            setInput(event.target.value);
          }}
        />
        <button
          onClick={async () => {
            setConversation((currentConversation: ClientMessage[]) => [
              ...currentConversation,
              { id: generateId(), role: 'user', display: input },
            ]);

            const message = await continueConversation(input);

            setConversation((currentConversation: ClientMessage[]) => [
              ...currentConversation,
              message,
            ]);
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
```

## Server

```tsx filename='app/actions.tsx'
'use server';

import { getMutableAIState, streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';
import { ReactNode } from 'react';
import { z } from 'zod';
import { generateId } from 'ai';

export interface ServerMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClientMessage {
  id: string;
  role: 'user' | 'assistant';
  display: ReactNode;
}

export async function continueConversation(
  input: string,
): Promise<ClientMessage> {
  'use server';

  const history = getMutableAIState();

  const result = await streamUI({
    model: openai('gpt-3.5-turbo'),
    messages: [...history.get(), { role: 'user', content: input }],
    text: ({ content, done }) => {
      if (done) {
        history.done((messages: ServerMessage[]) => [
          ...messages,
          { role: 'assistant', content },
        ]);
      }

      return <div>{content}</div>;
    },
    tools: {
      deploy: {
        description: 'Deploy repository to vercel',
        parameters: z.object({
          repositoryName: z
            .string()
            .describe('The name of the repository, example: vercel/ai-chatbot'),
        }),
        generate: async function* ({ repositoryName }) {
          yield <div>Cloning repository {repositoryName}...</div>; // [!code highlight:5]
          await new Promise(resolve => setTimeout(resolve, 3000));
          yield <div>Building repository {repositoryName}...</div>;
          await new Promise(resolve => setTimeout(resolve, 2000));
          return <div>{repositoryName} deployed!</div>;
        },
      },
    },
  });

  return {
    id: generateId(),
    role: 'assistant',
    display: result.value,
  };
}
```

```typescript filename='app/ai.ts'
import { createAI } from 'ai/rsc';
import { ServerMessage, ClientMessage, continueConversation } from './actions';

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});
```


================================================
File: content/cookbook/20-rsc/92-stream-ui-record-token-usage.mdx
================================================
---
title: Record Token Usage after Streaming User Interfaces
description: Learn how to record token usage after streaming user interfaces using the AI SDK and React Server Components
tags: ['rsc', 'usage']
---

# Record Token Usage after Streaming User Interfaces

When you're streaming structured data with [`streamUI`](/docs/reference/ai-sdk-rsc/stream-ui),
you may want to record the token usage for billing purposes.

## `onFinish` Callback

You can use the `onFinish` callback to record token usage.
It is called when the stream is finished.

```tsx filename='app/page.tsx'
'use client';

import { useState } from 'react';
import { ClientMessage } from './actions';
import { useActions, useUIState } from 'ai/rsc';
import { generateId } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [input, setInput] = useState<string>('');
  const [conversation, setConversation] = useUIState();
  const { continueConversation } = useActions();

  return (
    <div>
      <div>
        {conversation.map((message: ClientMessage) => (
          <div key={message.id}>
            {message.role}: {message.display}
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={input}
          onChange={event => {
            setInput(event.target.value);
          }}
        />
        <button
          onClick={async () => {
            setConversation((currentConversation: ClientMessage[]) => [
              ...currentConversation,
              { id: generateId(), role: 'user', display: input },
            ]);

            const message = await continueConversation(input);

            setConversation((currentConversation: ClientMessage[]) => [
              ...currentConversation,
              message,
            ]);
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
```

## Server

```tsx filename='app/actions.tsx' highlight={"57-63"}
'use server';

import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';
import { ReactNode } from 'react';
import { z } from 'zod';
import { generateId } from 'ai';

export interface ServerMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClientMessage {
  id: string;
  role: 'user' | 'assistant';
  display: ReactNode;
}

export async function continueConversation(
  input: string,
): Promise<ClientMessage> {
  'use server';

  const history = getMutableAIState();

  const result = await streamUI({
    model: openai('gpt-3.5-turbo'),
    messages: [...history.get(), { role: 'user', content: input }],
    text: ({ content, done }) => {
      if (done) {
        history.done((messages: ServerMessage[]) => [
          ...messages,
          { role: 'assistant', content },
        ]);
      }

      return <div>{content}</div>;
    },
    tools: {
      deploy: {
        description: 'Deploy repository to vercel',
        parameters: z.object({
          repositoryName: z
            .string()
            .describe('The name of the repository, example: vercel/ai-chatbot'),
        }),
        generate: async function* ({ repositoryName }) {
          yield <div>Cloning repository {repositoryName}...</div>; // [!code highlight:5]
          await new Promise(resolve => setTimeout(resolve, 3000));
          yield <div>Building repository {repositoryName}...</div>;
          await new Promise(resolve => setTimeout(resolve, 2000));
          return <div>{repositoryName} deployed!</div>;
        },
      },
    },
    onFinish: ({ usage }) => {
      const { promptTokens, completionTokens, totalTokens } = usage;
      // your own logic, e.g. for saving the chat history or recording usage
      console.log('Prompt tokens:', promptTokens);
      console.log('Completion tokens:', completionTokens);
      console.log('Total tokens:', totalTokens);
    },
  });

  return {
    id: generateId(),
    role: 'assistant',
    display: result.value,
  };
}
```

```typescript filename='app/ai.ts'
import { createAI } from 'ai/rsc';
import { ServerMessage, ClientMessage, continueConversation } from './actions';

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});
```


================================================
File: content/cookbook/20-rsc/index.mdx
================================================
---
title: React Server Components
collapsed: true
---


================================================
File: content/docs/01-introduction/index.mdx
================================================
---
title: AI SDK by Vercel
description: The AI SDK is the TypeScript toolkit for building AI applications and agents with React, Next.js, Vue, Svelte, Node.js, and more.
---

# AI SDK

The AI SDK is the TypeScript toolkit designed to help developers build AI-powered applications and agents with React, Next.js, Vue, Svelte, Node.js, and more.

## Why use the AI SDK?

Integrating large language models (LLMs) into applications is complicated and heavily dependent on the specific model provider you use.

- **[AI SDK Core](/docs/ai-sdk-core):** A unified API for generating text, structured objects, tool calls, and building agents with LLMs.
- **[AI SDK UI](/docs/ai-sdk-ui):** A set of framework-agnostic hooks for quickly building chat and generative user interface.

## Model Providers

The AI SDK supports [multiple model providers](/providers).

<OfficialModelCards />

## Templates

We've built some [templates](https://vercel.com/templates?type=ai) that include AI SDK integrations for different use cases, providers, and frameworks. You can use these templates to get started with your AI-powered application.

### Starter Kits

<Templates type="starter-kits" />

### Feature Exploration

<Templates type="feature-exploration" />

### Frameworks

<Templates type="frameworks" />

### Generative UI

<Templates type="generative-ui" />

### Security

<Templates type="security" />

## Join our Community

If you have questions about anything related to the AI SDK, you're always welcome to ask our community on [GitHub Discussions](https://github.com/vercel/ai/discussions).

## `llms.txt`

You can access the entire AI SDK documentation in Markdown format at [sdk.vercel.ai/llms.txt](/llms.txt). This can be used to ask any LLM (assuming it has a big enough context window) questions about the AI SDK based on the most up-to-date documentation.

### Example Usage

For instance, to prompt an LLM with questions about the AI SDK:

1. Copy the documentation contents from [sdk.vercel.ai/llms.txt](/llms.txt)
2. Use the following prompt format:

```prompt
Documentation:
{paste documentation here}
---
Based on the above documentation, answer the following:
{your question}
```


================================================
File: content/docs/02-foundations/01-overview.mdx
================================================
---
title: Overview
description: An overview of foundational concepts critical to understanding the AI SDK
---

# Overview

<Note>
  This page is a beginner-friendly introduction to high-level artificial
  intelligence (AI) concepts. To dive right into implementing the AI SDK, feel
  free to skip ahead to our [quickstarts](/docs/getting-started) or learn about
  our [supported models and providers](/docs/foundations/providers-and-models).
</Note>

The AI SDK standardizes integrating artificial intelligence (AI) models across [supported providers](/docs/foundations/providers-and-models). This enables developers to focus on building great AI applications, not waste time on technical details.

For example, here’s how you can generate text with various models using the AI SDK:

<PreviewSwitchProviders />

To effectively leverage the AI SDK, it helps to familiarize yourself with the following concepts:

## Generative Artificial Intelligence

**Generative artificial intelligence** refers to models that predict and generate various types of outputs (such as text, images, or audio) based on what’s statistically likely, pulling from patterns they’ve learned from their training data. For example:

- Given a photo, a generative model can generate a caption.
- Given an audio file, a generative model can generate a transcription.
- Given a text description, a generative model can generate an image.

## Large Language Models

A **large language model (LLM)** is a subset of generative models focused primarily on **text**. An LLM takes a sequence of words as input and aims to predict the most likely sequence to follow. It assigns probabilities to potential next sequences and then selects one. The model continues to generate sequences until it meets a specified stopping criterion.

LLMs learn by training on massive collections of written text, which means they will be better suited to some use cases than others. For example, a model trained on GitHub data would understand the probabilities of sequences in source code particularly well.

However, it's crucial to understand LLMs' limitations. When asked about less known or absent information, like the birthday of a personal relative, LLMs might "hallucinate" or make up information. It's essential to consider how well-represented the information you need is in the model.

## Embedding Models

An **embedding model** is used to convert complex data (like words or images) into a dense vector (a list of numbers) representation, known as an embedding. Unlike generative models, embedding models do not generate new text or data. Instead, they provide representations of semantic and syntactic relationships between entities that can be used as input for other models or other natural language processing tasks.

In the next section, you will learn about the difference between models providers and models, and which ones are available in the AI SDK.


================================================
File: content/docs/02-foundations/02-providers-and-models.mdx
================================================
---
title: Providers and Models
description: Learn about the providers and models available in the AI SDK.
---

# Providers and Models

Companies such as OpenAI and Anthropic (providers) offer access to a range of large language models (LLMs) with differing strengths and capabilities through their own APIs.

Each provider typically has its own unique method for interfacing with their models, complicating the process of switching providers and increasing the risk of vendor lock-in.

To solve these challenges, AI SDK Core offers a standardized approach to interacting with LLMs through a [language model specification](https://github.com/vercel/ai/tree/main/packages/provider/src/language-model/v1) that abstracts differences between providers. This unified interface allows you to switch between providers with ease while using the same API for all providers.

Here is an overview of the AI SDK Provider Architecture:

<MDXImage
  srcLight="/images/ai-sdk-diagram.png"
  srcDark="/images/ai-sdk-diagram-dark.png"
  width={800}
  height={800}
/>

## AI SDK Providers

The AI SDK comes with a wide range of providers that you can use to interact with different language models:

- [OpenAI Provider](/providers/ai-sdk-providers/openai) (`@ai-sdk/openai`)
- [Azure OpenAI Provider](/providers/ai-sdk-providers/azure) (`@ai-sdk/azure`)
- [Anthropic Provider](/providers/ai-sdk-providers/anthropic) (`@ai-sdk/anthropic`)
- [Amazon Bedrock Provider](/providers/ai-sdk-providers/amazon-bedrock) (`@ai-sdk/amazon-bedrock`)
- [Google Generative AI Provider](/providers/ai-sdk-providers/google-generative-ai) (`@ai-sdk/google`)
- [Google Vertex Provider](/providers/ai-sdk-providers/google-vertex) (`@ai-sdk/google-vertex`)
- [Mistral Provider](/providers/ai-sdk-providers/mistral) (`@ai-sdk/mistral`)
- [xAI Grok Provider](/providers/ai-sdk-providers/xai) (`@ai-sdk/xai`)
- [Together.ai Provider](/providers/ai-sdk-providers/togetherai) (`@ai-sdk/togetherai`)
- [Cohere Provider](/providers/ai-sdk-providers/cohere) (`@ai-sdk/cohere`)
- [Fireworks Provider](/providers/ai-sdk-providers/fireworks) (`@ai-sdk/fireworks`)
- [DeepInfra Provider](/providers/ai-sdk-providers/deepinfra) (`@ai-sdk/deepinfra`)
- [DeepSeek Provider](/providers/ai-sdk-providers/deepseek) (`@ai-sdk/deepseek`)
- [Cerebras Provider](/providers/ai-sdk-providers/cerebras) (`@ai-sdk/cerebras`)
- [Groq Provider](/providers/ai-sdk-providers/groq) (`@ai-sdk/groq`)
- [Perplexity Provider](/providers/ai-sdk-providers/perplexity) (`@ai-sdk/perplexity`)

You can also use the [OpenAI Compatible provider](/providers/openai-compatible-providers) with OpenAI-compatible APIs:

- [LM Studio](/providers/openai-compatible-providers/lmstudio)
- [Baseten](/providers/openai-compatible-providers/baseten)

Our [language model specification](https://github.com/vercel/ai/tree/main/packages/provider/src/language-model/v1) is published as an open-source package, which you can use to create [custom providers](/providers/community-providers/custom-providers).

The open-source community has created the following providers:

- [Ollama Provider](/providers/community-providers/ollama) (`ollama-ai-provider`)
- [ChromeAI Provider](/providers/community-providers/chrome-ai) (`chrome-ai`)
- [FriendliAI Provider](/providers/community-providers/friendliai) (`@friendliai/ai-provider`)
- [Portkey Provider](/providers/community-providers/portkey) (`@portkey-ai/vercel-provider`)
- [Cloudflare Workers AI Provider](/providers/community-providers/cloudflare-workers-ai) (`workers-ai-provider`)
- [OpenRouter Provider](/providers/community-providers/openrouter) (`@openrouter/ai-sdk-provider`)
- [Crosshatch Provider](/providers/community-providers/crosshatch) (`@crosshatch/ai-provider`)
- [Mixedbread Provider](/providers/community-providers/mixedbread) (`mixedbread-ai-provider`)
- [Voyage AI Provider](/providers/community-providers/voyage-ai) (`voyage-ai-provider`)
- [Mem0 Provider](/providers/community-providers/mem0)(`@mem0/vercel-ai-provider`)
- [Spark Provider](/providers/community-providers/spark) (`spark-ai-provider`)
- [AnthropicVertex Provider](/providers/community-providers/anthropic-vertex-ai) (`anthropic-vertex-ai`)

## Self-Hosted Models

You can access self-hosted models with the following providers:

- [Ollama Provider](/providers/community-providers/ollama)
- [LM Studio](/providers/openai-compatible-providers/lmstudio)
- [Baseten](/providers/openai-compatible-providers/baseten)

Additionally, any self-hosted provider that supports the OpenAI specification can be used with the [ OpenAI Compatible Provider ](/providers/openai-compatible-providers).

## Model Capabilities

The AI providers support different language models with various capabilities.
Here are the capabilities of popular models:

| Provider                                                                 | Model                        | Image Input         | Object Generation   | Tool Usage          | Tool Streaming      |
| ------------------------------------------------------------------------ | ---------------------------- | ------------------- | ------------------- | ------------------- | ------------------- |
| [OpenAI](/providers/ai-sdk-providers/openai)                             | `gpt-4o`                     | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [OpenAI](/providers/ai-sdk-providers/openai)                             | `gpt-4o-mini`                | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [OpenAI](/providers/ai-sdk-providers/openai)                             | `gpt-4-turbo`                | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [OpenAI](/providers/ai-sdk-providers/openai)                             | `gpt-4`                      | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [OpenAI](/providers/ai-sdk-providers/openai)                             | `o3-mini`                    | <Cross size={18} /> | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [OpenAI](/providers/ai-sdk-providers/openai)                             | `o1`                         | <Check size={18} /> | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [OpenAI](/providers/ai-sdk-providers/openai)                             | `o1-mini`                    | <Check size={18} /> | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [OpenAI](/providers/ai-sdk-providers/openai)                             | `o1-preview`                 | <Cross size={18} /> | <Cross size={18} /> | <Cross size={18} /> | <Cross size={18} /> |
| [Anthropic](/providers/ai-sdk-providers/anthropic)                       | `claude-3-7-sonnet-20250219` | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [Anthropic](/providers/ai-sdk-providers/anthropic)                       | `claude-3-5-sonnet-20241022` | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [Anthropic](/providers/ai-sdk-providers/anthropic)                       | `claude-3-5-sonnet-20240620` | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [Anthropic](/providers/ai-sdk-providers/anthropic)                       | `claude-3-5-haiku-20241022`  | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [Mistral](/providers/ai-sdk-providers/mistral)                           | `pixtral-large-latest`       | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [Mistral](/providers/ai-sdk-providers/mistral)                           | `mistral-large-latest`       | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [Mistral](/providers/ai-sdk-providers/mistral)                           | `mistral-small-latest`       | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [Mistral](/providers/ai-sdk-providers/mistral)                           | `pixtral-12b-2409`           | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [Google Generative AI](/providers/ai-sdk-providers/google-generative-ai) | `gemini-2.0-flash-exp`       | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [Google Generative AI](/providers/ai-sdk-providers/google-generative-ai) | `gemini-1.5-flash`           | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [Google Generative AI](/providers/ai-sdk-providers/google-generative-ai) | `gemini-1.5-pro`             | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [Google Vertex](/providers/ai-sdk-providers/google-vertex)               | `gemini-2.0-flash-exp`       | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [Google Vertex](/providers/ai-sdk-providers/google-vertex)               | `gemini-1.5-flash`           | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [Google Vertex](/providers/ai-sdk-providers/google-vertex)               | `gemini-1.5-pro`             | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [xAI Grok](/providers/ai-sdk-providers/xai)                              | `grok-2-1212`                | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [xAI Grok](/providers/ai-sdk-providers/xai)                              | `grok-2-vision-1212`         | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [xAI Grok](/providers/ai-sdk-providers/xai)                              | `grok-beta`                  | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [xAI Grok](/providers/ai-sdk-providers/xai)                              | `grok-vision-beta`           | <Check size={18} /> | <Cross size={18} /> | <Cross size={18} /> | <Cross size={18} /> |
| [DeepSeek](/providers/ai-sdk-providers/deepseek)                         | `deepseek-chat`              | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [DeepSeek](/providers/ai-sdk-providers/deepseek)                         | `deepseek-reasoner`          | <Cross size={18} /> | <Cross size={18} /> | <Cross size={18} /> | <Cross size={18} /> |
| [Cerebras](/providers/ai-sdk-providers/cerebras)                         | `llama3.1-8b`                | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [Cerebras](/providers/ai-sdk-providers/cerebras)                         | `llama3.1-70b`               | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [Cerebras](/providers/ai-sdk-providers/cerebras)                         | `llama3.3-70b`               | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [Groq](/providers/ai-sdk-providers/groq)                                 | `llama-3.3-70b-versatile`    | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [Groq](/providers/ai-sdk-providers/groq)                                 | `llama-3.1-8b-instant`       | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [Groq](/providers/ai-sdk-providers/groq)                                 | `mixtral-8x7b-32768`         | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| [Groq](/providers/ai-sdk-providers/groq)                                 | `gemma2-9b-it`               | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |

<Note>
  This table is not exhaustive. Additional models can be found in the provider
  documentation pages and on the provider websites.
</Note>


================================================
File: content/docs/02-foundations/03-prompts.mdx
================================================
---
title: Prompts
description: Learn about the Prompt structure used in the AI SDK.
---

# Prompts

Prompts are instructions that you give a [large language model (LLM)](/docs/foundations/overview#large-language-models) to tell it what to do.
It's like when you ask someone for directions; the clearer your question, the better the directions you'll get.

Many LLM providers offer complex interfaces for specifying prompts. They involve different roles and message types.
While these interfaces are powerful, they can be hard to use and understand.

In order to simplify prompting, the AI SDK support text, message, and system prompts.

## Text Prompts

Text prompts are strings.
They are ideal for simple generation use cases,
e.g. repeatedly generating content for variants of the same prompt text.

You can set text prompts using the `prompt` property made available by AI SDK functions like [`streamText`](/docs/reference/ai-sdk-core/stream-text) or [`generateObject`](/docs/reference/ai-sdk-core/generate-object).
You can structure the text in any way and inject variables, e.g. using a template literal.

```ts highlight="3"
const result = await generateText({
  model: yourModel,
  prompt: 'Invent a new holiday and describe its traditions.',
});
```

You can also use template literals to provide dynamic data to your prompt.

```ts highlight="3-5"
const result = await generateText({
  model: yourModel,
  prompt:
    `I am planning a trip to ${destination} for ${lengthOfStay} days. ` +
    `Please suggest the best tourist activities for me to do.`,
});
```

## System Prompts

System prompts are the initial set of instructions given to models that help guide and constrain the models' behaviors and responses.
You can set system prompts using the `system` property.
System prompts work with both the `prompt` and the `messages` properties.

```ts highlight="3-6"
const result = await generateText({
  model: yourModel,
  system:
    `You help planning travel itineraries. ` +
    `Respond to the users' request with a list ` +
    `of the best stops to make in their destination.`,
  prompt:
    `I am planning a trip to ${destination} for ${lengthOfStay} days. ` +
    `Please suggest the best tourist activities for me to do.`,
});
```

<Note>
  When you use a message prompt, you can also use system messages instead of a
  system prompt.
</Note>

## Message Prompts

A message prompt is an array of user, assistant, and tool messages.
They are great for chat interfaces and more complex, multi-modal prompts.
You can use the `messages` property to set message prompts.

Each message has a `role` and a `content` property. The content can either be text (for user and assistant messages), or an array of relevant parts (data) for that message type.

```ts highlight="3-7"
const result = await streamUI({
  model: yourModel,
  messages: [
    { role: 'user', content: 'Hi!' },
    { role: 'assistant', content: 'Hello, how can I help?' },
    { role: 'user', content: 'Where can I buy the best Currywurst in Berlin?' },
  ],
});
```

Instead of sending a text in the `content` property, you can send an array of parts that includes a mix of text and other content parts.

<Note type="warning">
  Not all language models support all message and content types. For example,
  some models might not be capable of handling multi-modal inputs or tool
  messages. [Learn more about the capabilities of select
  models](./providers-and-models#model-capabilities).
</Note>

### User Messages

#### Text Parts

Text content is the most common type of content. It is a string that is passed to the model.

If you only need to send text content in a message, the `content` property can be a string,
but you can also use it to send multiple content parts.

```ts highlight="7-10"
const result = await generateText({
  model: yourModel,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Where can I buy the best Currywurst in Berlin?',
        },
      ],
    },
  ],
});
```

#### Image Parts

User messages can include image parts. An image can be one of the following:

- base64-encoded image:
  - `string` with base-64 encoded content
  - data URL `string`, e.g. `data:image/png;base64,...`
- binary image:
  - `ArrayBuffer`
  - `Uint8Array`
  - `Buffer`
- URL:
  - http(s) URL `string`, e.g. `https://example.com/image.png`
  - `URL` object, e.g. `new URL('https://example.com/image.png')`

##### Example: Binary image (Buffer)

```ts highlight="8-11"
const result = await generateText({
  model,
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Describe the image in detail.' },
        {
          type: 'image',
          image: fs.readFileSync('./data/comic-cat.png'),
        },
      ],
    },
  ],
});
```

##### Example: Base-64 encoded image (string)

```ts highlight="8-11"
const result = await generateText({
  model: yourModel,
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Describe the image in detail.' },
        {
          type: 'image',
          image: fs.readFileSync('./data/comic-cat.png').toString('base64'),
        },
      ],
    },
  ],
});
```

##### Example: Image URL (string)

```ts highlight="8-12"
const result = await generateText({
  model: yourModel,
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Describe the image in detail.' },
        {
          type: 'image',
          image:
            'https://github.com/vercel/ai/blob/main/examples/ai-core/data/comic-cat.png?raw=true',
        },
      ],
    },
  ],
});
```

#### File Parts

<Note type="warning">
  Only a few providers and models currently support file parts: [Google
  Generative AI](/providers/ai-sdk-providers/google-generative-ai), [Google
  Vertex AI](/providers/ai-sdk-providers/google-vertex),
  [OpenAI](/providers/ai-sdk-providers/openai) (for `wav` and `mp3` audio with
  `gpt-4o-audio-preview`), [Anthropic](/providers/ai-sdk-providers/anthropic)
  (for `pdf`).
</Note>

User messages can include file parts. A file can be one of the following:

- base64-encoded file:
  - `string` with base-64 encoded content
  - data URL `string`, e.g. `data:image/png;base64,...`
- binary data:
  - `ArrayBuffer`
  - `Uint8Array`
  - `Buffer`
- URL:
  - http(s) URL `string`, e.g. `https://example.com/some.pdf`
  - `URL` object, e.g. `new URL('https://example.com/some.pdf')`

You need to specify the MIME type of the file you are sending.

##### Example: PDF file from Buffer

```ts highlight="12-14"
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const result = await generateText({
  model: google('gemini-1.5-flash'),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'What is the file about?' },
        {
          type: 'file',
          mimeType: 'application/pdf',
          data: fs.readFileSync('./data/example.pdf'),
        },
      ],
    },
  ],
});
```

##### Example: mp3 audio file from Buffer

```ts highlight="12-14"
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const result = await generateText({
  model: openai('gpt-4o-audio-preview'),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'What is the audio saying?' },
        {
          type: 'file',
          mimeType: 'audio/mpeg',
          data: fs.readFileSync('./data/galileo.mp3'),
        },
      ],
    },
  ],
});
```

### Assistant Messages

Assistant messages are messages that have a role of `assistant`.
They are typically previous responses from the assistant
and can contain text, reasoning, and tool call parts.

#### Example: Assistant message with text content

```ts highlight="5"
const result = await generateText({
  model: yourModel,
  messages: [
    { role: 'user', content: 'Hi!' },
    { role: 'assistant', content: 'Hello, how can I help?' },
  ],
});
```

#### Example: Assistant message with text content in array

```ts highlight="5"
const result = await generateText({
  model: yourModel,
  messages: [
    { role: 'user', content: 'Hi!' },
    {
      role: 'assistant',
      content: [{ type: 'text', text: 'Hello, how can I help?' }],
    },
  ],
});
```

#### Example: Assistant message with tool call content

```ts highlight="5-10"
const result = await generateText({
  model: yourModel,
  messages: [
    { role: 'user', content: 'How many calories are in this block of cheese?' },
    {
      role: 'assistant',
      content: [
        {
          type: 'tool-call',
          toolCallId: '12345',
          toolName: 'get-nutrition-data',
          args: { cheese: 'Roquefort' },
        },
      ],
    },
  ],
});
```

### Tool messages

<Note>
  [Tools](/docs/foundations/tools) (also known as function calling) are programs
  that you can provide an LLM to extend it's built-in functionality. This can be
  anything from calling an external API to calling functions within your UI.
  Learn more about Tools in [the next section](/docs/foundations/tools).
</Note>

For models that support [tool](/docs/foundations/tools) calls, assistant messages can contain tool call parts, and tool messages can contain tool result parts.
A single assistant message can call multiple tools, and a single tool message can contain multiple tool results.

```ts highlight="14-42"
const result = await generateText({
  model: yourModel,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'How many calories are in this block of cheese?',
        },
        { type: 'image', image: fs.readFileSync('./data/roquefort.jpg') },
      ],
    },
    {
      role: 'assistant',
      content: [
        {
          type: 'tool-call',
          toolCallId: '12345',
          toolName: 'get-nutrition-data',
          args: { cheese: 'Roquefort' },
        },
        // there could be more tool calls here (parallel calling)
      ],
    },
    {
      role: 'tool',
      content: [
        {
          type: 'tool-result',
          toolCallId: '12345', // needs to match the tool call id
          toolName: 'get-nutrition-data',
          result: {
            name: 'Cheese, roquefort',
            calories: 369,
            fat: 31,
            protein: 22,
          },
        },
        // there could be more tool results here (parallel calling)
      ],
    },
  ],
});
```

#### Multi-modal Tool Results

<Note type="warning">
  Multi-part tool results are experimental and only supported by Anthropic.
</Note>

Tool results can be multi-part and multi-modal, e.g. a text and an image.
You can use the `experimental_content` property on tool parts to specify multi-part tool results.

```ts highlight="20-32"
const result = await generateText({
  model: yourModel,
  messages: [
    // ...
    {
      role: 'tool',
      content: [
        {
          type: 'tool-result',
          toolCallId: '12345', // needs to match the tool call id
          toolName: 'get-nutrition-data',
          // for models that do not support multi-part tool results,
          // you can include a regular result part:
          result: {
            name: 'Cheese, roquefort',
            calories: 369,
            fat: 31,
            protein: 22,
          },
          // for models that support multi-part tool results,
          // you can include a multi-part content part:
          content: [
            {
              type: 'text',
              text: 'Here is an image of the nutrition data for the cheese:',
            },
            {
              type: 'image',
              data: fs.readFileSync('./data/roquefort-nutrition-data.png'),
              mimeType: 'image/png',
            },
          ],
        },
      ],
    },
  ],
});
```

### System Messages

System messages are messages that are sent to the model before the user messages to guide the assistant's behavior.
You can alternatively use the `system` property.

```ts highlight="4"
const result = await generateText({
  model: yourModel,
  messages: [
    { role: 'system', content: 'You help planning travel itineraries.' },
    {
      role: 'user',
      content:
        'I am planning a trip to Berlin for 3 days. Please suggest the best tourist activities for me to do.',
    },
  ],
});
```


================================================
File: content/docs/02-foundations/04-tools.mdx
================================================
---
title: Tools
description: Learn about tools with the AI SDK.
---

# Tools

While [large language models (LLMs)](/docs/foundations/overview#large-language-models) have incredible generation capabilities,
they struggle with discrete tasks (e.g. mathematics) and interacting with the outside world (e.g. getting the weather).

Tools are actions that an LLM can invoke.
The results of these actions can be reported back to the LLM to be considered in the next response.

For example, when you ask an LLM for the "weather in London", and there is a weather tool available, it could call a tool
with London as the argument. The tool would then fetch the weather data and return it to the LLM. The LLM can then use this
information in its response.

## What is a tool?

A tool is an object that can be called by the model to perform a specific task.
You can use tools with [`generateText`](/docs/reference/ai-sdk-core/generate-text)
and [`streamText`](/docs/reference/ai-sdk-core/stream-text) by passing one or more tools to the `tools` parameter.

A tool consists of three properties:

- **`description`**: An optional description of the tool that can influence when the tool is picked.
- **`parameters`**: A [Zod schema](/docs/foundations/tools#schema-specification-and-validation-with-zod) or a [JSON schema](/docs/reference/ai-sdk-core/json-schema) that defines the parameters. The schema is consumed by the LLM, and also used to validate the LLM tool calls.
- **`execute`**: An optional async function that is called with the arguments from the tool call.

<Note>
  `streamUI` uses UI generator tools with a `generate` function that can return
  React components.
</Note>

If the LLM decides to use a tool, it will generate a tool call.
Tools with an `execute` function are run automatically when these calls are generated.
The results of the tool calls are returned using tool result objects.

You can automatically pass tool results back to the LLM
using [multi-step calls](/docs/ai-sdk-core/tools-and-tool-calling#multi-step-calls) with `streamText` and `generateText`.

## Schemas

Schemas are used to define the parameters for tools and to validate the [tool calls](/docs/ai-sdk-core/tools-and-tool-calling).

The AI SDK supports both raw JSON schemas (using the [`jsonSchema` function](/docs/reference/ai-sdk-core/json-schema))
and [Zod](https://zod.dev/) schemas (either directly or using the [`zodSchema` function](/docs/reference/ai-sdk-core/zod-schema)).

[Zod](https://zod.dev/) is a popular TypeScript schema validation library.
You can install it with:

<Tabs items={['pnpm', 'npm', 'yarn']}>
  <Tab>
    <Snippet text="pnpm add zod" dark />
  </Tab>
  <Tab>
    <Snippet text="npm install zod" dark />
  </Tab>
  <Tab>
    <Snippet text="yarn add zod" dark />
  </Tab>
</Tabs>

You can then specify a Zod schema, for example:

```ts
import z from 'zod';

const recipeSchema = z.object({
  recipe: z.object({
    name: z.string(),
    ingredients: z.array(
      z.object({
        name: z.string(),
        amount: z.string(),
      }),
    ),
    steps: z.array(z.string()),
  }),
});
```

<Note>
  You can also use schemas for structured output generation with
  [`generateObject`](/docs/reference/ai-sdk-core/generate-object) and
  [`streamObject`](/docs/reference/ai-sdk-core/stream-object).
</Note>

## Toolkits

When you work with tools, you typically need a mix of application specific tools and general purpose tools.
There are several providers that offer pre-built tools as **toolkits** that you can use out of the box:

- **[agentic](https://github.com/transitive-bullshit/agentic)** - A collection of 20+ tools. Most tools connect to access external APIs such as [Exa](https://exa.ai/) or [E2B](https://e2b.dev/).
- **[browserbase](https://docs.browserbase.com/integrations/vercel-ai/introduction)** - Browser tool that runs a headless browser
- **[Stripe agent tools](https://docs.stripe.com/agents)** - Tools for interacting with Stripe.
- **[Toolhouse](https://docs.toolhouse.ai/toolhouse/using-vercel-ai)** - AI function-calling in 3 lines of code for over 25 different actions.
- **[Agent Tools](https://ai-sdk-agents.vercel.app/?item=introduction)** - A collection of tools for agents.
- **[AI Tool Maker](https://github.com/nihaocami/ai-tool-maker)** - A CLI utility to generate AI SDK tools from OpenAPI specs.
- **[Composio](https://docs.composio.dev/javascript/vercel)** - Composio provides 250+ tools like GitHub, Gmail, Salesforce and [more](https://composio.dev/tools).

<Note>
  Do you have open source tools or tool libraries that are compatible with the
  AI SDK? Please [file a pull request](https://github.com/vercel/ai/pulls) to
  add them to this list.
</Note>

## Learn more

The AI SDK Core [Tool Calling](/docs/ai-sdk-core/tools-and-tool-calling)
and [Agents](/docs/foundations/agents) documentation has more information about tools and tool calling.


================================================
File: content/docs/02-foundations/05-streaming.mdx
================================================
---
title: Streaming
description: Why use streaming for AI applications?
---

# Streaming

Streaming conversational text UIs (like ChatGPT) have gained massive popularity over the past few months. This section explores the benefits and drawbacks of streaming and blocking interfaces.

[Large language models (LLMs)](/docs/foundations/overview#large-language-models) are extremely powerful. However, when generating long outputs, they can be very slow compared to the latency you're likely used to. If you try to build a traditional blocking UI, your users might easily find themselves staring at loading spinners for 5, 10, even up to 40s waiting for the entire LLM response to be generated. This can lead to a poor user experience, especially in conversational applications like chatbots. Streaming UIs can help mitigate this issue by **displaying parts of the response as they become available**.

<div className="grid lg:grid-cols-2 grid-cols-1 gap-4 mt-8">
  <Card
    title="Blocking UI"
    description="Blocking responses wait until the full response is available before displaying it."
  >
    <BrowserIllustration highlight blocking />
  </Card>
  <Card
    title="Streaming UI"
    description="Streaming responses can transmit parts of the response as they become available."
  >
    <BrowserIllustration highlight />
  </Card>
</div>

## Real-world Examples

Here are 2 examples that illustrate how streaming UIs can improve user experiences in a real-world setting – the first uses a blocking UI, while the second uses a streaming UI.

### Blocking UI

<InlinePrompt
  initialInput="Come up with the first 200 characters of the first book in the Harry Potter series."
  blocking
/>

### Streaming UI

<InlinePrompt initialInput="Come up with the first 200 characters of the first book in the Harry Potter series." />

As you can see, the streaming UI is able to start displaying the response much faster than the blocking UI. This is because the blocking UI has to wait for the entire response to be generated before it can display anything, while the streaming UI can display parts of the response as they become available.

While streaming interfaces can greatly enhance user experiences, especially with larger language models, they aren't always necessary or beneficial. If you can achieve your desired functionality using a smaller, faster model without resorting to streaming, this route can often lead to simpler and more manageable development processes.

However, regardless of the speed of your model, the AI SDK is designed to make implementing streaming UIs as simple as possible. In the example below, we stream text generation from OpenAI's `gpt-4-turbo` in under 10 lines of code using the SDK's [`streamText`](/docs/reference/ai-sdk-core/stream-text) function:

```ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const { textStream } = streamText({
  model: openai('gpt-4-turbo'),
  prompt: 'Write a poem about embedding models.',
});

for await (const textPart of textStream) {
  console.log(textPart);
}
```

For an introduction to streaming UIs and the AI SDK, check out our [Getting Started guides](/docs/getting-started).


================================================
File: content/docs/02-foundations/06-agents.mdx
================================================
---
title: Agents
description: Learn how to build agents with AI SDK Core.
---

# Agents

When building AI applications, you often need **systems that can understand context and take meaningful actions**. When building these systems, the key consideration is finding the right balance between flexibility and control. Let's explore different approaches and patterns for building these systems, with a focus on helping you match capabilities to your needs.

## Building Blocks

When building AI systems, you can combine these fundamental components:

### Single-Step LLM Generation

The basic building block - one call to an LLM to get a response. Useful for straightforward tasks like classification or text generation.

### Tool Usage

Enhanced capabilities through tools (like calculators, APIs, or databases) that the LLM can use to accomplish tasks. Tools provide a controlled way to extend what the LLM can do.

When solving complex problems, **an LLM can make multiple tool calls across multiple steps without you explicity specifying the order** - for example, looking up information in a database, using that to make calculations, and then storing results. The AI SDK makes this [multi-step tool usage](#multi-step-tool-usage) straightforward through the `maxSteps` parameter.

### Multi-Agent Systems

Multiple LLMs working together, each specialized for different aspects of a complex task. This enables sophisticated behaviors while keeping individual components focused.

## Patterns

These building blocks can be combined with workflow patterns that help manage complexity:

- [Sequential Processing](#sequential-processing-chains) - Steps executed in order
- [Parallel Processing](#parallel-processing) - Independent tasks run simultaneously
- [Evaluation/Feedback Loops](#evaluator-optimizer) - Results checked and improved iteratively
- [Orchestration](#orchestrator-worker) - Coordinating multiple components
- [Routing](#routing) - Directing work based on context

## Choosing Your Approach

The key factors to consider:

- **Flexibility vs Control** - How much freedom does the LLM need vs how tightly must you constrain its actions?
- **Error Tolerance** - What are the consequences of mistakes in your use case?
- **Cost Considerations** - More complex systems typically mean more LLM calls and higher costs
- **Maintenance** - Simpler architectures are easier to debug and modify

**Start with the simplest approach that meets your needs**. Add complexity only when required by:

1. Breaking down tasks into clear steps
2. Adding tools for specific capabilities
3. Implementing feedback loops for quality control
4. Introducing multiple agents for complex workflows

Let's look at examples of these patterns in action.

## Patterns with Examples

The following patterns, adapted from [Anthropic's guide on building effective agents](https://www.anthropic.com/research/building-effective-agents), serve as building blocks that can be combined to create comprehensive workflows. Each pattern addresses specific aspects of task execution, and by combining them thoughtfully, you can build reliable solutions for complex problems.

### Sequential Processing (Chains)

The simplest workflow pattern executes steps in a predefined order. Each step's output becomes input for the next step, creating a clear chain of operations. This pattern is ideal for tasks with well-defined sequences, like content generation pipelines or data transformation processes.

```ts
import { openai } from '@ai-sdk/openai';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';

async function generateMarketingCopy(input: string) {
  const model = openai('gpt-4o');

  // First step: Generate marketing copy
  const { text: copy } = await generateText({
    model,
    prompt: `Write persuasive marketing copy for: ${input}. Focus on benefits and emotional appeal.`,
  });

  // Perform quality check on copy
  const { object: qualityMetrics } = await generateObject({
    model,
    schema: z.object({
      hasCallToAction: z.boolean(),
      emotionalAppeal: z.number().min(1).max(10),
      clarity: z.number().min(1).max(10),
    }),
    prompt: `Evaluate this marketing copy for:
    1. Presence of call to action (true/false)
    2. Emotional appeal (1-10)
    3. Clarity (1-10)

    Copy to evaluate: ${copy}`,
  });

  // If quality check fails, regenerate with more specific instructions
  if (
    !qualityMetrics.hasCallToAction ||
    qualityMetrics.emotionalAppeal < 7 ||
    qualityMetrics.clarity < 7
  ) {
    const { text: improvedCopy } = await generateText({
      model,
      prompt: `Rewrite this marketing copy with:
      ${!qualityMetrics.hasCallToAction ? '- A clear call to action' : ''}
      ${qualityMetrics.emotionalAppeal < 7 ? '- Stronger emotional appeal' : ''}
      ${qualityMetrics.clarity < 7 ? '- Improved clarity and directness' : ''}

      Original copy: ${copy}`,
    });
    return { copy: improvedCopy, qualityMetrics };
  }

  return { copy, qualityMetrics };
}
```

### Routing

This pattern allows the model to make decisions about which path to take through a workflow based on context and intermediate results. The model acts as an intelligent router, directing the flow of execution between different branches of your workflow. This is particularly useful when handling varied inputs that require different processing approaches. In the example below, the results of the first LLM call change the properties of the second LLM call like model size and system prompt.

```ts
import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';

async function handleCustomerQuery(query: string) {
  const model = openai('gpt-4o');

  // First step: Classify the query type
  const { object: classification } = await generateObject({
    model,
    schema: z.object({
      reasoning: z.string(),
      type: z.enum(['general', 'refund', 'technical']),
      complexity: z.enum(['simple', 'complex']),
    }),
    prompt: `Classify this customer query:
    ${query}

    Determine:
    1. Query type (general, refund, or technical)
    2. Complexity (simple or complex)
    3. Brief reasoning for classification`,
  });

  // Route based on classification
  // Set model and system prompt based on query type and complexity
  const { text: response } = await generateText({
    model:
      classification.complexity === 'simple'
        ? openai('gpt-4o-mini')
        : openai('o3-mini'),
    system: {
      general:
        'You are an expert customer service agent handling general inquiries.',
      refund:
        'You are a customer service agent specializing in refund requests. Follow company policy and collect necessary information.',
      technical:
        'You are a technical support specialist with deep product knowledge. Focus on clear step-by-step troubleshooting.',
    }[classification.type],
    prompt: query,
  });

  return { response, classification };
}
```

### Parallel Processing

Some tasks can be broken down into independent subtasks that can be executed simultaneously. This pattern takes advantage of parallel execution to improve efficiency while maintaining the benefits of structured workflows. For example, analyzing multiple documents or processing different aspects of a single input concurrently (like code review).

```ts
import { openai } from '@ai-sdk/openai';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';

// Example: Parallel code review with multiple specialized reviewers
async function parallelCodeReview(code: string) {
  const model = openai('gpt-4o');

  // Run parallel reviews
  const [securityReview, performanceReview, maintainabilityReview] =
    await Promise.all([
      generateObject({
        model,
        system:
          'You are an expert in code security. Focus on identifying security vulnerabilities, injection risks, and authentication issues.',
        schema: z.object({
          vulnerabilities: z.array(z.string()),
          riskLevel: z.enum(['low', 'medium', 'high']),
          suggestions: z.array(z.string()),
        }),
        prompt: `Review this code:
      ${code}`,
      }),

      generateObject({
        model,
        system:
          'You are an expert in code performance. Focus on identifying performance bottlenecks, memory leaks, and optimi