import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";

const FIXTURE_ROOT = path.resolve("test/fixtures/hips/decaps");

function getContentType(filePath) {
  if (filePath.endsWith(".fits")) {
    return "application/fits";
  }

  if (path.basename(filePath) === "properties") {
    return "text/plain; charset=utf-8";
  }

  return "application/octet-stream";
}

export async function startHiPSFixtureServer() {
  const server = http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url, "http://localhost");

      console.log(`[HiPS fixture] Request: ${requestUrl.pathname}`);

      let relativePath = decodeURIComponent(
        requestUrl.pathname.replace(/^\/+/, ""),
      );

      // The HiPS properties loader requests the survey root.
      if (relativePath === "") {
        relativePath = "properties";
      }

      // The FITS loading path currently reaches the local server without
      // the Norder component. Map that request to the recorded real fixture.
      if (relativePath === "Dir0/Npix2326.fits") {
        relativePath = "Norder4/Dir0/Npix2326.fits";
      }

      const filePath = path.resolve(FIXTURE_ROOT, relativePath);

      // Prevent path traversal outside the fixture directory.
      if (
        filePath !== FIXTURE_ROOT &&
        !filePath.startsWith(FIXTURE_ROOT + path.sep)
      ) {
        res.statusCode = 403;
        res.end("Forbidden");
        return;
      }

      let body;

      try {
        body = await fs.readFile(filePath);
      } catch (error) {
        if (error.code === "ENOENT") {
          console.error(`[HiPS fixture] Missing: ${relativePath}`);

          res.statusCode = 404;
          res.end("Fixture not found");
          return;
        }

        if (error.code === "EISDIR") {
          console.error(
            `[HiPS fixture] Attempted to read directory: ${relativePath}`,
          );

          res.statusCode = 404;
          res.end("Fixture not found");
          return;
        }

        throw error;
      }

      console.log(`[HiPS fixture] Serving: ${relativePath}`);

      res.statusCode = 200;
      res.setHeader("content-type", getContentType(filePath));
      res.end(body);
    } catch (error) {
      console.error("[HiPS fixture] Server error:", error);

      res.statusCode = 500;
      res.end("Fixture server error");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);

    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Unable to determine fixture server port");
  }

  return {
    url: `http://127.0.0.1:${address.port}/`,

    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      }),
  };
}