import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { eq, and, isNull, ilike, desc, SQL } from 'drizzle-orm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { sysJob, sysJobLog } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { QueryJobDto } from './dto/query-job.dto';
import { QueryJobLogDto } from './dto/query-job-log.dto';

export interface JobHandler {
  name: string;
  execute: () => Promise<string>;
}

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);
  private readonly handlers = new Map<string, JobHandler>();

  constructor(
    private databaseService: DatabaseService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  private get db() {
    return this.databaseService.db;
  }

  /**
   * 注册任务处理器
   */
  registerHandler(handler: JobHandler) {
    this.handlers.set(handler.name, handler);
    this.logger.log(`Registered job handler: ${handler.name}`);
  }

  /**
   * 启动时加载所有运行中的任务
   */
  async loadRunningJobs() {
    const jobs = await this.db.query.sysJob.findMany({
      where: and(eq(sysJob.status, 1), isNull(sysJob.deletedAt)),
    });

    for (const job of jobs) {
      this.startCronJob(job.id, job.cron!, job.handler!);
    }
    this.logger.log(`Loaded ${jobs.length} running jobs`);
  }

  // ============ 任务 CRUD ============

  async findAll(query: QueryJobDto) {
    const { page = 1, pageSize = 10, name, group, handler, status } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [isNull(sysJob.deletedAt)];
    if (name) conditions.push(ilike(sysJob.name, `%${name}%`));
    if (group) conditions.push(ilike(sysJob.group, `%${group}%`));
    if (handler) conditions.push(ilike(sysJob.handler, `%${handler}%`));
    if (status !== undefined) conditions.push(eq(sysJob.status, status));

    const where = and(...conditions);

    const [list, countResult] = await Promise.all([
      this.db.query.sysJob.findMany({
        where,
        limit: pageSize,
        offset,
        orderBy: desc(sysJob.createdAt),
      }),
      this.db.select({ id: sysJob.id }).from(sysJob).where(where),
    ]);

    return { list, total: countResult.length, page, pageSize };
  }

  async findOne(id: string) {
    const job = await this.db.query.sysJob.findFirst({
      where: and(eq(sysJob.id, id), isNull(sysJob.deletedAt)),
    });
    if (!job) throw new NotFoundException('定时任务不存在');
    return job;
  }

  async create(dto: CreateJobDto) {
    const [created] = await this.db
      .insert(sysJob)
      .values({
        name: dto.name,
        group: dto.group ?? 'default',
        handler: dto.handler,
        cron: dto.cron,
        status: dto.status ?? 0,
        remark: dto.remark,
      })
      .returning();

    // 如果创建时状态为运行，立即启动
    if (created.status === 1) {
      this.startCronJob(created.id, created.cron!, created.handler!);
    }
    return created;
  }

  async update(id: string, dto: UpdateJobDto) {
    const existing = await this.findOne(id);

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.group !== undefined) updateData.group = dto.group;
    if (dto.handler !== undefined) updateData.handler = dto.handler;
    if (dto.cron !== undefined) updateData.cron = dto.cron;
    if (dto.remark !== undefined) updateData.remark = dto.remark;
    if (dto.status !== undefined) updateData.status = dto.status;

    const [updated] = await this.db
      .update(sysJob)
      .set(updateData)
      .where(eq(sysJob.id, id))
      .returning();

    // 处理调度变更
    if (dto.status !== undefined || dto.cron !== undefined) {
      // 先停止旧的
      this.stopCronJob(id);

      // 如果新状态为运行，重新启动
      if (updated.status === 1) {
        this.startCronJob(updated.id, updated.cron!, updated.handler!);
      }
    }

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    this.stopCronJob(id);
    await this.db
      .update(sysJob)
      .set({ deletedAt: new Date() })
      .where(eq(sysJob.id, id));
  }

  // ============ 任务启停 ============

  async start(id: string) {
    const job = await this.findOne(id);
    if (job.status === 1) return job;

    this.startCronJob(job.id, job.cron!, job.handler!);

    const [updated] = await this.db
      .update(sysJob)
      .set({ status: 1, updatedAt: new Date() })
      .where(eq(sysJob.id, id))
      .returning();
    return updated;
  }

  async stop(id: string) {
    const job = await this.findOne(id);
    if (job.status === 0) return job;

    this.stopCronJob(id);

    const [updated] = await this.db
      .update(sysJob)
      .set({ status: 0, updatedAt: new Date() })
      .where(eq(sysJob.id, id))
      .returning();
    return updated;
  }

  async runOnce(id: string) {
    const job = await this.findOne(id);
    await this.executeJob(job.id, job.handler!);
    return { success: true };
  }

  // ============ 任务日志 ============

  async findLogs(query: QueryJobLogDto) {
    const { page = 1, pageSize = 10, jobId, handler, status } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [];
    if (jobId) conditions.push(eq(sysJobLog.jobId, jobId));
    if (handler) conditions.push(ilike(sysJobLog.handler, `%${handler}%`));
    if (status !== undefined) conditions.push(eq(sysJobLog.status, status));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [list, countResult] = await Promise.all([
      this.db.query.sysJobLog.findMany({
        where,
        limit: pageSize,
        offset,
        orderBy: desc(sysJobLog.createdAt),
      }),
      this.db.select({ id: sysJobLog.id }).from(sysJobLog).where(where),
    ]);

    return { list, total: countResult.length, page, pageSize };
  }

  // ============ 私有方法 ============

  private startCronJob(jobId: string, cron: string, handlerName: string) {
    const jobName = `job_${jobId}`;
    try {
      const job = new CronJob(cron, () => {
        this.executeJob(jobId, handlerName);
      });
      this.schedulerRegistry.addCronJob(jobName, job);
      job.start();
      this.logger.log(`Started cron job: ${jobName} [${cron}]`);
    } catch (error) {
      this.logger.error(
        `Failed to start cron job ${jobName}: ${(error as Error).message}`,
      );
    }
  }

  private stopCronJob(jobId: string) {
    const jobName = `job_${jobId}`;
    try {
      this.schedulerRegistry.deleteCronJob(jobName);
      this.logger.log(`Stopped cron job: ${jobName}`);
    } catch {
      // 任务不存在则忽略
    }
  }

  private async executeJob(jobId: string, handlerName: string) {
    const startedAt = new Date();
    const handler = this.handlers.get(handlerName);

    if (!handler) {
      this.logger.warn(`Handler not found: ${handlerName}`);
      await this.writeLog(
        jobId,
        handlerName,
        1,
        null,
        `Handler not found: ${handlerName}`,
        startedAt,
        new Date(),
      );
      return;
    }

    try {
      const result = await handler.execute();
      await this.writeLog(
        jobId,
        handlerName,
        0,
        result,
        null,
        startedAt,
        new Date(),
      );
    } catch (error) {
      await this.writeLog(
        jobId,
        handlerName,
        1,
        null,
        (error as Error).message,
        startedAt,
        new Date(),
      );
    }
  }

  private async writeLog(
    jobId: string,
    handler: string,
    status: number,
    result: string | null,
    error: string | null,
    startedAt: Date,
    finishedAt: Date,
  ) {
    try {
      await this.db.insert(sysJobLog).values({
        jobId,
        handler,
        status,
        result,
        error,
        startedAt,
        finishedAt,
      });
    } catch (err) {
      this.logger.error(`Failed to write job log: ${(err as Error).message}`);
    }
  }
}
