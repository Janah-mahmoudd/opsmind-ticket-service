import swaggerJSDoc, { type Options } from "swagger-jsdoc";
import path from "node:path";
import { config } from "../config";

const cwd = process.cwd();

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "OpsMind Ticket Service API",
      version: "1.0.0",
      description: "REST API for managing tickets.",
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
      },
    ],
    tags: [{ name: "Tickets" }, { name: "Health" }, { name: "Docs" }],
  },
  // IMPORTANT:
  // When running in Docker/production we execute `dist/server.js`.
  // swagger-jsdoc resolves globs relative to process.cwd(), so the old
  // `./src/...` patterns can end up not matching and produce an empty spec.
  // We include both TS (dev) and compiled JS (prod) sources.
  apis: [
    path.join(cwd, "src", "routes", "**", "*.ts"),
    path.join(cwd, "src", "app.ts"),
    path.join(cwd, "dist", "routes", "**", "*.js"),
    path.join(cwd, "dist", "app.js"),
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
