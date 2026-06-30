import {
  Controller,
  Post,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { CurrentUser } from '../../core/auth/current-user.decorator';
import { FileService } from './file.service';
import type { UploadedFile } from '../../types/uploaded-file';

/**
 * @fastify/multipart 的 file() 方法返回的文件对象。
 * 注册 @fastify/multipart 后会扩展 FastifyRequest，但 ESLint projectService
 * 无法稳定解析该扩展，故显式声明用到的字段。
 */
interface MultipartFile {
  fieldname: string;
  filename: string;
  encoding: string;
  mimetype: string;
  toBuffer(): Promise<Buffer>;
}

/** 带 file() 方法的 request 形状 */
interface MultipartRequest {
  file(): Promise<MultipartFile | undefined>;
}

@ApiTags('文件')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '上传文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async upload(
    @Req() req: MultipartRequest,
    @CurrentUser() user: { id: string },
  ) {
    const file = await this.extractFile(req);
    return this.fileService.upload(file, user.id);
  }

  @Post('upload/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '上传头像' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadAvatar(
    @Req() req: MultipartRequest,
    @CurrentUser() user: { id: string },
  ) {
    const file = await this.extractFile(req);
    return this.fileService.upload(file, user.id, 'avatars');
  }

  private async extractFile(req: MultipartRequest): Promise<UploadedFile> {
    const data = await req.file();
    if (!data) {
      throw new BadRequestException('请选择文件');
    }
    const buffer = await data.toBuffer();
    return {
      fieldname: data.fieldname,
      originalname: data.filename,
      encoding: data.encoding,
      mimetype: data.mimetype,
      buffer,
      size: buffer.length,
    };
  }
}
