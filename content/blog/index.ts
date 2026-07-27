import agentWorkflowMvp, { metadata as agentWorkflowMvpMetadata } from "./agent-workflow-mvp.mdx";
import contentLayerForMdx, {
  metadata as contentLayerForMdxMetadata
} from "./content-layer-for-mdx.mdx";
import fromEmptyRepoToSite, {
  metadata as fromEmptyRepoToSiteMetadata
} from "./from-empty-repo-to-site.mdx";
import responsiveReadingExperience, {
  metadata as responsiveReadingExperienceMetadata
} from "./responsive-reading-experience.mdx";

export const blogRegistry = {
  "agent-workflow-mvp": {
    Content: agentWorkflowMvp,
    metadata: agentWorkflowMvpMetadata
  },
  "content-layer-for-mdx": {
    Content: contentLayerForMdx,
    metadata: contentLayerForMdxMetadata
  },
  "from-empty-repo-to-site": {
    Content: fromEmptyRepoToSite,
    metadata: fromEmptyRepoToSiteMetadata
  },
  "responsive-reading-experience": {
    Content: responsiveReadingExperience,
    metadata: responsiveReadingExperienceMetadata
  }
} as const;
