import { Application } from "./application";
import studentController from "./student";
import systemController from "./system";
import express from "express";
import docsController from "./docs";

const server = express();
const app = new Application(server, [systemController, studentController, docsController]);
app.start();