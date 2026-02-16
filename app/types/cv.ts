// CV Data Types
// TypeScript interfaces for structured CV/resume data

export interface CVPersonalInfo {
  name: string
  title: string
  location: string
  email: string
  phone?: string
  website?: string
  linkedin?: string
}

export interface CVSkillCategory {
  category: string
  skills: string[]
}

export interface CVExperience {
  company: string
  role: string
  startDate: string
  endDate?: string // undefined = "Present"
  responsibilities: string[]
}

export interface CVEducation {
  institution: string
  degree: string
  field?: string
  startDate: string
  endDate: string
  description?: string
}

export interface CVProject {
  name: string
  description: string
  url?: string
}

export interface CVData {
  personal: CVPersonalInfo
  summary: string
  skills: CVSkillCategory[]
  experience: CVExperience[]
  education: CVEducation[]
  projects: CVProject[]
  interests?: string[]
}
