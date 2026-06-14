"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppState, AppScreenState } from "@/types";

interface ResumeUploadProps {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

const DEMO_PROFILES = [
  `Maria Santos
Senior Application Security Engineer

About
Application Security Engineer with 8 years of experience in secure software development, cloud security, vulnerability management, and security awareness. Passionate about helping organizations build security into their development lifecycle.

Experience
Senior Application Security Engineer
ABC Financial Services (2022–Present)

Security Analyst
GlobalTech Solutions (2019–2022)

IT Security Specialist
Innovate Systems (2017–2019)

Skills
Application Security, Secure SDLC, OWASP Top 10, Threat Modeling, Cloud Security, Incident Response, Security Awareness Training

Certifications
CISSP, CISA, Microsoft Security Engineer Associate

Education
Bachelor of Science in Information Technology

Career Goals
Security Architecture, AI Security Governance, Security Leadership`,

  `James Cruz
Data Scientist

About
Data Scientist specializing in machine learning, business analytics, and AI solutions. Experienced in building predictive models and transforming complex datasets into actionable business insights.

Experience
Data Scientist
DataWorks Analytics (2023–Present)

Business Intelligence Analyst
Insight Corporation (2021–2023)

Data Analyst
TechBridge Solutions (2019–2021)

Skills
Python, Machine Learning, SQL, Azure AI, Power BI, Data Visualization, Generative AI

Certifications
Microsoft Azure AI Engineer Associate, Databricks Data Analyst Associate

Education
BS Statistics

Career Goals
AI Solutions Architect, MLOps Specialist`,

  `Angela Rivera
Registered Nurse

About
Registered Nurse with experience in emergency care and patient education. Dedicated to providing compassionate healthcare while continuously improving clinical skills.

Experience
Staff Nurse
St. Luke's Medical Center (2022–Present)

Junior Nurse
Manila General Hospital (2020–2022)

Skills
Emergency Care, Patient Assessment, IV Therapy, Clinical Documentation, Patient Education, Healthcare Coordination

Certifications
Basic Life Support (BLS), Advanced Cardiac Life Support (ACLS)

Education
BS Nursing

Career Goals
Nurse Practitioner, Healthcare Administration`,

  `Michael Tan
Software Engineer

About
Full-stack Software Engineer passionate about building scalable web applications and AI-powered platforms. Experienced in cloud-native development and modern software architecture.

Experience
Senior Software Engineer
CloudNova Technologies (2023–Present)

Software Engineer
Digital Solutions Pte Ltd (2020–2023)

Skills
C#, .NET, React, TypeScript, Azure, Docker, Kubernetes

Certifications
Microsoft Azure Developer Associate

Education
Bachelor of Computer Science

Career Goals
Engineering Manager, Solutions Architect`,

  `Sofia Mendoza
Marketing & Content Creator

About
Digital marketing professional and content creator focused on social media growth, personal branding, and video content strategy. Experienced in building online communities and creating engaging content.

Experience
Digital Marketing Manager
Bright Media Agency (2023–Present)

Social Media Specialist
TrendLab Marketing (2021–2023)

Skills
Content Creation, TikTok Marketing, Instagram Growth, Brand Strategy, Video Editing, Influencer Marketing

Certifications
Google Digital Marketing Certification, Meta Certified Digital Marketing Associate

Education
BS Marketing Management

Career Goals
Creative Director, Full-Time Content Creator`,

  `Carlo Mendoza
Licensed Civil Engineer

About
Civil Engineer with 10 years of experience in infrastructure, road construction, and project management. Passionate about building sustainable communities and improving public infrastructure.

Experience
Project Engineer
BuildWell Construction Corp. (2021–Present)

Site Engineer
Metro Infrastructure Group (2016–2021)

Skills
AutoCAD, Project Management, Construction Planning, Cost Estimation, Structural Design, Site Supervision

Certifications
PRC Licensed Civil Engineer, PMP (Project Management Professional)

Education
BS Civil Engineering

Career Goals
Construction Director, Infrastructure Consultant`,

  `Princess Mae Villanueva
Public School Teacher

About
Dedicated educator focused on helping students develop critical thinking and lifelong learning skills. Experienced in classroom management, curriculum development, and educational technology.

Experience
Teacher III
Department of Education (2018–Present)

Skills
Lesson Planning, Classroom Management, Student Assessment, Educational Technology, Public Speaking, Mentoring

Certifications
Licensed Professional Teacher (LPT)

Education
Bachelor of Secondary Education

Career Goals
School Principal, Education Program Specialist`,

  `Abdul Rahman
Restaurant Owner & Chef

About
Entrepreneur and chef specializing in Filipino and Mindanao cuisine. Started a small food stall that grew into a successful family restaurant serving hundreds of customers weekly.

Experience
Owner & Head Chef
Rahman's Kitchen (2019–Present)

Skills
Culinary Arts, Menu Development, Business Management, Customer Service, Food Safety, Team Leadership

Certifications
Food Safety Certification, TESDA Cookery NC II

Education
Hospitality Management

Career Goals
Expand to Multiple Branches, Food Franchise Development`,

  `Roberto "Berto" Ramos
Landscape Gardener & Urban Farming Specialist

About
Experienced gardener and urban farming advocate with over 12 years of experience designing, maintaining, and revitalizing residential and commercial green spaces. Passionate about sustainable gardening, native plants, and community food gardens.

Experience
Lead Landscape Gardener
Green Horizons Landscaping (2018–Present)

Gardening Supervisor
EcoScapes Philippines (2014–2018)

Community Garden Coordinator
Baguio Urban Farming Initiative (2012–2014)

Skills
Landscape Design, Plant Care & Maintenance, Urban Farming, Irrigation Systems, Composting, Pest Management, Greenhouse Operations

Certifications
TESDA Landscape Installation and Maintenance NC II, Urban Agriculture Training Program

Education
Diploma in Agricultural Technology

Career Goals
Establish a Sustainable Plant Nursery, Train Future Urban Farmers, Develop Community Food Security Programs`,

  `Clara Bautista
Librarian & Information Services Specialist

About
Licensed Librarian dedicated to promoting information literacy, lifelong learning, and equitable access to knowledge. Experienced in managing physical and digital collections, research assistance, and community learning programs.

Experience
Chief Librarian
Iloilo City Public Library (2021–Present)

Reference Librarian
West Visayas University Library (2017–2021)

Library Assistant
Provincial Learning Resource Center (2015–2017)

Skills
Information Management, Research Assistance, Digital Archives, Cataloging & Classification, Knowledge Management, Community Outreach, Academic Research Support

Certifications
PRC Licensed Librarian, Digital Information Management Certificate

Education
Bachelor of Library and Information Science

Career Goals
Modernize Public Library Services, Expand Digital Knowledge Access, Lead National Information Literacy Programs`,
];

const analyzeMessages = [
  "Analyzing career history...",
  "Identifying transferable skills...",
  "Mapping alternate destinies...",
  "Building multiverse profiles...",
  "Calibrating destiny scores...",
];

type GenderOption = "female" | "male" | "prefer-not-to-say";

const GENDER_OPTIONS: { value: GenderOption; label: string }[] = [
  { value: "female",           label: "Female"           },
  { value: "male",             label: "Male"             },
  { value: "prefer-not-to-say", label: "Prefer Not to Say" },
];

// Maps user's gender selection to pronouns passed to all AI prompts
const GENDER_TO_PRONOUNS: Record<GenderOption, string> = {
  female:            "she/her",
  male:              "he/him",
  "prefer-not-to-say": "they/them",
};

export default function ResumeUpload({ transitionTo, updateState }: ResumeUploadProps) {
  const [resumeText, setResumeText] = useState("");
  const [gender, setGender] = useState<GenderOption | "">("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState(analyzeMessages[0]);

  const handleAnalyze = () => {
    if (!resumeText.trim()) return;
    setIsAnalyzing(true);
    const explicitPronouns = gender ? GENDER_TO_PRONOUNS[gender] : undefined;
    // New resume = new user — clear all previously generated AI content
    updateState({
      resumeText,
      selectedGender: gender || null,
      explicitPronouns: explicitPronouns || null,
      resumeAnalysis: null,
      allProfiles: {},
      allFutureSelves: {},
      portraits: {},
      legendarySelves: {},
      villainSelves: {},
      butterflyCache: undefined,
      cachedInvitations: {},
      invitationDecisions: {},
      transmissions: {},
      interviews: {},
      councilMessages: [],
      councilSpecials: [],
      councilConcluded: false,
      usedButterfly: false,
      butterFlyDecisions: [],
      historianLog: [],
      chronicleEditions: [],
      acceptedPositions: [],
      completionBonusGiven: [],
      stabilityMessage: null,
    });

    let i = 0;
    const iv = setInterval(() => {
      i++;
      if (i < analyzeMessages.length) {
        setAnalyzeMsg(analyzeMessages[i]);
      } else {
        clearInterval(iv);
        setTimeout(() => transitionTo("timeline-scan", { resumeText, explicitPronouns }), 600);
      }
    }, 700);
  };

  const pasteDemoProfile = () => {
    const picked = DEMO_PROFILES[Math.floor(Math.random() * DEMO_PROFILES.length)];
    setResumeText(picked);
  };

  const charCount = resumeText.length;
  const hasEnoughText = charCount > 100;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 64 }}>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px",
        background: "rgba(8,9,13,0.8)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <button
          onClick={() => transitionTo("landing")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 14, fontWeight: 500,
            cursor: "pointer", background: "none", border: "none", color: "var(--text2)",
            fontFamily: "Sora, sans-serif", transition: "color 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text2)"; }}
        >
          ← Back
        </button>
        <button onClick={() => transitionTo("landing")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)", fontFamily: "Sora, sans-serif" }}>
          <img src="/landing/logo.png" alt="LinkedOut" style={{ height: 26, width: "auto", display: "block" }} />
        </button>
      </nav>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: 680, margin: "0 auto", padding: "60px 40px" }}
      >
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 16 }}>
          Step 1 of 3
        </p>
        <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-1px", marginBottom: 8, color: "var(--text)" }}>
          Begin Your Journey
        </h2>
        <p style={{ color: "var(--text2)", marginBottom: 40, fontSize: 16, lineHeight: 1.6 }}>
          Paste your resume below. We&apos;ll figure out who you could&apos;ve been.
        </p>

        {!isAnalyzing ? (
          <>
            {/* Textarea */}
            <div style={{ position: "relative", marginBottom: 12 }}>
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder={`Paste your resume text here...\n\nInclude your work experience, skills, education, and achievements for the best multiverse results.`}
                rows={22}
                style={{
                  width: "100%",
                  minHeight: "60vh",
                  padding: "20px",
                  background: "var(--bg2)",
                  border: `1px solid ${hasEnoughText ? "var(--border2)" : "var(--border)"}`,
                  borderRadius: 16,
                  color: "var(--text)",
                  fontFamily: "Sora, sans-serif",
                  fontSize: 14,
                  lineHeight: 1.7,
                  outline: "none",
                  resize: "vertical",
                  transition: "border 0.2s",
                  caretColor: "var(--violet2)",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--violet)")}
                onBlur={e => (e.currentTarget.style.borderColor = hasEnoughText ? "var(--border2)" : "var(--border)")}
              />
              {/* Char count */}
              <div style={{
                position: "absolute", bottom: 12, right: 16,
                fontSize: 11, color: charCount > 50 ? "var(--text3)" : "var(--border3)",
                transition: "color 0.2s",
              }}>
                {charCount.toLocaleString()} chars
              </div>
            </div>

            {/* Helper text */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5, margin: 0, flex: 1 }}>
                Tip: Copy everything — job titles, bullet points, skills, dates. The more detail, the richer your alternate universe profiles.
              </p>
              <button
                type="button"
                onClick={pasteDemoProfile}
                style={{
                  flexShrink: 0,
                  padding: "7px 14px",
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--text2)",
                  fontFamily: "Sora, sans-serif",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.18s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "var(--border2)";
                  e.currentTarget.style.color = "var(--text)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text2)";
                }}
              >
                ✦ Paste Demo Career Profile
              </button>
            </div>

            {/* Gender selector */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: "block", fontSize: 12, fontWeight: 600,
                color: "var(--text3)", letterSpacing: "0.06em",
                textTransform: "uppercase", marginBottom: 10,
              }}>
                Gender
              </label>
              <div style={{ display: "flex", gap: 10 }} role="group" aria-label="Gender selection">
                {GENDER_OPTIONS.map(opt => {
                  const selected = gender === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setGender(selected ? "" : opt.value)}
                      aria-pressed={selected}
                      style={{
                        flex: 1, padding: "11px 8px", borderRadius: 10,
                        border: selected ? "1.5px solid var(--violet)" : "1px solid var(--border)",
                        background: selected ? "rgba(124,110,247,0.12)" : "var(--bg2)",
                        color: selected ? "var(--violet2)" : "var(--text3)",
                        fontSize: 13, fontWeight: selected ? 600 : 400,
                        fontFamily: "Sora, sans-serif", cursor: "pointer",
                        transition: "all 0.18s", minHeight: 44, touchAction: "manipulation",
                        boxShadow: selected ? "0 0 0 1px rgba(124,110,247,0.2)" : "none",
                      }}
                      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text2)"; } }}
                      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text3)"; } }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 8, lineHeight: 1.5, opacity: 0.7 }}>
                Used to generate matching pronouns and titles across all universes. Optional.
              </p>
            </div>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={!hasEnoughText}
              style={{
                width: "100%", padding: 16,
                background: hasEnoughText ? "var(--violet)" : "var(--surface)",
                border: "none", borderRadius: 12,
                color: hasEnoughText ? "#fff" : "var(--text3)",
                fontFamily: "Sora, sans-serif", fontSize: 15, fontWeight: 600,
                cursor: hasEnoughText ? "pointer" : "not-allowed",
                transition: "all 0.25s",
                opacity: hasEnoughText ? 1 : 0.5,
              }}
              onMouseEnter={e => {
                if (!hasEnoughText) return;
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = "var(--violet2)";
                b.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                if (!hasEnoughText) return;
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = "var(--violet)";
                b.style.transform = "translateY(0)";
              }}
            >
              {hasEnoughText ? "Analyze My Profile →" : "Paste your resume to continue"}
            </button>
          </>
        ) : (
          /* Analyzing state */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "60px 0" }}
          >
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "center", animation: "spin-slow 3s linear infinite" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="var(--violet2)" strokeWidth="1.2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="var(--violet2)" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </div>
            <p style={{ fontSize: 16, color: "var(--text2)", marginBottom: 8 }}>{analyzeMsg}</p>
            <p style={{ fontSize: 13, color: "var(--text3)" }}>This will just take a moment...</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
