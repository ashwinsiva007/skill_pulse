export * from "./interfaces";
export * from "./local-repos";
// Export hybrid repository singletons as default repos
export {
  profileRepo,
  skillRepo,
  resumeRepo,
  roadmapRepo,
  opportunityRepo,
  applicationRepo,
  activityRepo,
} from "./hybrid-repos";
