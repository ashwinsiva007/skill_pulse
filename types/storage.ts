import { CandidateProfile } from "./profile";
import { Skill } from "./skill";
import { ResumeDraft } from "./resume";
import { RoadmapMilestone } from "./roadmap";
import { Opportunity } from "./opportunity";
import { JobApplication } from "./application";
import { ActivityItem } from "./activity";

export const STORAGE_VERSION = 1;
export const STORAGE_PREFIX = "skillpulse_mvp_v1";

export interface DemoDataset {
  version: number;
  lastInitialized: string;
  profile: CandidateProfile;
  skills: Skill[];
  resumes: ResumeDraft[];
  roadmap: RoadmapMilestone[];
  opportunities: Opportunity[];
  applications: JobApplication[];
  activities: ActivityItem[];
}
