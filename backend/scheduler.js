import cron from "node-cron";
import nodemailer from "nodemailer";
import Task from "./models/taskModel.js";
import User from "./models/userModel.js";


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


function getDateRange(daysAhead) {
  const start = new Date();
  start.setDate(start.getDate() + daysAhead);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

cron.schedule("0 6 * * *", async () => {
  console.log("⏰ Scheduler running for H-3, H-2, H-1 reminders...");

  const labels = { 3: "H-3", 2: "H-2", 1: "H-1" };

  for (const daysAhead of [3, 2, 1]) {
    const { start, end } = getDateRange(daysAhead);

    try {
      const tasks = await Task.find({
        dueDate: { $gte: start, $lt: end },
        completed: false 
      }).populate("owner");

      for (const task of tasks) {
        if (!task.owner || !task.owner.email) continue; 

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: task.owner.email,
          subject: `🔔 Reminder ${labels[daysAhead]}: "${task.title}"`,
          text: `🌼 Hai ${task.owner.name} Selamat Pagi,
Jangan lupa ya, kamu ada tugas: 📌 *${task.title}*
yang akan jatuh tempo pada 🗓️ ${task.dueDate.toLocaleDateString()}.
Yuk, semangat selesaikan tugas ini supaya kamu bisa lebih tenang dan punya waktu untuk hal-hal yang kamu sukai 💖
Kalau butuh istirahat, jangan lupa rehat sejenak ya, tapi jangan lupa kembali mengerjakan tugasmu 🌻

Semangat selalu,
Task-Manager-App 🌷
          `
          };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Reminder ${labels[daysAhead]} sent to ${task.owner.email} for task "${task.title}"`);
      }
    } catch (error) {
      console.error(`❌ Error sending ${labels[daysAhead]} reminders:`, error);
    }
  }
});
