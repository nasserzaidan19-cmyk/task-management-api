import { and, eq, SQL, sql } from "drizzle-orm";
import { db, projects, projectTags, tags, tasks } from "../db";
import {
  CreateProjectDto,
  Project,
  QueryPrams,
  UpdateProjectDto,
} from "../types";
import { ConflictError } from "../utils/errors";

/*
export class ProjectRepository extends InMemoryRepository<Project, CreateProjectDto, UpdateProjectDto> {
  // You can add project-specific methods here if needed
}
*/

export class ProjectRepository {
  async create(data: CreateProjectDto): Promise<Project> {
    const [project] = await db.insert(projects).values(data).returning();
    return project as Project;
  }

  async findById(id: string): Promise<Project | null> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return (project as Project) ?? null;
  }

  async findAll(
    params: QueryPrams,
  ): Promise<{ paginatedProjets: Project[]; total: number }> {
    const {
      page = params.page || 1,
      limit = params.limit || 10,
      sortBy = params.sortBy || "createdAt",
      order = params.order || "desc",
      ...filters
    } = params;

    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (filters.status) {
      conditions.push(eq(projects.status, filters.status));
    }
    if (filters.ownerId) {
      conditions.push(eq(projects.ownerId, filters.ownerId));
    }

    const paginatedProjets = await db
      .select()
      .from(projects)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(projects.createdAt);

    const [totalCount] = await db
      .select({ count: sql`count(*)` })
      .from(projects);

    return {
      paginatedProjets: paginatedProjets as Project[],
      total: Number(totalCount.count),
    };
  }

  async update(id: string, data: UpdateProjectDto): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set(data)
      .where(eq(projects.id, id))
      .returning();
    return project as Project;
  }

  async delete(id: string): Promise<Boolean> {
    const deleted = await db.transaction(async (tx) => {
      await tx.delete(projectTags).where(eq(projectTags.projectId, id));

      await tx.delete(tasks).where(eq(tasks.projectId, id));

      const result = await tx.delete(projects).where(eq(projects.id, id));
      return result.count > 0;
    });
    return deleted;
  }

  // project-tags managment

  async addTag(projectId: string, tagId: string): Promise<void> {
    try {
      await db.insert(projectTags).values({ projectId, tagId });
    } catch (error) {
      throw new ConflictError("this tag is already added to this project");
    }
  }

  async removeTag(projectId: string, tagId: string): Promise<Boolean> {
    const result = await db
      .delete(projectTags)
      .where(
        and(eq(projectTags.projectId, projectId), eq(projectTags.tagId, tagId)),
      );

    return result.count > 0;
  }

  async getProjectTags(
    projectId: string,
  ): Promise<{ id: string; name: string }[]> {
    const result = await db
      .select({ id: tags.id, name: tags.name })
      .from(projectTags)
      .innerJoin(tags, eq(projectTags.tagId, tags.id))
      .where(eq(projectTags.projectId, projectId));

    return result;
  }
}

// export class ProjectRelationRepository extends JunctionTableRepository {
//   async addTag(projectId: string, tagId: string): Promise<void> {
//     await this.add(projectId, tagId);
//   }

//   async removeTag(projectId: string, tagId: string): Promise<Boolean> {
//     return await this.remove(projectId, tagId);
//   }

//   async getProjectTags(projectId: string): Promise<string[]> {
//     const prefix = `${projectId}:`;
//     return Array.from(this.store)
//       .filter((key) => key.startsWith(prefix))
//       .map((key) => key.split(":")[1]);
//   }
// }
