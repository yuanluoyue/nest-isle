/**
 * 上传文件对象形状。
 * @nestjs/platform-fastify 的 FileInterceptor 会把 @fastify/multipart 的文件
 * 转换为与 Express Multer 兼容的形状（originalname/mimetype/buffer）。
 *
 * 单独放在独立文件中，避免 file.controller.ts 通过 file.service.ts 间接
 * 依赖 StorageAdapter 等模块导致 ESLint projectService 类型解析失败。
 */
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}
