import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("retry mux dead letters", { minutes: 5 }, internal.muxWebhook.retryFailedProjectionSweep, {});

export default crons;
