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
    expectedText: "Next.js 官方文档"
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
      console.log(`${check.path} -> ${response.status}`);
    }
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

  if (stderr.trim().length > 0) {
    process.stderr.write(stderr);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
