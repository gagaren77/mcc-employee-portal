import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Checking database seed status...")

  // ─── Idempotency guard ────────────────────────────────
  // If users already exist, skip the destructive seeding.
  const userCount = await prisma.user.count()
  if (userCount > 0) {
    console.log(`✅ Database already seeded (${userCount} users found). Skipping.`)
    return
  }

  console.log("🌱 First-time seed — populating database...")

  // ─── Admin user ────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@MCC2024!", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@mccollege.edu" },
    update: {
      password: adminPassword,
      role: "ADMIN",
    },
    create: {
      name: "Portal Admin",
      email: "admin@mccollege.edu",
      password: adminPassword,
      role: "ADMIN",
      department: "Information Technology",
      title: "System Administrator",
      location: "Chicago, IL",
      isActive: true,
    },
  })
  console.log("✅ Admin user:", admin.email)

  // ─── Sample employees ──────────────────────────────────
  const employeePassword = await bcrypt.hash("Employee@123!", 12)
  const employees = [
    { name: "Sarah Johnson", email: "s.johnson@mccollege.edu", department: "Human Resources", title: "HR Director", role: "HR" },
    { name: "Michael Chen", email: "m.chen@mccollege.edu", department: "Information Technology", title: "IT Manager", role: "IT" },
    { name: "Emily Rodriguez", email: "e.rodriguez@mccollege.edu", department: "Admissions", title: "Admissions Counselor", role: "EMPLOYEE" },
    { name: "David Kim", email: "d.kim@mccollege.edu", department: "Academic Affairs", title: "Program Director", role: "EMPLOYEE" },
    { name: "Jessica Williams", email: "j.williams@mccollege.edu", department: "Financial Aid", title: "Financial Aid Advisor", role: "EMPLOYEE" },
    { name: "Robert Martinez", email: "r.martinez@mccollege.edu", department: "Student Services", title: "Student Success Coach", role: "EMPLOYEE" },
  ]

  for (const emp of employees) {
    await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        ...emp,
        password: employeePassword,
        phone: "(312) 555-" + Math.floor(1000 + Math.random() * 9000),
        location: "Chicago, IL",
        isActive: true,
      },
    })
  }
  console.log(`✅ Created ${employees.length} sample employees`)

  // ─── Announcements ─────────────────────────────────────
  await prisma.announcement.createMany({
    data: [
      {
        id: "ann-1",
        title: "Welcome to the New Employee Portal!",
        content: "We're excited to launch the new MCC Employee Portal. This is your central hub for company news, HR resources, benefits information, and more. Please explore and let us know if you have any feedback!",
        category: "general",
        priority: "HIGH",
        authorId: admin.id,
        pinned: true,
        published: true,
      },
      {
        id: "ann-2",
        title: "Open Enrollment — November 1–15",
        content: "Benefits open enrollment is coming up November 1–15. This is your chance to review and update your health, dental, vision, and other benefit elections for the upcoming plan year. Informational sessions will be held October 28–30.",
        category: "hr",
        priority: "URGENT",
        authorId: admin.id,
        pinned: true,
        published: true,
      },
      {
        id: "ann-3",
        title: "IT Maintenance — Saturday Night",
        content: "Scheduled IT maintenance will take place Saturday 10 PM – Sunday 2 AM. Email and VPN may be temporarily unavailable. Please plan accordingly and save your work before then.",
        category: "it",
        priority: "NORMAL",
        authorId: admin.id,
        pinned: false,
        published: true,
      },
      {
        id: "ann-4",
        title: "Holiday Office Closure",
        content: "The MCC offices will be closed November 27–28 for the Thanksgiving holiday. We will reopen Monday, December 1. Happy Thanksgiving to all!",
        category: "general",
        priority: "NORMAL",
        authorId: admin.id,
        pinned: false,
        published: true,
      },
    ],
  })
  console.log("✅ Announcements seeded")

  // ─── Events ────────────────────────────────────────────
  const now = new Date()
  const addDays = (d: number) => new Date(now.getTime() + d * 86400000)

  await prisma.event.createMany({
    data: [
      {
        id: "evt-1",
        title: "Benefits Open Enrollment Info Session",
        description: "Learn about your 2025 benefit options. HR will walk through medical, dental, 403(b), and new additions.",
        startDate: addDays(7),
        endDate: addDays(7),
        location: "Room 201 / Zoom",
        category: "training",
      },
      {
        id: "evt-2",
        title: "All-Staff Town Hall",
        description: "Quarterly all-staff meeting with updates from leadership on college performance, goals, and Q&A.",
        startDate: addDays(14),
        location: "Main Auditorium",
        category: "meeting",
      },
      {
        id: "evt-3",
        title: "Thanksgiving — Office Closed",
        description: "MCC offices are closed in observance of Thanksgiving.",
        startDate: addDays(21),
        category: "holiday",
      },
      {
        id: "evt-4",
        title: "Annual Holiday Party",
        description: "Join us for our annual employee holiday celebration! Food, drinks, and festivities.",
        startDate: addDays(35),
        location: "Student Commons",
        category: "social",
      },
      {
        id: "evt-5",
        title: "End of Semester Grades Deadline",
        description: "Final grades must be submitted by 5 PM.",
        startDate: addDays(10),
        category: "deadline",
      },
    ],
  })
  console.log("✅ Events seeded")

  // ─── Quick links ───────────────────────────────────────
  await prisma.quickLink.createMany({
    data: [
      { id: "ql-1", title: "SharePoint Intranet", url: "https://YOUR-TENANT.sharepoint.com", category: "sharepoint", description: "Main intranet", order: 1 },
      { id: "ql-2", title: "Paylocity", url: "https://access.paylocity.com", category: "payroll", description: "Pay stubs & time off", order: 2 },
      { id: "ql-3", title: "Office 365", url: "https://office.com", category: "it", description: "Email, Teams, OneDrive", order: 3 },
      { id: "ql-4", title: "HR Forms", url: "/hr", category: "hr", description: "All HR forms & policies", order: 4 },
      { id: "ql-5", title: "Benefits Portal", url: "/benefits", category: "benefits", description: "Benefits enrollment", order: 5 },
      { id: "ql-6", title: "IT Help Desk", url: "/it-help", category: "it", description: "Submit support tickets", order: 6 },
      { id: "ql-7", title: "Student Info System", url: "#", category: "general", description: "SIS / LMS access", order: 7 },
      { id: "ql-8", title: "Zoom", url: "https://zoom.us", category: "it", description: "Video conferencing", order: 8 },
    ],
  })
  console.log("✅ Quick links seeded")

  // ─── HR Resources ──────────────────────────────────────
  await prisma.hrResource.createMany({
    data: [
      { id: "hr-1", title: "Employee Handbook 2024-25", category: "policies", url: "#", fileType: "PDF", order: 1 },
      { id: "hr-2", title: "PTO Request Form", category: "time-off", url: "#", fileType: "FORM", order: 2 },
      { id: "hr-3", title: "Direct Deposit Form", category: "payroll", url: "#", fileType: "FORM", order: 3 },
      { id: "hr-4", title: "Performance Review Template", category: "performance", url: "#", fileType: "DOC", order: 4 },
      { id: "hr-5", title: "Tuition Assistance Application", category: "development", url: "#", fileType: "FORM", order: 5 },
    ],
  })
  console.log("✅ HR Resources seeded")

  console.log("\n🎉 Database seeded successfully!")
  console.log("\n📋 Login credentials:")
  console.log("   Admin: admin@mccollege.edu / Admin@MCC2024!")
  console.log("   Employee: s.johnson@mccollege.edu / Employee@123!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
