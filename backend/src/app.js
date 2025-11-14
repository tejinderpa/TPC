import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials : true
}))

// app.use function use krde han middleware use krn waste
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import studentRouter from "./routes/student.routes.js"
import applicationRouter from "./routes/application.routes.js"
import eventRouter from "./routes/event.routes.js"
import rewardRouter from "./routes/reward.routes.js"
import companyRouter from "./routes/company.routes.js"
import jobRouter from "./routes/job.routes.js"
import driveRouter from "./routes/drive.routes.js"
import shortlistRouter from "./routes/shortlist.routes.js"
import alumniRouter from "./routes/alumni.routes.js"
import mentorshipRouter from "./routes/mentorship.routes.js"
import referralRouter from "./routes/referral.routes.js"
import tpoRouter from "./routes/tpo.routes.js"
import analyticsRouter from "./routes/analytics.routes.js"
import eventManagementRouter from "./routes/eventManagement.routes.js"

//routes declaration
app.use("/api/v1/students", studentRouter)
app.use("/api/v1/applications", applicationRouter)
app.use("/api/v1/events", eventRouter)
app.use("/api/v1/rewards", rewardRouter)
app.use("/api/v1/companies", companyRouter)
app.use("/api/v1/jobs", jobRouter)
app.use("/api/v1/drives", driveRouter)
app.use("/api/v1/shortlist", shortlistRouter)
app.use("/api/v1/alumni", alumniRouter)
app.use("/api/v1/mentorship", mentorshipRouter)
app.use("/api/v1/referrals", referralRouter)
app.use("/api/v1/tpo", tpoRouter)
app.use("/api/v1/analytics", analyticsRouter)
app.use("/api/v1/event-management", eventManagementRouter)

export default app;