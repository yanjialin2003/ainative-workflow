import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const host = "127.0.0.1";
const port = Number(process.env.PORT ?? 3201);
const baseUrl = `http://${host}:${port}`;

const checks = [
  {
    path: "/",
    expectedStatus: 200,
    expectedText: "你好，我是"
  },
  {
    path: "/blog",
    expectedStatus: 200,
    expectedText: "技术博客"
  },
  {
    path: "/blog/responsive-reading-experience",
    expectedStatus: 200,
    expectedText: "技术博客详情页，优先保证阅读体验",
    expectedPattern:
      /<a(?=[^>]*href="https:\/\/nextjs\.org\/docs")(?=[^>]*target="_blank")(?=[^>]*rel="noopener noreferrer")[^>]*>Next\.js 官方文档<\/a>/
  },
  {
    path: "/blog/not-a-real-post",
    expectedStatus: 404,
    expectedText: "文章不存在或已下线"
  }
];

function createServer() {
  return spawn("npm", ["run", "start", "--", "--hostname", host, "--port", String(port)], {
    stdio: ["ignore", "pipe", "pipe"]
  });
}

async function waitForServer() {
  const deadline = Date.now() + 20000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) {
        return;
      }
    } catch {
      await delay(300);
    }
  }

  throw new Error(`Timed out waiting for ${baseUrl}`);
}

async function main() {
  const server = createServer();
  let stderr = "";
  let failure = null;

  server.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();

    for (const check of checks) {
      const response = await fetch(`${baseUrl}${check.path}`);
      const body = await response.text();

      assert.equal(response.status, check.expectedStatus, `${check.path} returned ${response.status}`);
      assert.match(body, new RegExp(check.expectedText), `${check.path} did not include expected copy`);
      if (check.expectedPattern) {
        assert.match(body, check.expectedPattern, `${check.path} did not render the expected external link`);
      }
      console.log(`${check.path} -> ${response.status}`);
    }
  } catch (error) {
    failure = error;
  } finally {
    server.kill("SIGTERM");
    await new Promise((resolve) => {
      server.once("exit", resolve);
      setTimeout(() => {
        if (!server.killed) {
          server.kill("SIGKILL");
        }
        resolve();
      }, 5000);
    });
  }

  if (failure) {
    if (stderr.trim().length > 0) {
      process.stderr.write(stderr);
    }
    throw failure;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
